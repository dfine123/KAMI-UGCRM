import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/creators/:path*",
    "/payments/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/api/creators/:path*",
    "/api/videos/:path*",
    "/api/payments/:path*",
    "/api/analytics/:path*",
    "/api/dashboard/:path*",
    "/api/users/:path*",
    "/api/tags/:path*",
    "/api/export/:path*",
  ],
};
