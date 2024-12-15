import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: ["/", "/status", "/status/(.*)", "/sign-in", "/sign-up"],
  // Enable organization features
  ignoredRoutes: ["/status", "/status/(.*)", "/api/status", "/sign-in", "/sign-up"],
  beforeAuth: (req) => {
    // console.log("beforeAuth", req.url)
  },
  afterAuth: (auth, req) => {
    // console.log("afterAuth", auth, req.url)
  }
});
 
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
