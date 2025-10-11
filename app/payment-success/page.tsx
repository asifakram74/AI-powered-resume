"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Crown, ShieldCheck, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { verifyCheckoutSession } from "../../lib/redux/service/paymentService";

export default function PaymentSuccessPage() {
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-900">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-3">
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
              </div>
            ) : isSuccess ? (
              <CheckCircle2 className="h-14 w-14 mx-auto text-emerald-500" />
            ) : (
              <ShieldCheck className="h-14 w-14 mx-auto text-amber-500" />
            )}
            <CardTitle className="text-2xl">{isSuccess ? "Payment Successful" : loading ? "Verifying Payment" : "Payment Status"}</CardTitle>
            <CardDescription>
              {loading && "Hang tight while we verify your payment..."}
              {!loading && isSuccess && "Your subscription is now active. Enjoy premium features!"}
              {!loading && !isSuccess && status === "missing" && "Missing session details. If you reached this page by mistake, return to dashboard."}
              {!loading && status === "error" && "We couldn’t verify your payment. Please try again or contact support."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-medium">Premium Access</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Unlock ATS checks, AI CV optimization, and more.</p>
              </div>
              <div className="p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <p className="font-medium">Faster Workflows</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Priority AI tasks and quicker exports.</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <p className="font-medium">Secure Payments</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Protected via trusted payment gateways.</p>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
                <p className="font-medium">{plan || "Premium"}</p>
              </div>
              <div className="flex gap-3">
                <Link href="/dashboard">
                  <Button className="resumaic-gradient-green">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">Manage Subscription</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}