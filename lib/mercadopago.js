import fetch from "node-fetch";

const MP_BASE = "https://api.mercadopago.com";

function getAccessToken() {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error("MP_ACCESS_TOKEN não configurado");
  return token;
}

export async function mpCreatePreapproval({ preapproval_plan_id, reason, payer_email, amount, currency = "BRL", back_url, external_reference }) {
  const url = `${MP_BASE}/preapproval`;
  const auto_recurring = {
    frequency: 1,
    frequency_type: "months",
    currency_id: currency,
  };
  if (!preapproval_plan_id) {
    // Sem plano associado: valor dinâmico conforme seleção do usuário
    auto_recurring.transaction_amount = amount;
  }
  const body = {
    preapproval_plan_id,
    reason,
    payer_email,
    auto_recurring,
    back_url,
    status: "authorized",
    external_reference,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Falha ao criar preapproval");
  }
  return data; // contém init_point
}

export async function mpGetPreapproval(preapproval_id) {
  const url = `${MP_BASE}/preapproval/${preapproval_id}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Falha ao consultar preapproval");
  }
  return data;
}

// Remover dependência de node-fetch e usar fetch global
export async function mpUpdatePreapprovalStatus(preapproval_id, status) {
  const url = `${MP_BASE}/preapproval/${preapproval_id}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Falha ao atualizar preapproval");
  }
  return data;
}