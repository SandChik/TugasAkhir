import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Pembatasan akses per peran (FR-02):
 *  /admin/*  -> admin
 *  /asesor/* -> asesor
 *  /dosen/*  -> dosen
 */
export default withAuth(
  function middleware(req) {
    const peran = req.nextauth.token?.peran as string | undefined;
    const path = req.nextUrl.pathname;

    const wrongRole =
      (path.startsWith("/admin") && peran !== "admin") ||
      (path.startsWith("/asesor") && peran !== "asesor") ||
      (path.startsWith("/dosen") && peran !== "dosen");

    if (wrongRole) {
      const home = peran === "admin" ? "/admin" : peran === "asesor" ? "/asesor" : "/dosen";
      return NextResponse.redirect(new URL(home, req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: ["/dosen/:path*", "/asesor/:path*", "/admin/:path*"],
};
