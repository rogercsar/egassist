import { useAuth } from "@getmocha/users-service/react";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { Calendar, CheckSquare, TrendingUp, Loader2, Users, Shield, Zap, Star, ChevronDown, Mail, Phone, MapPin } from "lucide-react";

export default function Home() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const handleGoogleLogin = async () => {
    try {
      const res = await fetch('/api/oauth/google/redirect_url');
      const data = await res.json();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (e) {
      // noop
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <img 
            src="https://mocha-cdn.com/019a91b8-5848-7ccf-8d6c-a1c3ea6b0c64/evassist.png" 
            alt="EG Assist" 
            className="w-64 mx-auto mb-8 rounded-2xl shadow-2xl shadow-amber-500/20"
          />
          <h1 className="text-5xl font-bold text-white mb-4">
            O Seu Gestor de Eventos Pro
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Gerencie eventos, finanças e tarefas em uma plataforma moderna e intuitiva
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleGoogleLogin}
              className="inline-block bg-white text-slate-900 hover:bg-slate-100 font-semibold px-8 py-4 rounded-lg text-lg shadow-lg transition-all duration-300 hover:scale-105"
            >
              Entrar com Google
            </button>
            <Link
              to="/planos"
              className="inline-block bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-4 rounded-lg text-lg shadow-lg shadow-amber-500/50 transition-all duration-300 hover:scale-105"
            >
              Ver Planos e Preços
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Gestão Financeira</h3>
            <p className="text-slate-300">
              Acompanhe receitas, custos e lucratividade de cada evento em tempo real
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Checklists Inteligentes</h3>
            <p className="text-slate-300">
              Crie templates de tarefas e aplique-os automaticamente aos seus eventos
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Super-Calendário</h3>
            <p className="text-slate-300">
              Visualize todos os eventos, prazos e tarefas em um único calendário
            </p>
          </div>
        </div>
      </div>

      {/* Why Use Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Por Que Usar o EG Assist?</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Transforme a forma como você gerencia eventos com ferramentas profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="flex gap-6">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Produtividade Máxima</h3>
                <p className="text-slate-300 leading-relaxed">
                  Elimine planilhas confusas e e-mails perdidos. Centralize toda a gestão de eventos em um único lugar, economizando horas de trabalho administrativo toda semana.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Controle Financeiro Total</h3>
                <p className="text-slate-300 leading-relaxed">
                  Saiba exatamente quanto cada evento vai lucrar antes mesmo de acontecer. Acompanhe recebimentos e pagamentos com precisão e nunca perca um vencimento.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Relacionamento com Clientes</h3>
                <p className="text-slate-300 leading-relaxed">
                  Mantenha o histórico completo de cada contratante, eventos anteriores e preferências. Ofereça um serviço personalizado que conquista clientes fiéis.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Segurança e Confiabilidade</h3>
                <p className="text-slate-300 leading-relaxed">
                  Seus dados estão seguros na nuvem com backup automático. Acesse de qualquer lugar, a qualquer momento, em qualquer dispositivo com total segurança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">O Que Dizem Nossos Usuários</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Profissionais de eventos que transformaram seus negócios com o EG Assist
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <p className="text-slate-200 mb-6 leading-relaxed">
              "Desde que comecei a usar o EG Assist, minha produtividade aumentou em 300%. Consigo gerenciar múltiplos eventos simultaneamente sem perder o controle de nada."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                MC
              </div>
              <div>
                <div className="font-semibold text-white">Maria Clara Santos</div>
                <div className="text-sm text-slate-400">Produtora de Eventos</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <p className="text-slate-200 mb-6 leading-relaxed">
              "O controle financeiro é impressionante. Agora sei exatamente quanto vou lucrar em cada evento antes mesmo dele acontecer. Minha margem aumentou significativamente."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                RS
              </div>
              <div>
                <div className="font-semibold text-white">Ricardo Silva</div>
                <div className="text-sm text-slate-400">Organizador de Eventos Corporativos</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <div className="flex gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <p className="text-slate-200 mb-6 leading-relaxed">
              "Os templates de checklist são um divisor de águas. Economizo horas toda semana e nunca mais esqueci nenhuma tarefa importante. Simplesmente essencial!"
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-lg">
                AF
              </div>
              <div>
                <div className="font-semibold text-white">Ana Ferreira</div>
                <div className="text-sm text-slate-400">Wedding Planner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Tire suas dúvidas sobre o EG Assist
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <details className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 group">
              <summary className="p-6 cursor-pointer flex items-center justify-between">
                <span className="text-lg font-semibold text-white">O EG Assist é realmente gratuito?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-300 leading-relaxed">
                Sim! O EG Assist oferece um plano gratuito completo para você começar a organizar seus eventos imediatamente. Você pode gerenciar eventos ilimitados, criar checklists, controlar finanças e muito mais sem pagar nada.
              </div>
            </details>

            <details className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 group">
              <summary className="p-6 cursor-pointer flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Meus dados estão seguros?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-300 leading-relaxed">
                Absolutamente. Utilizamos autenticação segura via Google e armazenamos todos os dados em servidores na nuvem com criptografia de ponta. Seus dados têm backup automático e você pode acessá-los de qualquer lugar com total segurança.
              </div>
            </details>

            <details className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 group">
              <summary className="p-6 cursor-pointer flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Posso usar em dispositivos móveis?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-300 leading-relaxed">
                Sim! O EG Assist é totalmente responsivo e funciona perfeitamente em smartphones, tablets e computadores. Gerencie seus eventos de qualquer lugar, a qualquer momento.
              </div>
            </details>

            <details className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 group">
              <summary className="p-6 cursor-pointer flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Como funcionam os templates de checklist?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-300 leading-relaxed">
                Você cria um template uma vez com todas as tarefas necessárias para um tipo de evento (casamento, festa corporativa, etc). Depois, ao criar um novo evento, basta aplicar o template e todas as tarefas são criadas automaticamente com os prazos calculados a partir da data do evento. Economize horas de trabalho!
              </div>
            </details>

            <details className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 group">
              <summary className="p-6 cursor-pointer flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Posso gerenciar múltiplos eventos ao mesmo tempo?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-300 leading-relaxed">
                Com certeza! O EG Assist foi desenvolvido especialmente para profissionais que precisam gerenciar vários eventos simultaneamente. Você pode visualizar todos eles no dashboard e no calendário, facilitando o acompanhamento de tudo que está acontecendo.
              </div>
            </details>

            <details className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 group">
              <summary className="p-6 cursor-pointer flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Preciso de conhecimento técnico para usar?</span>
                <ChevronDown className="w-5 h-5 text-amber-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-300 leading-relaxed">
                Não! O EG Assist foi desenvolvido para ser extremamente intuitivo. Se você sabe usar e-mail e redes sociais, você consegue usar o EG Assist. A interface é simples, moderna e fácil de navegar.
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-12 text-center shadow-2xl shadow-amber-500/30">
          <h2 className="text-4xl font-bold text-white mb-4">
            Pronto para Transformar seus Eventos?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Junte-se a centenas de profissionais que já organizam eventos de forma mais eficiente
          </p>
          <Link
            to="/planos"
            className="inline-block bg-white text-amber-600 hover:bg-slate-100 font-semibold px-10 py-4 rounded-lg text-lg shadow-lg transition-all duration-300 hover:scale-105"
          >
            Escolher Plano
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <img 
                src="https://mocha-cdn.com/019a91b8-5848-7ccf-8d6c-a1c3ea6b0c64/evassist.png" 
                alt="EG Assist" 
                className="w-24 mb-4 rounded-xl"
              />
              <p className="text-slate-400 text-sm leading-relaxed">
                A plataforma completa para profissionais de eventos que querem crescer com organização e eficiência.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Dashboard</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Gestão de Eventos</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Controle Financeiro</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Checklists</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Sobre Nós</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Carreiras</a></li>
                <li><a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Contato</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Contato</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-400 text-sm">
                  <Mail className="w-4 h-4 text-amber-500" />
                  contato@egassist.com
                </li>
                <li className="flex items-center gap-2 text-slate-400 text-sm">
                  <Phone className="w-4 h-4 text-amber-500" />
                  (11) 9 9999-9999
                </li>
                <li className="flex items-center gap-2 text-slate-400 text-sm">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  São Paulo, Brasil
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © 2025 EG Assist. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Privacidade</a>
              <a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Termos de Uso</a>
              <a href="#" className="text-slate-400 hover:text-amber-500 transition-colors text-sm">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
