"use client"

import { useAppSelector } from "../../../lib/redux/hooks"
import { CoverLetterPage } from "../../../pages/cover-letter/CoverLetterList"

export default function Page() {
  const { user, profile } = useAppSelector((state) => state.auth)
  return <CoverLetterPage user={user as any} />
}
