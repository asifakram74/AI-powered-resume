"use client"

import { useAppSelector } from "../../../lib/redux/hooks"
import { ProfileCardList } from "../../../pages/profile-card/ProfileCardList"

export default function Page() {
  const { user, profile } = useAppSelector((state) => state.auth)
  return <ProfileCardList user={profile as any} />
}
