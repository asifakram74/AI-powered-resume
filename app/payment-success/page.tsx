"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Crown,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { verifyCheckoutSession } from "../../lib/redux/service/paymentService";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
          <Card className="shadow-xl border-0 w-full max-w-md text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-3" />
            <CardTitle className="text-2xl font-semibold">
              Verifying Payment
            </CardTitle>
            <CardDescription>
              Hang tight while we verify your payment...
            </CardDescription>
          </Card>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("pending");
  const [plan, setPlan] = useState<string | undefined>(undefined);

  useEffect(() => {
    const sessionId = params?.get("session_id");
    if (!sessionId) {
      setLoading(false);
      setStatus("missing");
      return;
    }

    const run = async () => {
      try {
        const res = await verifyCheckoutSession(sessionId);
        setStatus(res.status || "success");
        setPlan(res.plan);
      } catch (e) {
        console.error("Failed to verify payment session", e);
        setStatus("error");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [params]);

  const isSuccess = status === "success" || status === "completed";

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900 flex items-center justify-center px-6 py-12">
      <Card className="shadow-xl border-0 w-full max-w-3xl">
        <CardHeader className="text-center space-y-3">
          {loading ? (
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500 mx-auto" />
          ) : isSuccess ? (
            <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
          ) : (
            <ShieldCheck className="h-14 w-14 mx-auto text-amber-500" />
          )}

          <CardTitle className="text-2xl font-semibold">
            {isSuccess
              ? "Payment Successful"
              : loading
              ? "Verifying Payment"
              : "Payment Status"}
          </CardTitle>

          <CardDescription className="text-base">
            {loading && "Hang tight while we verify your payment..."}
            {!loading &&
              isSuccess &&
              "Your subscription is now active — enjoy all premium features!"}
            {!loading &&
              !isSuccess &&
              status === "missing" &&
              "Missing session details. If you reached this page by mistake, return to dashboard."}
            {!loading &&
              status === "error" &&
              "We couldn’t verify your payment. Please try again or contact support."}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mt-4">
            <FeatureCard
              icon={<Crown className="h-5 w-5 text-emerald-600" />}
              title="Premium Access"
              description="Unlock ATS checks, AI CV optimization, and more."
              color="emerald"
            />
            <FeatureCard
              icon={<Sparkles className="h-5 w-5 text-indigo-600" />}
              title="Faster Workflows"
              description="Priority AI tasks and quicker exports."
              color="indigo"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5 text-amber-600" />}
              title="Secure Payments"
              description="Protected via trusted payment gateways."
              color="amber"
            />
          </div>

          <Separator className="my-6" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
              <p className="font-medium">{plan || "Premium"}</p>
            </div>

            <Link href="/dashboard">
              <Button className="resumaic-gradient-green">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  const bg = {
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
  }[color];

  return (
    <div className={`p-4 rounded-lg ${bg}`}>
      <div className="flex items-center gap-3">
        {icon}
        <p className="font-medium">{title}</p>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
        {description}
      </p>
    </div>
  );
}
