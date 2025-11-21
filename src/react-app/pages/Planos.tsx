import { useAuth } from "@getmocha/users-service/react";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { Check, X, Zap, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export default function Planos() {
  const { user, redirectToLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const plans = [
    {
      name: "Básico",
      price: "Grátis",
      priceValue: 0,
      description: "Perfeito para começar",
      features: [
        { text: "Até 5 eventos por mês", included: true },
        { text: "Gestão básica de eventos", included: true },
        { text: "Cadastro de contratantes", included: true },
        { text: "Cadastro de fornecedores", included: true },
        { text: "Dashboard simples", included: true },
        { text: "Templates de checklist", included: false },
        { text: "Controle financeiro completo", included: false },
        { text: "Vencimentos a receber/pagar", included: false },
        { text: "Relatórios e análises", included: false },
        { text: "Suporte prioritário", included: false },
      ],
      cta: "Começar Grátis",
      highlight: false,
    },
    {
      name: "Avançado",
      price: "R$ 9,90",
      priceValue: 9.90,
      period: "/mês",
      description: "Para profissionais em crescimento",
      features: [
        { text: "Eventos ilimitados", included: true },
        { text: "Gestão completa de eventos", included: true },
        { text: "Cadastro de contratantes", included: true },
        { text: "Cadastro de fornecedores", included: true },
        { text: "Dashboard avançado", included: true },
        { text: "Templates de checklist", included: true },
        { text: "Controle financeiro completo", included: true },
        { text: "Vencimentos a receber/pagar", included: true },
        { text: "Relatórios básicos", included: true },
        { text: "Suporte por e-mail", included: true },
      ],
      cta: "Assinar Avançado",
      highlight: true,
    },
    {
      name: "Pro",
      price: "R$ 19,90",
      priceValue: 19.90,
      period: "/mês",
      description: "Para empresas e produtoras",
      features: [
        { text: "Eventos ilimitados", included: true },
        { text: "Gestão completa de eventos", included: true },
        { text: "Cadastro de contratantes", included: true },
        { text: "Cadastro de fornecedores", included: true },
        { text: "Dashboard avançado com métricas", included: true },
        { text: "Templates de checklist ilimitados", included: true },
        { text: "Controle financeiro completo", included: true },
        { text: "Vencimentos a receber/pagar", included: true },
        { text: "Relatórios e análises avançadas", included: true },
        { text: "Suporte prioritário", included: true },
        { text: "Exportação de dados", included: true },
        { text: "API para integrações", included: true },
      ],
      cta: "Assinar Pro",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          
          <div className="text-center">
            <img 
              src="https://mocha-cdn.com/019a91b8-5848-7ccf-8d6c-a1c3ea6b0c64/evassist.png" 
              alt="EG Assist" 
              className="w-32 mx-auto mb-6 rounded-xl"
            />
            <h1 className="text-5xl font-bold text-white mb-4">
              Escolha Seu Plano
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Comece grátis e faça upgrade quando precisar de mais recursos
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border
                ${plan.highlight 
                  ? 'border-amber-500 shadow-2xl shadow-amber-500/20 transform scale-105' 
                  : 'border-white/20'
                }
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                  Mais Popular
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-slate-300 text-sm mb-4">{plan.description}</p>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-slate-300 ml-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "text-slate-200" : "text-slate-500"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={redirectToLogin}
                className={`
                  w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300
                  ${plan.highlight
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30 hover:scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }
                `}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Perguntas Frequentes sobre Planos
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Posso mudar de plano depois?
                </h3>
                <p className="text-slate-300">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. 
                  As mudanças serão aplicadas imediatamente.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  O que acontece se eu ultrapassar o limite do plano Básico?
                </h3>
                <p className="text-slate-300">
                  Você será notificado quando atingir o limite de 5 eventos. Para criar mais eventos, 
                  basta fazer upgrade para o plano Avançado ou Pro.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Como funciona o pagamento?
                </h3>
                <p className="text-slate-300">
                  Os planos pagos são cobrados mensalmente via cartão de crédito. 
                  Você pode cancelar a qualquer momento sem multas ou taxas adicionais.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Há desconto para pagamento anual?
                </h3>
                <p className="text-slate-300">
                  Sim! Entre em contato conosco para saber sobre descontos especiais 
                  para planos anuais e para equipes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="max-w-4xl mx-auto mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-green-500/20 border border-green-500/30 text-green-300 px-6 py-3 rounded-full">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">
              Garantia de 7 dias - Satisfação total ou seu dinheiro de volta
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
