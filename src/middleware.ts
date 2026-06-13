import { NextResponse, type NextRequest } from "next/server";

import { hasPublicSupabaseEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Sadece dashboard rotalarını korur.
 * Placeholder Supabase env kullanıldığında middleware sessizce pas geçer.
 */
export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  if (!hasPublicSupabaseEnv()) {
    return NextResponse.next();
  }

  const response = await updateSession(request);
  const isAuthenticated = response.headers.get("x-user-authenticated") === "true";

  if (!isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/giris";
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
