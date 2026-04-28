import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";

  // PRIORIDADE 0: WHITELIST DE CRAWLERS SOCIAIS (ERRO 403 FIX)
  if (/facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|TelegramBot/i.test(userAgent)) {
    return NextResponse.next();
  }

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
    console.error('Proxy auth error:', err);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/noticia/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
