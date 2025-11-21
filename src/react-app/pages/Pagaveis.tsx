import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { Plus, Search, Calendar, AlertCircle, X, Filter } from "lucide-react";

interface Pagavel {
  id: number;
  evento_id: number;
  evento_nome: string;
  fornecedor_nome: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status_pagamento: string;
  created_at: string;
}

interface Evento {
  id: number;
  nome_evento: string;
}

interface Fornecedor {
  id: number;
  nome_fornecedor: string;
}

export default function Pagaveis() {
  const [pagaveis, setPagaveis] = useState<Pagavel[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    evento_id: "",
    fornecedor_id: "",
    descricao: "",
    valor: "",
    data_vencimento: "",
    status_pagamento: "Pendente"
  });

  const fetchPagaveis = async () => {
    try {
      const response = await fetch('/api/pagaveis');
      const data = await response.json();
      setPagaveis(data);
    } catch (error) {
      console.error('Failed to fetch pagaveis:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEventos = async () => {
    try {
      const response = await fetch('/api/eventos');
      const data = await response.json();
      setEventos(data);
    } catch (error) {
      console.error('Failed to fetch eventos:', error);
    }
  };

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores');
      const data = await response.json();
      setFornecedores(data);
    } catch (error) {
      console.error('Failed to fetch fornecedores:', error);
    }
  };

  useEffect(() => {
    fetchPagaveis();
    fetchEventos();
    fetchFornecedores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/pagaveis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          evento_id: parseInt(formData.evento_id),
          fornecedor_id: formData.fornecedor_id ? parseInt(formData.fornecedor_id) : null,
          valor: parseFloat(formData.valor)
        })
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ evento_id: "", fornecedor_id: "", descricao: "", valor: "", data_vencimento: "", status_pagamento: "Pendente" });
        fetchPagaveis();
      }
    } catch (error) {
      console.error('Failed to create pagavel:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/pagaveis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_pagamento: newStatus })
      });

      if (response.ok) {
        fetchPagaveis();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dateString: string, status: string) => {
    if (status !== 'Pendente') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  const filteredPagaveis = pagaveis.filter(p => {
    const matchesSearch = p.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.evento_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.fornecedor_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "all") return matchesSearch;
    return matchesSearch && p.status_pagamento === filterStatus;
  });

  const stats = {
    total: pagaveis.reduce((sum, p) => p.status_pagamento === 'Pendente' ? sum + p.valor : sum, 0),
    overdue: pagaveis.filter(p => isOverdue(p.data_vencimento, p.status_pagamento)).reduce((sum, p) => sum + p.valor, 0),
    paid: pagaveis.reduce((sum, p) => p.status_pagamento === 'Pago' ? sum + p.valor : sum, 0)
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Contas a Pagar</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Novo Pagável
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-2">A Pagar</p>
            <p className="text-3xl font-bold text-amber-600">{formatCurrency(stats.total)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-2">Atrasado</p>
            <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.overdue)}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-2">Pago</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.paid)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar pagáveis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-12 pr-8 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="all">Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Pagaveis List */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredPagaveis.map((pagavel) => (
              <div key={pagavel.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-900 mb-1">
                      {pagavel.descricao}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">
                        Evento: {pagavel.evento_nome}
                      </p>
                      {pagavel.fornecedor_nome && (
                        <p className="text-sm text-slate-500">
                          Fornecedor: {pagavel.fornecedor_nome}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600 mb-1">
                      {formatCurrency(pagavel.valor)}
                    </p>
                    {isOverdue(pagavel.data_vencimento, pagavel.status_pagamento) && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertCircle className="w-3 h-3" />
                        Atrasado
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    Vencimento: {formatDate(pagavel.data_vencimento)}
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={pagavel.status_pagamento}
                      onChange={(e) => handleStatusChange(pagavel.id, e.target.value)}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium border-2 cursor-pointer
                        ${pagavel.status_pagamento === 'Pago' 
                          ? 'bg-green-100 text-green-700 border-green-200' 
                          : pagavel.status_pagamento === 'Cancelado'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : 'bg-amber-100 text-amber-700 border-amber-200'
                        }
                      `}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Pago">Pago</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPagaveis.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? 'Nenhum pagável encontrado' 
                  : 'Nenhum pagável cadastrado'}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
              >
                <Plus className="w-4 h-4" />
                Cadastrar primeiro pagável
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Novo Pagável</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Evento *
                </label>
                <select
                  required
                  value={formData.evento_id}
                  onChange={(e) => setFormData({ ...formData, evento_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Selecione um evento</option>
                  {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nome_evento}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fornecedor
                </label>
                <select
                  value={formData.fornecedor_id}
                  onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Selecione um fornecedor (opcional)</option>
                  {fornecedores.map((fornecedor) => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.nome_fornecedor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Descrição *
                </label>
                <input
                  type="text"
                  required
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Pagamento do buffet"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Valor *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-4 py-3 rounded-lg shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
