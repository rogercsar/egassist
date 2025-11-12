import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { mpGetPreapproval } from "../../../../lib/mercadopago";

function verifyToken(url) {
  const token = process.env.MP_WEBHOOK_VERIFICATION_TOKEN;
  if (!token) return true;
  const u = new URL(url);
  return u.searchParams.get("token") === token;
}

export async function POST(req) {
  try {
    if (!verifyToken(req.url)) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const body = await req.json();
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || body?.type;
    const id = url.searchParams.get("id") || body?.id || body?.data?.id;

    if (type === "preapproval" && id) {
      const sub = await mpGetPreapproval(id);
      // Atualiza status da assinatura
      await supabase
        .from("subscriptions")
        .update({ status: sub.status })
        .eq("mp_preapproval_id", id);
      console.log("Webhook preapproval", { id, status: sub.status });
    } else {
      console.log("Webhook recebido", { type, id, body });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}