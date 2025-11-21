import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Truck, Calendar, Coins } from "lucide-react";

interface Fornecedor {
  id: number;
  nome_fornecedor: string;
  tipo_servico: string;
  email_contato: string;
  telefone_contato: string;
  created_at: string;
}

interface PagamentoFornecedor {
  id: number;
  evento_id: number;
  evento_nome: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status_pagamento: string;
}

interface FornecedorDetalheResponse {
  fornecedor: Fornecedor;
  compromissos: PagamentoFornecedor[];
  stats: {
    totalPagamentos: number;
    totalPago: number;
    totalPendente: number;
    proximoPagamento: PagamentoFornecedor | null;
  };
}

export default function FornecedorDetalhePage() {
  const { id } = useParams();
  const [data, setData] = useState<FornecedorDetalheResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const response = await fetch(`/api/fornecedores/${id}`);
        if (response.ok) {
          const payload = await response.json();
          setData(payload);
        }
      } catch (error) {
        console.error('Failed to load fornecedor details', error);
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
          <p className="text-slate-500 mb-4">Fornecedor não encontrado.</p>
          <Link to="/fornecedores" className="text-amber-600 hover:text-amber-700 font-medium">
            Voltar para fornecedores
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { fornecedor, compromissos, stats } = data;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/fornecedores" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{fornecedor.nome_fornecedor}</h1>
              <p className="text-slate-500 mt-1">{fornecedor.tipo_servico || 'Serviço não informado'}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {fornecedor.email_contato && (
                <a
                  href={`mailto:${fornecedor.email_contato}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Mail className="w-4 h-4" />
                  {fornecedor.email_contato}
                </a>
              )}
              {fornecedor.telefone_contato && (
                <a
                  href={`tel:${fornecedor.telefone_contato}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  <Phone className="w-4 h-4" />
                  {fornecedor.telefone_contato}
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow shadow-slate-200/50">
            <p className="text-sm text-slate-500">Pagamentos registrados</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalPagamentos}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow shadow-slate-200/50">
            <p className="text-sm text-slate-500">Total pago</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalPago)}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow shadow-slate-200/50">
            <p className="text-sm text-slate-500">Pendente</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.totalPendente)}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Próximo pagamento</h2>
            </div>
            <div className="p-6">
              {stats.proximoPagamento ? (
                <div className="p-4 rounded-xl border border-slate-200">
                  <p className="text-sm text-slate-500 mb-1">{formatDate(stats.proximoPagamento.data_vencimento)}</p>
                  <p className="text-lg font-semibold text-slate-900">{stats.proximoPagamento.descricao}</p>
                  <p className="text-sm text-slate-500">Evento: {stats.proximoPagamento.evento_nome}</p>
                  <p className="text-lg font-bold text-red-600 mt-2">{formatCurrency(stats.proximoPagamento.valor)}</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Nenhum pagamento futuro pendente.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Resumo financeiro</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Pago</span>
                <span className="text-lg font-semibold text-green-600">{formatCurrency(stats.totalPago)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Pendente</span>
                <span className="text-lg font-semibold text-red-600">{formatCurrency(stats.totalPendente)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Histórico de Pagamentos</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {compromissos.length > 0 ? (
              compromissos.map((pagamento) => (
                <div key={pagamento.id} className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-sm text-slate-500">{formatDate(pagamento.data_vencimento)}</p>
                    <p className="text-lg font-semibold text-slate-900">{pagamento.descricao}</p>
                    <p className="text-xs text-slate-500">Evento: {pagamento.evento_nome}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{formatCurrency(pagamento.valor)}</p>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        pagamento.status_pagamento === 'Pago'
                          ? 'bg-green-100 text-green-700'
                          : pagamento.status_pagamento === 'Cancelado'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {pagamento.status_pagamento}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center text-slate-500">
                Nenhum pagamento registrado para este fornecedor.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}



