import { NextResponse } from "next/server";
// Trocar para createRouteHandlerClient e persistir assinatura
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { mpCreatePreapproval } from "../../../../lib/mercadopago";

const PLANS = {
  basic: {
    amount: 10,
    reason: "Assinatura Avançado",
    planIdEnv: "MP_PLAN_ID_BASIC",
  },
  pro: {
    amount: 19,
    reason: "Assinatura Pro",
    planIdEnv: "MP_PLAN_ID_PRO",
  },
};

export async function POST(req) {
  try {
    const { plan } = await req.json();
    if (!plan || !(plan in PLANS)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Usuário não autenticado ou sem email" }, { status: 401 });
    }

    const cfg = PLANS[plan];
    const preapproval_plan_id = process.env[cfg.planIdEnv];

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const back_url = `${siteUrl}/planos`;
    const external_reference = `${plan}:${user.id}`;

    const created = await mpCreatePreapproval({
      preapproval_plan_id, // se existir, preço vem do plano do MP
      reason: cfg.reason,
      payer_email: user.email,
      amount: cfg.amount, // usado se não houver plano associado
      currency: "BRL",
      back_url,
      external_reference,
    });
    // Persistir
    try {
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        plan,
        status: created?.status || "authorized",
        mp_preapproval_id: created?.id,
        mp_plan_id: preapproval_plan_id || null,
        reason: cfg.reason,
      });
    } catch (e) {
      console.error("Falha ao salvar assinatura", e);
    }

    // Retorna init_point para redirecionar o usuário
    return NextResponse.json({ init_point: created.init_point, id: created.id });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}