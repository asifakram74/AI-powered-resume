<?php

namespace App\Http\Controllers\API;

use App\Models\Profile;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

class ProfileController extends Controller
{
    public function index()
    {
        $profiles = Profile::where('user_id', Auth::id())->get();
        return response()->json($profiles);
    }

    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|string',
            'summary' => 'nullable|string',
            'social_links' => 'nullable|json',
            'additional_link' => 'nullable|url',
        ]);

        $profile = Profile::create([
            'user_id' => Auth::id(),
            'full_name' => $request->full_name,
            'job_title' => $request->job_title,
            'email' => $request->email,
            'phone' => $request->phone,
            'address' => $request->address,
            'city' => $request->city,
            'country' => $request->country,
            'profile_picture' => $request->profile_picture,
            'summary' => $request->summary,
            'social_links' => $request->social_links,
            'additional_link' => $request->additional_link,
            'public_slug' => $this->generateUniqueSlug($request->full_name),
        ]);

        return response()->json($profile, 201);
    }

    public function show($id)
    {
        $profile = Profile::where('user_id', Auth::id())->findOrFail($id);
        return response()->json($profile);
    }

    public function update(Request $request, $id)
    {
        $profile = Profile::where('user_id', Auth::id())->findOrFail($id);

        $request->validate([
            'full_name' => 'sometimes|required|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'country' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|string',
            'summary' => 'nullable|string',
            'social_links' => 'nullable|json',
            'additional_link' => 'nullable|url',
        ]);

        $profile->update($request->only([
            'full_name', 'job_title', 'email', 'phone', 'address', 'city', 'country', 'profile_picture', 'summary', 'social_links', 'additional_link'
        ]));

        return response()->json($profile);
    }

    public function destroy($id)
    {
        $profile = Profile::where('user_id', Auth::id())->findOrFail($id);
        $profile->delete();
        return response()->json(['message' => 'Profile deleted successfully']);
    }

    public function publicShow($slug)
    {
        $profile = Profile::where('public_slug', $slug)->first();

        if (!$profile) {
            abort(404, 'Profile not found');
        }

        return response()->json([
            'user_id' => $profile->user_id,
            'full_name' => $profile->full_name,
            'job_title' => $profile->job_title,
            'email' => $profile->email,
            'phone' => $profile->phone,
            'address' => $profile->address,
            'city' => $profile->city,
            'country' => $profile->country,
            'profile_picture' => $profile->profile_picture_url,
            'summary' => $profile->summary,
            'social_links' => $profile->social_links,
            'additional_link' => $profile->additional_link,
        ]);
    }

    public function publicShowCard($slug)
    {
        $profile = Profile::where('public_slug', $slug)->first();

        if (!$profile) {
            abort(404, 'Profile not found');
        }

        return view('profile.card', compact('profile'));
    }

    private function generateUniqueSlug($name)
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (Profile::where('public_slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        return $slug;
    }

    // POST /api/profile-card/{id}/profile-picture
    public function updateProfilePicture(Request $request, $id)
    {
        try {
            $profile = Profile::where('user_id', Auth::id())->findOrFail($id);

            $validated = $request->validate([
                'profile_picture' => 'required|image|mimes:jpg,jpeg,png,gif|max:2048',
            ]);

            // Check if profile already has a profile picture and delete the old file
            if ($profile->profile_picture) {
                $oldImagePath = $profile->profile_picture;
                if (Storage::disk('public')->exists($oldImagePath)) {
                    Storage::disk('public')->delete($oldImagePath);
                }
            }

            // Store image in storage/app/public/media
            $path = $request->file('profile_picture')->store('media', 'public');

            // Save file path in DB
            $profile->update(['profile_picture' => $path]);

            return response()->json([
                'status' => true,
                'message' => 'Profile picture updated successfully',
                'data' => [
                    'profile_picture_url' => '/storage/' . $path
                ]
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'error' => 'Profile not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'error' => 'Failed to upload profile picture',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
