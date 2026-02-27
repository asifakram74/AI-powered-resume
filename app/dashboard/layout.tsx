import { cookies } from "next/headers"
import ClientLayout from "./client-layout"

export default async function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return <ClientLayout defaultOpen={defaultOpen}>{children}</ClientLayout>
}
