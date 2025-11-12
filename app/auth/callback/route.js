import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/eventos";
  const supabase = createRouteHandlerClient({ cookies });

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${url.origin}${next}`);
}