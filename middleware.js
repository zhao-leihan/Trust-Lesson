import { NextResponse } from "next/server";

export function middleware(request) {
  const host = request.headers.get("host") || "";
  const devLocalIp = process.env.DEV_LOCAL_IP || process.env.NEXT_PUBLIC_DEV_LOCAL_IP;

  // Automatically redirect configured dev local IP to localhost
  if (devLocalIp && host.includes(devLocalIp)) {
    const newHost = host.replace(devLocalIp, "localhost");
    const proto = request.headers.get("x-forwarded-proto") || "http";
    const redirectUrl = new URL(
      `${proto}://${newHost}${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(redirectUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
