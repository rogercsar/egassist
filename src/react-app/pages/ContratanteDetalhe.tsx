import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { useParams, Link } from "react-router";
import { ArrowLeft, Mail, Phone, Calendar, TrendingUp, Users } from "lucide-react";

interface Contratante {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  created_at: string;
}

interface EventoResumo {
  id: number;
  nome_evento: string;
  data_evento: string;
  status_evento: string;
  valor_total_receber: number;
  valor_total_custos: number;
}

interface ContratanteDetalheResponse {
  contratante: Contratante;
  eventos: EventoResumo[];
  stats: {
    totalEventos: number;
    totalReceita: number;
    totalLucro: number;
    margemMedia: number;
    ultimoEvento: EventoResumo | null;
    proximoEvento: EventoResumo | null;
  };
}

export default function ContratanteDetalhePage() {
  const { id } = useParams();
  const [data, setData] = useState<ContratanteDetalheResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/contratantes/${id}`);
        if (response.ok) {
          const payload = await response.json();
          setData(payload);
        }
      } catch (error) {
        console.error('Failed to load contratante details', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-500 mb-4">Contratante não encontrado.</p>
          <Link to="/contratantes" className="text-amber-600 hover:text-amber-700 font-medium">
            Voltar para contratantes
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { contratante, eventos, stats } = data;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/contratantes" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{contratante.nome}</h1>
              <p className="text-slate-500 mt-1">Cliente desde {formatDate(contratante.created_at)}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {contratante.email && (
                <a
                  href={`mailto:${contratante.email}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Mail className="w-4 h-4" />
                  {contratante.email}
                </a>
              )}
              {contratante.telefone && (
                <a
                  href={`tel:${contratante.telefone}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="w-4 h-4" />
                  {contratante.telefone}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow shadow-slate-200/50">
            <p className="text-sm text-slate-500">Eventos realizados</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalEventos}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow shadow-slate-200/50">
            <p className="text-sm text-slate-500">Receita total</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalReceita)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow shadow-slate-200/50">
            <p className="text-sm text-slate-500">Lucro líquido</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(stats.totalLucro)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow shadow-slate-200/50">
            <p className="text-sm text-slate-500">Margem média</p>
            <p className="text-3xl font-bold text-purple-600">{stats.margemMedia.toFixed(1)}%</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Próximo evento</h2>
            </div>
            <div className="p-6">
              {stats.proximoEvento ? (
                <Link
                  to={`/eventos/${stats.proximoEvento.id}`}
                  className="block p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition"
                >
                  <p className="text-sm text-slate-500 mb-1">{formatDate(stats.proximoEvento.data_evento)}</p>
                  <p className="text-lg font-semibold text-slate-900">{stats.proximoEvento.nome_evento}</p>
                  <p className="text-sm text-slate-500 mt-1">Status: {stats.proximoEvento.status_evento}</p>
                </Link>
              ) : (
                <p className="text-slate-500 text-sm">Nenhum evento futuro encontrado.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Último evento</h2>
            </div>
            <div className="p-6">
              {stats.ultimoEvento ? (
                <Link
                  to={`/eventos/${stats.ultimoEvento.id}`}
                  className="block p-4 rounded-xl border border-slate-200 hover:border-amber-400 transition"
                >
                  <p className="text-sm text-slate-500 mb-1">{formatDate(stats.ultimoEvento.data_evento)}</p>
                  <p className="text-lg font-semibold text-slate-900">{stats.ultimoEvento.nome_evento}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Lucro: {formatCurrency(stats.ultimoEvento.valor_total_receber - stats.ultimoEvento.valor_total_custos)}
                  </p>
                </Link>
              ) : (
                <p className="text-slate-500 text-sm">Nenhum evento registrado ainda.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Histórico de Eventos</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {eventos.length > 0 ? (
              eventos.map((evento) => (
                <Link
                  key={evento.id}
                  to={`/eventos/${evento.id}`}
                  className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm text-slate-500">{formatDate(evento.data_evento)}</p>
                    <p className="text-lg font-semibold text-slate-900">{evento.nome_evento}</p>
                    <p className="text-xs text-slate-500">Status: {evento.status_evento}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Receita</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(evento.valor_total_receber)}</p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-10 text-center text-slate-500">
                Nenhum evento registrado para este cliente.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}



