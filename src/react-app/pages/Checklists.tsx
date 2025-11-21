import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { Plus, ClipboardList, Clock, ListChecks, Loader2, Sparkles, CheckCircle } from "lucide-react";

interface ChecklistTemplate {
  id: number;
  nome_template: string;
  created_at: string;
  total_tarefas: number;
}

interface TemplateTask {
  id: number;
  descricao_tarefa: string;
  prazo_relativo_dias: number;
  tipo_prazo: "antes" | "depois";
}

interface EventoResumo {
  id: number;
  nome_evento: string;
  data_evento: string;
}

export default function ChecklistsPage() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ChecklistTemplate | null>(null);
  const [templateTasks, setTemplateTasks] = useState<TemplateTask[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [events, setEvents] = useState<EventoResumo[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [taskForm, setTaskForm] = useState({
    descricao_tarefa: "",
    prazo_relativo_dias: 7,
    tipo_prazo: "antes" as "antes" | "depois",
  });
  const [selectedEventId, setSelectedEventId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch("/api/checklists/templates");
      const data = await response.json();
      setTemplates(data);
      if (!selectedTemplate && data.length > 0) {
        setSelectedTemplate(data[0]);
      }
    } catch (error) {
      console.error("Failed to load templates", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchTemplateTasks = async (templateId: number) => {
    setLoadingTasks(true);
    try {
      const response = await fetch(`/api/checklists/templates/${templateId}/tarefas`);
      const data = await response.json();
      setTemplateTasks(data);
    } catch (error) {
      console.error("Failed to load template tasks", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/eventos");
      const data = await response.json();
      setEvents(
        data.map((evento: any) => ({
          id: evento.id,
          nome_evento: evento.nome_evento,
          data_evento: evento.data_evento,
        }))
      );
    } catch (error) {
      console.error("Failed to load events", error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchTemplateTasks(selectedTemplate.id);
    } else {
      setTemplateTasks([]);
    }
  }, [selectedTemplate?.id]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch("/api/checklists/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome_template: templateName }),
      });
      if (response.ok) {
        setTemplateName("");
        setShowTemplateModal(false);
        await fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to create template", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/checklists/templates/${selectedTemplate.id}/tarefas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskForm),
      });
      if (response.ok) {
        setTaskForm({ descricao_tarefa: "", prazo_relativo_dias: 7, tipo_prazo: "antes" });
        setShowTaskModal(false);
        fetchTemplateTasks(selectedTemplate.id);
        fetchTemplates();
      }
    } catch (error) {
      console.error("Failed to add task", error);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate || !selectedEventId) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/checklists/templates/${selectedTemplate.id}/aplicar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evento_id: parseInt(selectedEventId) }),
      });
      if (response.ok) {
        setSelectedEventId("");
        setShowApplyModal(false);
      }
    } catch (error) {
      console.error("Failed to apply template", error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Templates de Checklist</h1>
            <p className="text-slate-500">Crie fluxos reutilizáveis e aplique em eventos com um clique.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                fetchEvents();
                setShowApplyModal(true);
              }}
              disabled={!selectedTemplate}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5" />
              Aplicar em Evento
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 hover:scale-105 transition"
            >
              <Plus className="w-5 h-5" />
              Novo Template
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Templates</h2>
            </div>
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-slate-100">
              {loadingTemplates ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                </div>
              ) : templates.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  Nenhum template criado ainda.
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="block mt-3 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Criar primeiro template
                  </button>
                </div>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={`w-full text-left p-5 hover:bg-slate-50 transition ${
                      selectedTemplate?.id === template.id ? "bg-amber-50 border-l-4 border-amber-500" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{template.nome_template}</span>
                      <span className="text-xs text-slate-500">{template.total_tarefas} tarefas</span>
                    </div>
                    <p className="text-xs text-slate-400">{formatDate(template.created_at)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedTemplate ? selectedTemplate.nome_template : "Selecione um template"}
                </h2>
                {selectedTemplate && (
                  <p className="text-sm text-slate-500">{selectedTemplate.total_tarefas} tarefas configuradas</p>
                )}
              </div>
              {selectedTemplate && (
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  <Plus className="w-4 h-4" />
                  Nova Tarefa
                </button>
              )}
            </div>

            {selectedTemplate ? (
              <div className="p-6 space-y-4">
                {loadingTasks ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
                  </div>
                ) : templateTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <ListChecks className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Nenhuma tarefa adicionada ainda.</p>
                    <button
                      onClick={() => setShowTaskModal(true)}
                      className="mt-3 inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar primeira tarefa
                    </button>
                  </div>
                ) : (
                  templateTasks.map((task) => (
                    <div key={task.id} className="p-5 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900">{task.descricao_tarefa}</h3>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
                          {task.tipo_prazo === "antes" ? "Antes do evento" : "Após o evento"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                        <Clock className="w-4 h-4" />
                        {task.tipo_prazo === "antes" ? "-" : "+"}
                        {task.prazo_relativo_dias} dias
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                Selecione um template para visualizar as tarefas.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-semibold text-slate-900">Novo Template</h3>
            </div>
            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nome do template</label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Casamento completo"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-amber-500/30 shadow-lg disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Criar template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-semibold text-slate-900">Nova Tarefa</h3>
              <p className="text-sm text-slate-500">Adicionar ao template {selectedTemplate.nome_template}</p>
            </div>
            <form onSubmit={handleAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Descrição da tarefa</label>
                <input
                  type="text"
                  required
                  value={taskForm.descricao_tarefa}
                  onChange={(e) => setTaskForm((prev) => ({ ...prev, descricao_tarefa: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Ex: Fechar contrato com o buffet"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dias</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={taskForm.prazo_relativo_dias}
                    onChange={(e) =>
                      setTaskForm((prev) => ({ ...prev, prazo_relativo_dias: parseInt(e.target.value, 10) }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Referência</label>
                  <select
                    value={taskForm.tipo_prazo}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, tipo_prazo: e.target.value as "antes" | "depois" }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="antes">Antes do evento</option>
                    <option value="depois">Depois do evento</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-amber-500/30 shadow-lg disabled:opacity-50"
                >
                  {saving ? "Salvando..." : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-xl font-semibold text-slate-900">Aplicar Template</h3>
              <p className="text-sm text-slate-500">Escolha um evento para gerar as tarefas automaticamente.</p>
            </div>
            <form onSubmit={handleApplyTemplate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Evento</label>
                <select
                  required
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Selecione um evento</option>
                  {events.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nome_evento} - {formatDate(evento.data_evento)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-2">
                  As datas de cada tarefa serão calculadas automaticamente com base na data do evento.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedEventId}
                  className="flex-1 px-4 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "Gerando..." : "Aplicar template"}
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle className="w-4 h-4" />
                Todas as tarefas aparecerão automaticamente na página do evento selecionado.
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}



