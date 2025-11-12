import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { mpUpdatePreapprovalStatus } from "../../../../lib/mercadopago";

export async function POST(req) {
  try {
    const { id } = await req.json(); // mp_preapproval_id

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    let preapprovalId = id;
    if (!preapprovalId) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("mp_preapproval_id, status")
        .eq("user_id", user.id)
        .in("status", ["authorized", "active"]) // status elegíveis
        .limit(1)
        .single();
      preapprovalId = sub?.mp_preapproval_id;
    }

    if (!preapprovalId) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 });
    }

    const updated = await mpUpdatePreapprovalStatus(preapprovalId, "cancelled");
    await supabase
      .from("subscriptions")
      .update({ status: updated.status })
      .eq("mp_preapproval_id", preapprovalId);

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}