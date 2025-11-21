import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { Plus, Calendar, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useErrorHandler } from "@/react-app/hooks/useErrorHandler";
import { ErrorToast } from "@/react-app/components/ErrorToast";
import { PageLoader } from "@/react-app/components/PageLoader";
import { formatCurrency, formatDate } from "@/shared/utils";

interface Evento {
  id: number;
  nome_evento: string;
  data_evento: string;
  contratante_nome: string;
  valor_total_receber: number;
  valor_total_custos: number;
  status_evento: string;
}

export default function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { error, handleError, clearError } = useErrorHandler();

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await fetch('/api/eventos');
        if (!response.ok) {
          throw new Error('Falha ao carregar eventos');
        }
        const data = await response.json();
        setEventos(data);
      } catch (error) {
        handleError(error, 'Não foi possível carregar os eventos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventos();
  }, [handleError]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-700';
      case 'Cancelado':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const filteredEventos = eventos.filter(evento =>
    evento.nome_evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    evento.contratante_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {error && <ErrorToast message={error} onClose={clearError} />}
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Eventos</h1>
          <Link
            to="/eventos/novo"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Novo Evento
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEventos.map((evento) => {
            const lucro = evento.valor_total_receber - evento.valor_total_custos;
            return (
              <Link
                key={evento.id}
                to={`/eventos/${evento.id}`}
                className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-lg text-slate-900 flex-1">
                    {evento.nome_evento}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(evento.status_evento)}`}>
                    {evento.status_evento}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    {formatDate(evento.data_evento)}
                  </div>
                  <p className="text-sm text-slate-500">
                    Cliente: {evento.contratante_nome || 'Não definido'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Receita</span>
                    <span className="font-semibold text-green-600">
                      {formatCurrency(evento.valor_total_receber)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Custos</span>
                    <span className="font-semibold text-red-600">
                      {formatCurrency(evento.valor_total_custos)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-900">Lucro</span>
                    <span className={`font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(lucro)}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {filteredEventos.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg shadow-slate-200/50 border border-slate-100">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              {searchTerm ? 'Nenhum evento encontrado' : 'Nenhum evento criado ainda'}
            </p>
            <Link
              to="/eventos/novo"
              className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
            >
              <Plus className="w-4 h-4" />
              Criar primeiro evento
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
