<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\CV;
use App\Models\CoverLetter;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AnalyticsController extends Controller
{
    // Track an event
    public function track(Request $request)
    {
        $validated = $request->validate([
            'resource_type'  => 'required|in:cv,cover_letter,profile_card',
            'resource_id'    => 'nullable|integer',
            'resource_key'   => 'nullable|string',
            'event_type'     => 'required|in:view,download,click,share,copy,qr_scan,scroll,directory_view,upgrade_click',
            'event_context'  => 'nullable|string',
            'referrer'       => 'nullable|string',
            'meta'           => 'nullable|array',
        ]);

        $resource = $this->resolveResource(
            $validated['resource_type'],
            $validated['resource_id'] ?? null,
            $validated['resource_key'] ?? null
        );

        if (!$resource) {
            return response()->json(['message' => 'Resource not found'], 404);
        }

        $viewer = $request->user();
        $ip = $request->ip();

        AnalyticsEvent::create([
            'resource_type'  => $validated['resource_type'],
            'resource_id'    => $resource->id,
            'event_type'     => $validated['event_type'],
            'event_context'  => $validated['event_context'] ?? null,
            'owner_id'       => $resource->user_id,
            'viewer_user_id' => $viewer?->id,
            'ip_hash'        => $ip ? hash('sha256', $ip) : null,
            'user_agent'     => $request->userAgent(),
            'referrer'       => $validated['referrer'] ?? $request->headers->get('referer'),
            'meta'           => $validated['meta'] ?? null,
        ]);

        return response()->json(['status' => true]);
    }

    // Summary for all resources of a user
    public function userSummary(Request $request, $userId = null)
    {
        $currentUser = $request->user();
        $userId = $userId ?? $currentUser->id;

        if ($currentUser->role !== 'Admin' && $currentUser->id != $userId) {
            return response()->json(['status' => 403, 'message' => 'Access denied'], 403);
        }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $query = AnalyticsEvent::where('owner_id', $userId);

        $summary = $this->buildSummary($query, $request);
        $summary['user'] = [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
        ];

        return response()->json($summary);
    }

    // Summary for a specific resource of a user
    public function userResource(Request $request, string $resourceType, int $resourceId)
    {
        $user = $request->user();
        $resource = $this->resolveResource($resourceType, $resourceId, null);

        if (!$resource || $resource->user_id !== $user->id) {
            return response()->json(['message' => 'Resource not found'], 404);
        }

        $query = AnalyticsEvent::where('resource_type', $resourceType)
            ->where('resource_id', $resource->id)
            ->where('owner_id', $user->id);

        $summary = $this->buildResourceSummary($query, $request, $resourceType, $resource->id);
        $summary['user'] = [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
        ];

        return response()->json($summary);
    }

    // Admin summary for all users
    public function adminSummary(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'Admin') {
            return response()->json(['status' => 403, 'message' => 'Access denied'], 403);
        }

        $query = AnalyticsEvent::query();

        if ($request->filled('user_id')) {
            $query->where('owner_id', $request->input('user_id'));
        }

        return response()->json($this->buildSummary($query, $request));
    }

    // Top resources (Admin)
    public function adminTop(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'Admin') {
            return response()->json(['status' => 403, 'message' => 'Access denied'], 403);
        }

        [$from, $to] = $this->getRange($request);
        $limit = (int) $request->input('limit', 10);

        $query = AnalyticsEvent::whereBetween('created_at', [$from, $to]);

        if ($request->filled('resource_type')) {
            $query->where('resource_type', $request->input('resource_type'));
        }

        if ($request->filled('user_id')) {
            $query->where('owner_id', $request->input('user_id'));
        }

        $results = $query
            ->selectRaw('resource_type, resource_id, owner_id, SUM(CASE WHEN event_type = "view" THEN 1 ELSE 0 END) as views, SUM(CASE WHEN event_type = "download" THEN 1 ELSE 0 END) as downloads, COUNT(*) as total')
            ->groupBy('resource_type', 'resource_id', 'owner_id')
            ->orderByDesc('total')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'resource_type' => $row->resource_type,
                'resource_id'   => (int) $row->resource_id,
                'owner_id'      => (int) $row->owner_id,
                'user'          => User::find($row->owner_id)->only('id', 'name', 'email'),
                'views'         => (int) $row->views,
                'downloads'     => (int) $row->downloads,
                'total'         => (int) $row->total,
            ]);

        return response()->json([
            'range' => [
                'from' => $from->toDateString(),
                'to'   => $to->toDateString(),
            ],
            'items' => $results,
        ]);
    }

    // ---------------- Admin Dashboard / Leaderboards ----------------
    public function adminDashboard(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'Admin') {
            return response()->json(['status' => 403, 'message' => 'Access denied'], 403);
        }

        [$from, $to] = $this->getRange($request);
        $limit = (int) $request->input('limit', 10);

        $query = AnalyticsEvent::whereBetween('created_at', [$from, $to]);

        // Most viewed CVs
        $topCVs = (clone $query)
            ->where('resource_type', 'cv')
            ->where('event_type', 'view')
            ->selectRaw('resource_id, owner_id, COUNT(*) as views')
            ->groupBy('resource_id', 'owner_id')
            ->orderByDesc('views')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'cv_id' => $row->resource_id,
                'owner' => User::find($row->owner_id)->only('id','name','email'),
                'views' => (int) $row->views,
            ]);

        // Most downloaded cover letters
        $topCoverLetters = (clone $query)
            ->where('resource_type', 'cover_letter')
            ->where('event_type', 'download')
            ->selectRaw('resource_id, owner_id, COUNT(*) as downloads')
            ->groupBy('resource_id', 'owner_id')
            ->orderByDesc('downloads')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'cover_letter_id' => $row->resource_id,
                'owner' => User::find($row->owner_id)->only('id','name','email'),
                'downloads' => (int) $row->downloads,
            ]);

        // Most shared profiles
        $topProfiles = (clone $query)
            ->where('resource_type', 'profile_card')
            ->where('event_type', 'share')
            ->selectRaw('resource_id, owner_id, COUNT(*) as shares')
            ->groupBy('resource_id', 'owner_id')
            ->orderByDesc('shares')
            ->limit($limit)
            ->get()
            ->map(fn($row) => [
                'profile_id' => $row->resource_id,
                'owner' => User::find($row->owner_id)->only('id','name','email'),
                'shares' => (int) $row->shares,
            ]);

        // All event types per user (optional)
        $userId = $request->input('user_id');
        $eventsByUser = null;
        if ($userId) {
            $eventsByUser = (clone $query)
                ->where('owner_id', $userId)
                ->selectRaw('event_type, COUNT(*) as count')
                ->groupBy('event_type')
                ->get()
                ->mapWithKeys(fn($row) => [$row->event_type => (int)$row->count]);
        }

        return response()->json([
            'range' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'top_cvs' => $topCVs,
            'top_cover_letters' => $topCoverLetters,
            'top_profiles' => $topProfiles,
            'events_by_user' => $eventsByUser,
        ]);
    }

    // ---------------- Helper Methods ----------------

    private function buildSummary($query, Request $request): array
    {
        [$from, $to] = $this->getRange($request);
        $base = (clone $query)->whereBetween('created_at', [$from, $to]);

        $totals = (clone $base)
            ->whereIn('event_type', ['view','download'])
            ->selectRaw('event_type, COUNT(*) as count')
            ->groupBy('event_type')
            ->pluck('count','event_type');

        $byResourceTypeRows = (clone $base)
            ->whereIn('event_type', ['view','download'])
            ->selectRaw('resource_type, event_type, COUNT(*) as count')
            ->groupBy('resource_type','event_type')
            ->get();

        $byResourceType = [];
        foreach ($byResourceTypeRows as $row) {
            $byResourceType[$row->resource_type][$row->event_type] = (int)$row->count;
        }

        $dailyRows = (clone $base)
            ->whereIn('event_type', ['view','download'])
            ->selectRaw('DATE(created_at) as date, event_type, COUNT(*) as count')
            ->groupBy('date','event_type')
            ->orderBy('date')
            ->get();

        $daily = [];
        foreach ($dailyRows as $row) {
            $daily[$row->date][$row->event_type] = (int)$row->count;
        }

        $dailySeries = [];
        foreach ($daily as $date => $counts) {
            $dailySeries[] = [
                'date' => $date,
                'views' => $counts['view'] ?? 0,
                'downloads' => $counts['download'] ?? 0,
            ];
        }

        return [
            'range' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'totals' => [
                'views' => (int) ($totals['view'] ?? 0),
                'downloads' => (int) ($totals['download'] ?? 0),
            ],
            'by_resource_type' => $this->normalizeByResourceType($byResourceType),
            'daily' => $dailySeries,
        ];
    }

    private function buildResourceSummary($query, Request $request, string $resourceType, int $resourceId): array
    {
        [$from, $to] = $this->getRange($request);
        $base = (clone $query)->whereBetween('created_at', [$from,$to]);

        $totals = (clone $base)
            ->whereIn('event_type',['view','download'])
            ->selectRaw('event_type, COUNT(*) as count')
            ->groupBy('event_type')
            ->pluck('count','event_type');

        $dailyRows = (clone $base)
            ->whereIn('event_type',['view','download'])
            ->selectRaw('DATE(created_at) as date, event_type, COUNT(*) as count')
            ->groupBy('date','event_type')
            ->orderBy('date')
            ->get();

        $daily = [];
        foreach ($dailyRows as $row) {
            $daily[$row->date][$row->event_type] = (int)$row->count;
        }

        $dailySeries = [];
        foreach ($daily as $date => $counts) {
            $dailySeries[] = [
                'date' => $date,
                'views' => $counts['view'] ?? 0,
                'downloads' => $counts['download'] ?? 0,
            ];
        }

        return [
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'range' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'totals' => [
                'views' => (int) ($totals['view'] ?? 0),
                'downloads' => (int) ($totals['download'] ?? 0),
            ],
            'daily' => $dailySeries,
        ];
    }

    private function getRange(Request $request): array
    {
        $days = max((int)$request->input('days',30),1);

        $to = $request->filled('to')
            ? Carbon::parse($request->input('to'))->endOfDay()
            : now()->endOfDay();

        $from = $request->filled('from')
            ? Carbon::parse($request->input('from'))->startOfDay()
            : $to->copy()->subDays($days-1)->startOfDay();

        return [$from,$to];
    }

    private function normalizeByResourceType(array $byResourceType): array
    {
        $resourceTypes = ['cv','cover_letter','profile_card'];
        $result = [];
        foreach ($resourceTypes as $type) {
            $result[$type] = [
                'views' => $byResourceType[$type]['view'] ?? 0,
                'downloads' => $byResourceType[$type]['download'] ?? 0,
            ];
        }
        return $result;
    }

    private function resolveResource(string $resourceType, ?int $resourceId, ?string $resourceKey)
    {
        return match($resourceType) {
            'cv' => $resourceId ? CV::find($resourceId) : CV::where('public_slug',$resourceKey)->first(),
            'cover_letter' => $resourceId ? CoverLetter::find($resourceId) : CoverLetter::where('public_slug',$resourceKey)->first(),
            'profile_card' => $resourceId ? Profile::find($resourceId) : Profile::where('public_slug',$resourceKey)->first(),
            default => null,
        };
    }
}
