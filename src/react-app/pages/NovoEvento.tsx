import { useState, useEffect } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useErrorHandler } from "@/react-app/hooks/useErrorHandler";
import { ErrorToast } from "@/react-app/components/ErrorToast";
import { SuccessToast } from "@/react-app/components/SuccessToast";
import { Button } from "@/react-app/components/Button";

interface Contratante {
  id: number;
  nome: string;
}

export default function NovoEvento() {
  const navigate = useNavigate();
  const [contratantes, setContratantes] = useState<Contratante[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const { error, handleError, clearError } = useErrorHandler();
  const [formData, setFormData] = useState({
    nome_evento: "",
    data_evento: "",
    contratante_id: "",
    valor_total_receber: "",
    valor_total_custos: "",
    status_evento: "Planejamento"
  });

  useEffect(() => {
    const fetchContratantes = async () => {
      try {
        const response = await fetch('/api/contratantes');
        if (!response.ok) {
          throw new Error('Falha ao carregar contratantes');
        }
        const data = await response.json();
        setContratantes(data);
      } catch (error) {
        handleError(error, 'Não foi possível carregar os contratantes.');
      }
    };

    fetchContratantes();
  }, [handleError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearError();

    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          contratante_id: formData.contratante_id ? parseInt(formData.contratante_id) : null,
          valor_total_receber: parseFloat(formData.valor_total_receber),
          valor_total_custos: formData.valor_total_custos ? parseFloat(formData.valor_total_custos) : 0
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao criar evento');
      }

      const { id } = await response.json();
      setSuccess('Evento criado com sucesso!');
      setTimeout(() => {
        navigate(`/eventos/${id}`);
      }, 1000);
    } catch (error) {
      handleError(error, 'Não foi possível criar o evento. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      {error && <ErrorToast message={error} onClose={clearError} />}
      {success && <SuccessToast message={success} onClose={() => setSuccess(null)} />}
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Novo Evento</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome do Evento *
              </label>
              <input
                type="text"
                required
                value={formData.nome_evento}
                onChange={(e) => setFormData({ ...formData, nome_evento: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ex: Casamento João e Maria"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data do Evento *
                </label>
                <input
                  type="date"
                  required
                  value={formData.data_evento}
                  onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status_evento}
                  onChange={(e) => setFormData({ ...formData, status_evento: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="Planejamento">Planejamento</option>
                  <option value="Confirmado">Confirmado</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contratante
              </label>
              <select
                value={formData.contratante_id}
                onChange={(e) => setFormData({ ...formData, contratante_id: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="">Selecione um contratante</option>
                {contratantes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
              <p className="mt-2 text-sm text-slate-500">
                Não encontrou? <Link to="/contratantes" className="text-amber-600 hover:text-amber-700">Cadastre um novo contratante</Link>
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor Total a Receber *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.valor_total_receber}
                    onChange={(e) => setFormData({ ...formData, valor_total_receber: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Valor Total de Custos
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.valor_total_custos}
                    onChange={(e) => setFormData({ ...formData, valor_total_custos: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Link
              to="/eventos"
              className="flex-1 px-6 py-3 text-center border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
            <Button
              type="submit"
              loading={loading}
              icon={<Save className="w-5 h-5" />}
              className="flex-1"
            >
              Criar Evento
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
