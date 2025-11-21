import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { Plus, Search, Mail, Phone, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Contratante {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  created_at: string;
}

export default function Contratantes() {
  const [contratantes, setContratantes] = useState<Contratante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    telefone: ""
  });

  const fetchContratantes = async () => {
    try {
      const response = await fetch('/api/contratantes');
      const data = await response.json();
      setContratantes(data);
    } catch (error) {
      console.error('Failed to fetch contratantes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContratantes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/contratantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ nome: "", email: "", telefone: "" });
        fetchContratantes();
      }
    } catch (error) {
      console.error('Failed to create contratante:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredContratantes = contratantes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-3xl font-bold text-slate-900">Contratantes</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Novo Contratante
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar contratantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Contratantes List */}
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredContratantes.map((contratante) => (
              <div key={contratante.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <Link
                    to={`/contratantes/${contratante.id}`}
                    className="font-semibold text-lg text-slate-900 hover:text-amber-600 transition-colors"
                  >
                    {contratante.nome}
                  </Link>
                  <Link
                    to={`/contratantes/${contratante.id}`}
                    className="text-xs font-medium text-amber-600 hover:text-amber-700 inline-flex items-center gap-1"
                  >
                    Ver detalhes
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-2">
                  {contratante.email && (
                    <a
                      href={`mailto:${contratante.email}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                    >
                      <Mail className="w-4 h-4" />
                      {contratante.email}
                    </a>
                  )}
                  {contratante.telefone && (
                    <a
                      href={`tel:${contratante.telefone}`}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600"
                    >
                      <Phone className="w-4 h-4" />
                      {contratante.telefone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredContratantes.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 mb-4">
                {searchTerm ? 'Nenhum contratante encontrado' : 'Nenhum contratante cadastrado'}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
              >
                <Plus className="w-4 h-4" />
                Cadastrar primeiro contratante
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
              <h2 className="text-xl font-bold text-slate-900">Novo Contratante</h2>
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
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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
