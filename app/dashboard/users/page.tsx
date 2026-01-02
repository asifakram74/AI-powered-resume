"use client"

import { useAppSelector } from "../../../lib/redux/hooks"
import { UserList } from "../../../pages/UsersManagement/UserList"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import CreatePersonaPage from "../../../pages/persona/PersonaList"

export default function Page() {
  const { profile } = useAppSelector((state) => state.auth)
  
  const isAdmin = profile?.role?.toLowerCase() === "admin"
  
  if (!isAdmin) {
      return <CreatePersonaPage user={profile as any} />
  }

  return <UserList user={profile as any} />
}
