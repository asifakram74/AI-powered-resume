// app/page.tsx — Fallback only; middleware handles redirect before this renders
import { redirect } from "next/navigation"

export default function Home() {
  redirect("/auth/signin")
}
