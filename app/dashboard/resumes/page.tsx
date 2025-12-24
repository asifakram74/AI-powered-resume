"use client"

import { useAppSelector } from "../../../lib/redux/hooks"
import { ResumePage } from "../../../pages/resume/ResumeList"

export default function Page() {
  const { user } = useAppSelector((state) => state.auth)
  return <ResumePage user={user} />
}
