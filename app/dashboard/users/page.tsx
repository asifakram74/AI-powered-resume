"use client"

import { useAppSelector } from "../../../lib/redux/hooks"
import { UserList } from "../../../pages/UsersManagement/UserList"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import CreatePersonaPage from "../../../pages/persona/PersonaList"

export default function Page() {
  const { user } = useAppSelector((state) => state.auth)
  
  const isAdmin = user?.role?.toLowerCase() === "admin"
  
  if (!isAdmin) {
      return <CreatePersonaPage user={user} />
  }

  return <UserList user={user} />
}
