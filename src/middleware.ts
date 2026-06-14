import { NextResponse, type NextRequest } from "next/server";

import { isAdmin } from "@/lib/admin";
import { hasPublicSupabaseEnv } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Sadece dashboard rotalarını korur.
 * Placeholder Supabase env kullanıldığında middleware sessizce pas geçer.
 */
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isAdminRoute = pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin");

  if (!isDashboardRoute && !isAdminRoute) {
    return NextResponse.next();
  }

  if (!hasPublicSupabaseEnv()) {
    return NextResponse.next();
  }

  const response = await updateSession(request);
  const isAuthenticated = response.headers.get("x-user-authenticated") === "true";
  const userEmail = response.headers.get("x-user-email") ?? "";
  const adminUser = isAdmin(userEmail);

  if (isAdminRoute && (!isAuthenticated || !adminUser)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAuthenticated ? "/dashboard" : "/giris";
    if (!isAuthenticated) {
      redirectUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(redirectUrl);
  }

  if (isDashboardRoute && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/giris";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"]
};
