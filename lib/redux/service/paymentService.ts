import { api } from "../../api"

export type CheckoutSessionResponse = {
  url: string
}

export const createCheckoutSession = async (): Promise<CheckoutSessionResponse> => {
  // Use the configured axios client base URL
  const response = await api.post("/create-checkout-session", {})
  return response.data
}

export const verifyCheckoutSession = async (sessionId: string): Promise<{ status: string; plan?: string }> => {
  const response = await api.get(`/payment-success`, { params: { session_id: sessionId } })
  return response.data
}