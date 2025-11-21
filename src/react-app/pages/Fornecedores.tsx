import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { Plus, Search, Mail, Phone, X, Truck, ArrowRight } from "lucide-react";
import { Link } from "react-router";

interface Fornecedor {
  id: number;
  nome_fornecedor: string;
  tipo_servico: string;
  email_contato: string;
  telefone_contato: string;
  created_at: string;
}

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome_fornecedor: "",
    tipo_servico: "",
    email_contato: "",
    telefone_contato: ""
  });

  const fetchFornecedores = async () => {
    try {
      const response = await fetch('/api/fornecedores');
      const data = await response.json();
      setFornecedores(data);
    } catch (error) {
      console.error('Failed to fetch fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/fornecedores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ nome_fornecedor: "", tipo_servico: "", email_contato: "", telefone_contato: "" });
        fetchFornecedores();
      }
    } catch (error) {
      console.error('Failed to create fornecedor:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredFornecedores = fornecedores.filter(f =>
    f.nome_fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.tipo_servico?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Fornecedores</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Novo Fornecedor
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar fornecedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Fornecedores Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFornecedores.map((fornecedor) => (
            <div key={fornecedor.id} className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 hover:shadow-xl hover:shadow-slate-200/70 transition-all duration-300">
              <div className="flex items-start gap-3 mb-4">
                <div className="bg-gradient-to-br from-amber-500 to-amber-600 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Link
                    to={`/fornecedores/${fornecedor.id}`}
                    className="font-semibold text-lg text-slate-900 hover:text-amber-600 transition-colors"
                  >
                    {fornecedor.nome_fornecedor}
                  </Link>
                  <Link
                    to={`/fornecedores/${fornecedor.id}`}
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                  >
                    Ver detalhes
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                  {fornecedor.tipo_servico && (
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded">
                      {fornecedor.tipo_servico}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {fornecedor.email_contato && (
                  <a
                    href={`mailto:${fornecedor.email_contato}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{fornecedor.email_contato}</span>
                  </a>
                )}
                {fornecedor.telefone_contato && (
                  <a
                    href={`tel:${fornecedor.telefone_contato}`}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                  >
                    <Phone className="w-4 h-4" />
                    {fornecedor.telefone_contato}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredFornecedores.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg shadow-slate-200/50 border border-slate-100">
            <Truck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 mb-4">
              {searchTerm ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
            >
              <Plus className="w-4 h-4" />
              Cadastrar primeiro fornecedor
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Novo Fornecedor</h2>
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
                  Nome do Fornecedor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome_fornecedor}
                  onChange={(e) => setFormData({ ...formData, nome_fornecedor: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nome da empresa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tipo de Serviço
                </label>
                <input
                  type="text"
                  value={formData.tipo_servico}
                  onChange={(e) => setFormData({ ...formData, tipo_servico: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Ex: Fotografia, Buffet, Decoração"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email_contato}
                  onChange={(e) => setFormData({ ...formData, email_contato: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="contato@fornecedor.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone_contato}
                  onChange={(e) => setFormData({ ...formData, telefone_contato: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="(00) 00000-0000"
                />
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
