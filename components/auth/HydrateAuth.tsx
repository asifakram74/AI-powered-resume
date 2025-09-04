"use client"

import { useEffect } from "react"
import { useAppDispatch } from "../../lib/redux/hooks"
import { setCredentials } from "../../lib/redux/slices/authSlice"

export default function HydrateAuth() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")

    if (token && user) {
      dispatch(setCredentials({ token, user: JSON.parse(user) }))
    }
  }, [dispatch])

  return null
}
