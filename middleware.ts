import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const isLoggedIn = request.cookies.get("logged_in")?.value === "true"

    // Root page: redirect based on auth state
    if (pathname === "/") {
        const destination = isLoggedIn ? "/dashboard/persona" : "/auth/signin"
        return NextResponse.redirect(new URL(destination, request.url))
    }

    // Auth pages: redirect to dashboard if already logged in
    if (pathname.startsWith("/auth/signin") || pathname.startsWith("/auth/signup")) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL("/dashboard/persona", request.url))
        }
    }

    // Dashboard root: redirect to persona
    if (pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/dashboard/persona", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/", "/auth/signin", "/auth/signup", "/dashboard"],
}
