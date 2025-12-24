import { api } from "../../api"

export const createCheckoutSession = async (): Promise<void> => {
  const userToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!userToken) {
    throw new Error("Please sign in to upgrade.");
  }

  try {
    const response = await fetch("https://stagingbackend.resumaic.com/api/create-checkout-session", {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${userToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    let data: any = null;
    try {
      data = await response.json();
    } catch (_) {
      // If response is not JSON, attempt to read text for debugging
      try {
        const text = await response.text();
        data = text ? { message: text } : null;
      } catch {
        data = null;
      }
    }

    if (response.ok && data?.url) {
      window.location.href = data.url;
      return;
    }

    const status = response.status;
    const message =
      (data && (data.message || data.error || data.detail)) ||
      "Failed to create checkout session";

    if (status >= 500) {
      console.error("Checkout session server error:", status, message);
    }

    throw new Error(message);
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to create checkout session");
  }
};

export const verifyCheckoutSession = async (
  sessionId: string
): Promise<{ status: string; plan?: string }> => {
  const response = await api.get(`/payment-success`, { params: { session_id: sessionId } });
  return response.data;
}