import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { TrendingUp, AlertCircle, Calendar, Plus, Activity, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  LineChart
} from "recharts";
import { useErrorHandler } from "@/react-app/hooks/useErrorHandler";
import { ErrorToast } from "@/react-app/components/ErrorToast";
import { PageLoader } from "@/react-app/components/PageLoader";
import { formatCurrency, formatDate, formatShortDate, formatPercentage } from "@/shared/utils";

interface FinancialSeriesPoint {
  period: string;
  receita: number;
  despesa: number;
  lucro: number;
  margem: number;
}

interface CashflowPoint {
  date: string;
  receita: number;
  despesa: number;
}

interface DashboardStats {
  receivablesMonth: number;
  overduePayments: {
    count: number;
    total: number;
  };
  upcomingEvents: Array<{
    id: number;
    nome_evento: string;
    data_evento: string;
    contratante_nome: string;
    valor_total_receber: number;
  }>;
  financialSeries: FinancialSeriesPoint[];
  marginAnalysis: {
    receitaTotal: number;
    custoTotal: number;
    lucroTotal: number;
    margemPercentual: number;
  };
  cashPosition: number;
  cashflowProjection: CashflowPoint[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { error, handleError, clearError } = useErrorHandler();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) {
          throw new Error('Falha ao carregar dados do dashboard');
        }
        const data = await response.json();
        setStats(data);
      } catch (error) {
        handleError(error, 'Não foi possível carregar o dashboard. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [handleError]);

  if (loading || !stats) {
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
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <Link
            to="/eventos/novo"
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Novo Evento
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* A Receber (Mês) */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">A Receber (Mês)</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.receivablesMonth || 0)}
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-500 to-green-600 rounded-full"></div>
          </div>

          {/* Pagamentos Atrasados */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Pagamentos Atrasados</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.overduePayments.count || 0}
                </p>
                <p className="text-sm text-red-600 font-semibold">
                  {formatCurrency(stats.overduePayments.total || 0)}
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
          </div>

          {/* Posição de Caixa */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Posição de Caixa</p>
                <p className={`text-2xl font-bold ${stats.cashPosition >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                  {formatCurrency(stats.cashPosition || 0)}
                </p>
                <p className="text-xs text-slate-400">Recebíveis pendentes - Pagamentos pendentes</p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
          </div>

          {/* Próximos Eventos */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-12 h-12 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">Próximos 30 Dias</p>
                <p className="text-2xl font-bold text-slate-900">
                  {stats.upcomingEvents.length || 0} eventos
                </p>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full"></div>
          </div>
        </div>

        {/* Financial Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">Últimos 6 meses</p>
                <h2 className="text-xl font-bold text-slate-900">Receita x Despesa</h2>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stats.financialSeries || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fill: '#475569' }} />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', '')} tick={{ fill: '#475569' }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="receita" fill="#22c55e" name="Receita" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="despesa" fill="#ef4444" name="Despesa" radius={[6, 6, 0, 0]} />
                  <Line type="monotone" dataKey="lucro" stroke="#f97316" strokeWidth={3} name="Lucro" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">Próximos 90 dias</p>
                <h2 className="text-xl font-bold text-slate-900">Fluxo de Caixa Projetado</h2>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.cashflowProjection || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fill: '#475569' }} />
                  <YAxis tickFormatter={(value) => formatCurrency(value).replace('R$', '')} tick={{ fill: '#475569' }} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} labelFormatter={(label) => formatDate(label)} />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#16a34a" strokeWidth={3} name="Entradas" />
                  <Line type="monotone" dataKey="despesa" stroke="#dc2626" strokeWidth={3} name="Saídas" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Margin Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-500">Visão consolidada</p>
              <h2 className="text-xl font-bold text-slate-900">Análise de Margem</h2>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <PieChart className="w-4 h-4" />
              <span className="text-sm">Margem atual {formatPercentage(stats.marginAnalysis.margemPercentual || 0)}</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.marginAnalysis.receitaTotal || 0)}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Custos Totais</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.marginAnalysis.custoTotal || 0)}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-sm text-slate-500 mb-1">Lucro Líquido</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(stats.marginAnalysis.lucroTotal || 0)}</p>
              <p className="text-sm text-slate-500 mt-1">Margem: {formatPercentage(stats.marginAnalysis.margemPercentual || 0)}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events List */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Próximos Eventos</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {stats.upcomingEvents && stats.upcomingEvents.length > 0 ? (
              stats.upcomingEvents.map((evento) => (
                <Link
                  key={evento.id}
                  to={`/eventos/${evento.id}`}
                  className="block p-6 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {evento.nome_evento}
                      </h3>
                      <p className="text-sm text-slate-500">
                        Cliente: {evento.contratante_nome || 'Não definido'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        {formatDate(evento.data_evento)}
                      </p>
                      <p className="text-lg font-bold text-amber-600">
                        {formatCurrency(evento.valor_total_receber)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-4">Nenhum evento próximo</p>
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
        </div>
      </div>
    </AppLayout>
  );
}
