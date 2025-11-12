"use client";

import { useState } from "react";

const plans = [
  {
    code: "free",
    name: "Gratuito/Básico",
    priceLabel: "R$ 0/mês",
    price: 0,
    features: [
      "Cadastro de contratantes e fornecedores",
      "Criação de eventos",
      "Limite básico de registros",
    ],
    cta: "Começar grátis",
  },
  {
    code: "basic",
    name: "Avançado",
    priceLabel: "R$ 10/mês",
    price: 10,
    features: [
      "Tudo do Básico",
      "Relatórios e métricas avançadas",
      "Suporte prioritário",
    ],
    cta: "Assinar Avançado",
  },
  {
    code: "pro",
    name: "Pro",
    priceLabel: "R$ 19/mês",
    price: 19,
    features: [
      "Tudo do Avançado",
      "Limites elevados",
      "Futuras integrações premium",
    ],
    cta: "Assinar Pro",
  },
];

export default function PlanosPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  async function handleSubscribe(planCode) {
    setMessage(null);
    setLoading(true);
    try {
      if (planCode === "free") {
        // Fluxo gratuito: sem pagamento, apenas mensagem
        setMessage({ type: "success", text: "Plano Gratuito ativado! Você já pode usar o sistema." });
        return;
      }

      const res = await fetch("/api/mercadopago/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Falha ao iniciar assinatura");
      }
      if (data?.init_point) {
        // Redireciona o usuário ao checkout de assinatura do Mercado Pago
        window.location.href = data.init_point;
      } else {
        setMessage({ type: "error", text: "Retorno inesperado da API de assinatura." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6">Planos</h1>
      <p className="text-sm text-gray-600 mb-8">
        Escolha um plano. Assinaturas Avançado e Pro são mensais via Mercado Pago.
      </p>

      {message && (
        <div
          role="status"
          aria-live={message.type === "error" ? "assertive" : "polite"}
          className={`mb-6 p-3 rounded border ${
            message.type === "error"
              ? "bg-red-50 border-red-300 text-red-700"
              : "bg-green-50 border-green-300 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div key={p.code} className="border rounded-lg p-5 flex flex-col">
            <h2 className="text-lg font-medium">{p.name}</h2>
            <div className="text-xl mt-2">{p.priceLabel}</div>
            <ul className="mt-4 text-sm text-gray-700 space-y-1">
              {p.features.map((f, idx) => (
                <li key={idx}>• {f}</li>
              ))}
            </ul>
            <button
              onClick={() => handleSubscribe(p.code)}
              disabled={loading}
              className="mt-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Processando..." : p.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}