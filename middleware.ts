import { authMiddleware, redirectToSignIn } from "@clerk/nextjs"
import { NextResponse } from "next/server"

// List of routes that don't require authentication
const publicRoutes = ["/", "/sign-in", "/sign-up", "/status/:slug*"]

// List of routes that require authentication but don't require an organization
const authRoutes = ["/organizations", "/setup"]

export default authMiddleware({
  publicRoutes: publicRoutes,
  afterAuth(auth, req) {
    const isPublic = publicRoutes.includes(req.nextUrl.pathname) || 
                    req.nextUrl.pathname.startsWith("/status/")
    const isAuthRoute = authRoutes.includes(req.nextUrl.pathname)
    const isApiRoute = req.nextUrl.pathname.startsWith("/api")

    // Handle unauthenticated users
    if (!auth.userId) {
      if (isPublic || isApiRoute) {
        return NextResponse.next()
      }
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    // Handle authenticated users
    if (auth.userId) {
      // If trying to access auth pages while signed in
      if (["/sign-in", "/sign-up"].includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/organizations", req.url))
      }

      // If on home page and authenticated, redirect to organizations
      if (req.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL("/organizations", req.url))
      }

      // If no organization and trying to access protected routes
      if (!auth.orgId && !isAuthRoute && !isPublic && !isApiRoute) {
        return NextResponse.redirect(new URL("/organizations", req.url))
      }
    }

    return NextResponse.next()
  },
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
