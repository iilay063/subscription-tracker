import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/sign-in"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.includes(pathname)) return;
  if (pathname.startsWith("/api/auth")) return;
  if (pathname.startsWith("/api/cron")) return; // gated by CRON_SECRET
  if (!req.auth) {
    const url = new URL("/sign-in", req.url);
    return NextResponse.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
