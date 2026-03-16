import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth token — this is critical for server components
  // Do NOT use supabase.auth.getSession() here as it doesn't refresh tokens
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Auth pages — redirect logged-in users away
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password");

  // Role-select is special: only for logged-in users without a role yet
  const isRoleSelect = pathname.startsWith("/role-select");

  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/runner") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/book");

  // Email verification check — block unverified users from protected routes
  const isVerifyPage = pathname.startsWith("/verify-email");
  const emailConfirmed = user?.email_confirmed_at != null;

  if (user && !emailConfirmed && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/verify-email";
    return NextResponse.redirect(url);
  }

  // Redirect verified users away from verify-email page
  if (user && emailConfirmed && isVerifyPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users from protected routes to login
  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users from role-select to login
  if (!user && isRoleSelect) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthPage) {
    // Look up their role to redirect to the right place
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (!profile?.role) {
      url.pathname = "/role-select";
    } else if (profile.role === "runner") {
      url.pathname = "/runner";
    } else if (profile.role === "admin") {
      url.pathname = "/admin";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // Role-based route protection for authenticated users
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role;

    // No role yet → send to role-select
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/role-select";
      return NextResponse.redirect(url);
    }

    // Admin can access everything
    if (role === "admin") {
      return supabaseResponse;
    }

    // Customers cannot access /runner or /admin routes
    if (role === "customer" && (pathname.startsWith("/runner") || pathname.startsWith("/admin"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Runners cannot access /admin routes, but CAN access /dashboard (for their own view) and /book
    if (role === "runner" && pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/runner";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
