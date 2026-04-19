import { NextResponse, type NextRequest } from "next/server";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/edgeAuth";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // autoriser la page de login et ses assets
  if (pathname.startsWith("/admin/login")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  const valid = await verifyAdminToken(token, process.env.ADMIN_SESSION_SECRET);
  if (!valid) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
