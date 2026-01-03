"use client"

import { useAppSelector } from "../../../lib/redux/hooks"
import CreatePersonaPage from "../../../pages/persona/PersonaList"

export default function Page() {
  const { user, profile } = useAppSelector((state) => state.auth)
  return <CreatePersonaPage user={profile as any} />
}
