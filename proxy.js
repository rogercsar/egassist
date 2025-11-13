import { NextResponse } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function proxy(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const protectedPaths = ["/dashboard", "/eventos", "/contratantes", "/fornecedores", "/modelos", "/calendario"];
  const isProtected = protectedPaths.some((p) => req.nextUrl.pathname.startsWith(p));

  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    const nextPath = req.nextUrl.pathname + req.nextUrl.search;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/eventos/:path*", "/contratantes/:path*", "/fornecedores/:path*", "/modelos/:path*", "/calendario/:path*"],
};