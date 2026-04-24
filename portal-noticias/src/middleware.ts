import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only gate /admin routes
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Allow login page without auth
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // 1. Se estiver logado e tentar acessar a página de login, vai para o dashboard
    if (session && pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    // 2. Se NÃO estiver logado e tentar acessar qualquer rota admin (que não seja login), vai para o login
    if (!session && pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch (err) {
    console.error('Middleware auth error:', err);
    // Allow access if Supabase is not configured
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
