import { useEffect, useState } from "react";
import AppLayout from "@/react-app/components/AppLayout";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Phone, Mail, TrendingUp, DollarSign, Clock, Paperclip, Trash2, Download, UploadCloud } from "lucide-react";
import { useErrorHandler } from "@/react-app/hooks/useErrorHandler";
import { ErrorToast } from "@/react-app/components/ErrorToast";
import { SuccessToast } from "@/react-app/components/SuccessToast";
import { ConfirmDialog } from "@/react-app/components/ConfirmDialog";
import { PageLoader } from "@/react-app/components/PageLoader";

interface Evento {
  id: number;
  nome_evento: string;
  data_evento: string;
  contratante_nome: string;
  contratante_email: string;
  contratante_telefone: string;
  valor_total_receber: number;
  valor_total_custos: number;
  status_evento: string;
}

interface Recebivel {
  id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status_pagamento: string;
}

interface Pagavel {
  id: number;
  descricao: string;
  valor: number;
  data_vencimento: string;
  status_pagamento: string;
  fornecedor_nome: string;
}

interface TarefaEvento {
  id: number;
  descricao_tarefa: string;
  data_vencimento: string;
  is_concluida: number;
}

interface ChecklistTemplate {
  id: number;
  nome_template: string;
}

interface DocumentoEvento {
  id: number;
  nome_arquivo: string;
  tipo_documento: string;
  mime_type: string;
  tamanho: number;
  created_at: string;
}

export default function EventoDetalhe() {
  const { id } = useParams();
  const [evento, setEvento] = useState<Evento | null>(null);
  const [recebiveis, setRecebiveis] = useState<Recebivel[]>([]);
  const [pagaveis, setPagaveis] = useState<Pagavel[]>([]);
  const [tarefas, setTarefas] = useState<TarefaEvento[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  const [tarefasLoading, setTarefasLoading] = useState(true);
  const [templateApplying, setTemplateApplying] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [newTaskForm, setNewTaskForm] = useState({
    descricao_tarefa: "",
    data_vencimento: "",
  });
  const [documentos, setDocumentos] = useState<DocumentoEvento[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploadingDocumento, setUploadingDocumento] = useState(false);
  const [documentoForm, setDocumentoForm] = useState<{
    tipo_documento: string;
    file: File | null;
  }>({
    tipo_documento: "Contrato",
    file: null
  });
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [docToDelete, setDocToDelete] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { error, handleError, clearError } = useErrorHandler();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventoRes, recebiveisRes, pagaveisRes, tarefasRes, templatesRes, documentosRes] = await Promise.all([
          fetch(`/api/eventos/${id}`),
          fetch(`/api/recebiveis`),
          fetch(`/api/pagaveis`),
          fetch(`/api/eventos/${id}/tarefas`),
          fetch(`/api/checklists/templates`),
          fetch(`/api/eventos/${id}/documentos`)
        ]);

        if (!eventoRes.ok) {
          throw new Error('Falha ao carregar evento');
        }
        const eventoData = await eventoRes.json();
        setEvento(eventoData);

        if (recebiveisRes.ok) {
          const recebiveisData = await recebiveisRes.json();
          setRecebiveis(recebiveisData.filter((r: Recebivel & { evento_id: number }) => r.evento_id === parseInt(id!)));
        }

        if (pagaveisRes.ok) {
          const pagaveisData = await pagaveisRes.json();
          setPagaveis(pagaveisData.filter((p: Pagavel & { evento_id: number }) => p.evento_id === parseInt(id!)));
        }

        if (tarefasRes.ok) {
          const tarefasData = await tarefasRes.json();
          setTarefas(tarefasData);
        }

        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData);
        }

        if (documentosRes.ok) {
          const docsData = await documentosRes.json();
          setDocumentos(docsData);
        }
      } catch (error) {
        handleError(error, 'Não foi possível carregar os dados do evento.');
      } finally {
        setLoading(false);
        setTarefasLoading(false);
        setDocsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-700';
      case 'Cancelado':
        return 'bg-red-100 text-red-700';
      case 'Confirmado':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fetchTarefasEvento = async () => {
    if (!id) return;
    setTarefasLoading(true);
    try {
      const response = await fetch(`/api/eventos/${id}/tarefas`);
      const data = await response.json();
      setTarefas(data);
    } catch (error) {
      console.error('Failed to fetch event tasks', error);
    } finally {
      setTarefasLoading(false);
    }
  };

  const handleToggleTask = async (taskId: number, isConcluida: boolean) => {
    if (!id) return;
    try {
      await fetch(`/api/eventos/${id}/tarefas/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_concluida: isConcluida }),
      });
      fetchTarefasEvento();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const response = await fetch(`/api/eventos/${id}/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTaskForm),
      });
      if (response.ok) {
        setNewTaskForm({ descricao_tarefa: "", data_vencimento: "" });
        fetchTarefasEvento();
      }
    } catch (error) {
      console.error('Failed to create task', error);
    }
  };

  const handleApplyTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedTemplateId) return;
    setTemplateApplying(true);
    try {
      const response = await fetch(`/api/checklists/templates/${selectedTemplateId}/aplicar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evento_id: parseInt(id) }),
      });
      if (response.ok) {
        setSelectedTemplateId("");
        fetchTarefasEvento();
      }
    } catch (error) {
      console.error('Failed to apply template', error);
    } finally {
      setTemplateApplying(false);
    }
  };

  const fetchDocumentos = async () => {
    if (!id) return;
    setDocsLoading(true);
    try {
      const response = await fetch(`/api/eventos/${id}/documentos`);
      const data = await response.json();
      setDocumentos(data);
    } catch (error) {
      console.error('Failed to fetch documents', error);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleUploadDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !documentoForm.file) return;
    setUploadingDocumento(true);
    try {
      const formData = new FormData();
      formData.append('file', documentoForm.file);
      formData.append('tipo_documento', documentoForm.tipo_documento);
      const response = await fetch(`/api/eventos/${id}/documentos`, {
        method: 'POST',
        body: formData
      });
      if (response.ok) {
        setDocumentoForm({ tipo_documento: 'Contrato', file: null });
        fetchDocumentos();
      }
    } catch (error) {
      console.error('Failed to upload document', error);
    } finally {
      setUploadingDocumento(false);
    }
  };

  const handleDeleteClick = (docId: number) => {
    setDocToDelete(docId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!id || !docToDelete) return;
    
    try {
      const response = await fetch(`/api/eventos/${id}/documentos/${docToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao deletar documento');
      }
      
      setDocumentos(documentos.filter(doc => doc.id !== docToDelete));
      setSuccess('Documento deletado com sucesso!');
      setShowDeleteConfirm(false);
      setDocToDelete(null);
    } catch (error) {
      handleError(error, 'Não foi possível deletar o documento.');
    }
  };

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
      {success && <SuccessToast message={success} onClose={() => setSuccess(null)} />}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Deletar Documento"
        message="Tem certeza que deseja deletar este documento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDocToDelete(null);
        }}
      />
      <div className="max-w-7xl mx-auto">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <Paperclip className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Documentos anexados</h2>
            </div>
            <div className="p-6">
              {docsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
                </div>
              ) : documentos.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  Nenhum documento enviado. Utilize o formulário ao lado para começar.
                </div>
              ) : (
                <div className="space-y-3">
                  {documentos.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-50"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{doc.nome_arquivo}</p>
                        <p className="text-xs text-slate-500">
                          {doc.tipo_documento || 'Documento'} · {formatFileSize(doc.tamanho)} ·{' '}
                          {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={`/api/eventos/${evento.id}/documentos/${doc.id}/download`}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100"
                          title="Baixar"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDeleteClick(doc.id)}
                          className="p-2 rounded-lg border border-slate-200 hover:bg-red-50 text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-semibold text-slate-900">Enviar documento</h2>
            </div>
            <form onSubmit={handleUploadDocumento} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                <select
                  value={documentoForm.tipo_documento}
                  onChange={(e) => setDocumentoForm((prev) => ({ ...prev, tipo_documento: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Contrato">Contrato</option>
                  <option value="Proposta">Proposta</option>
                  <option value="Nota Fiscal">Nota Fiscal</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Arquivo</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setDocumentoForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
              </div>
              <button
                type="submit"
                disabled={uploadingDocumento || !documentoForm.file}
                className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30 disabled:opacity-50"
              >
                {uploadingDocumento ? 'Enviando...' : 'Anexar documento'}
              </button>
              <p className="text-xs text-slate-400">
                Aceitamos arquivos em PDF, DOCX e imagens até 5MB. Armazenados com segurança para consulta fututra.
              </p>
            </form>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!evento) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-slate-500 mb-4">Evento não encontrado</p>
          <Link to="/eventos" className="text-amber-600 hover:text-amber-700 font-medium">
            Voltar para eventos
          </Link>
        </div>
      </AppLayout>
    );
  }

  const lucro = evento.valor_total_receber - evento.valor_total_custos;
  const margemLucro = evento.valor_total_receber > 0 
    ? (lucro / evento.valor_total_receber) * 100 
    : 0;

  return (
    <AppLayout>
      {error && <ErrorToast message={error} onClose={clearError} />}
      {success && <SuccessToast message={success} onClose={() => setSuccess(null)} />}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Deletar Documento"
        message="Tem certeza que deseja deletar este documento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDocToDelete(null);
        }}
      />
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link
            to="/eventos"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{evento.nome_evento}</h1>
              <div className="flex items-center gap-4 text-slate-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{formatDate(evento.data_evento)}</span>
                </div>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(evento.status_evento)}`}>
              {evento.status_evento}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Receita */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-2">Receita Total</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(evento.valor_total_receber)}
            </p>
          </div>

          {/* Custos */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <p className="text-sm text-slate-500 font-medium mb-2">Custos Totais</p>
            <p className="text-3xl font-bold text-red-600">
              {formatCurrency(evento.valor_total_custos)}
            </p>
          </div>

          {/* Lucro */}
          <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-500 font-medium">Lucro Líquido</p>
            </div>
            <p className={`text-3xl font-bold ${lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(lucro)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Margem: {margemLucro.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Cliente Info */}
        {evento.contratante_nome && (
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações do Cliente
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Nome</p>
                <p className="text-slate-900 font-medium">{evento.contratante_nome}</p>
              </div>
              {evento.contratante_email && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">E-mail</p>
                  <a 
                    href={`mailto:${evento.contratante_email}`}
                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    {evento.contratante_email}
                  </a>
                </div>
              )}
              {evento.contratante_telefone && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Telefone</p>
                  <a 
                    href={`tel:${evento.contratante_telefone}`}
                    className="text-amber-600 hover:text-amber-700 font-medium flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    {evento.contratante_telefone}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Checklist Section */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Checklist do Evento
              </h2>
              <span className="text-sm text-slate-500">{tarefas.length} tarefas</span>
            </div>
            <div className="p-6 space-y-4">
              {tarefasLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
                </div>
              ) : tarefas.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">Nenhuma tarefa cadastrada. Aplique um template ou crie tarefas manuais.</p>
                </div>
              ) : (
                tarefas.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="p-4 rounded-xl border border-slate-100 flex items-center gap-4 bg-gradient-to-r from-white to-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(tarefa.is_concluida)}
                      onChange={(e) => handleToggleTask(tarefa.id, e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${tarefa.is_concluida ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                        {tarefa.descricao_tarefa}
                      </p>
                      <div className="text-sm text-slate-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(tarefa.data_vencimento)}
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        tarefa.is_concluida ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {tarefa.is_concluida ? 'Concluída' : 'Pendente'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Aplicar Template</h3>
                <p className="text-sm text-slate-500">Gere tarefas automaticamente.</p>
              </div>
              <form onSubmit={handleApplyTemplate} className="p-5 space-y-4">
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">Selecione um template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.nome_template}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!selectedTemplateId || templateApplying}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {templateApplying ? 'Aplicando...' : 'Gerar tarefas'}
                </button>
                <Link to="/checklists" className="text-xs text-amber-600 hover:text-amber-700 font-medium inline-block">
                  Gerenciar templates
                </Link>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Nova Tarefa Manual</h3>
                <p className="text-sm text-slate-500">Adicione tarefas específicas deste evento.</p>
              </div>
              <form onSubmit={handleCreateTask} className="p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Descrição</label>
                  <input
                    type="text"
                    required
                    value={newTaskForm.descricao_tarefa}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, descricao_tarefa: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="Ex: Confirmar checklist final"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Data limite</label>
                  <input
                    type="date"
                    required
                    value={newTaskForm.data_vencimento}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, data_vencimento: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg shadow-amber-500/30"
                >
                  Adicionar tarefa
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Recebiveis Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-green-50 to-green-100/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                A Receber
              </h2>
            </div>
            <div className="p-6">
              {recebiveis.length > 0 ? (
                <div className="space-y-4">
                  {recebiveis.map((recebivel) => (
                    <div key={recebivel.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{recebivel.descricao}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(recebivel.data_vencimento)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{formatCurrency(recebivel.valor)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          recebivel.status_pagamento === 'Recebido' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {recebivel.status_pagamento}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(recebiveis.reduce((sum, r) => sum + r.valor, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Nenhum recebível cadastrado</p>
                  <Link to="/recebiveis" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
                    Adicionar recebível
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Pagaveis Section */}
          <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-red-50 to-red-100/50">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
                A Pagar
              </h2>
            </div>
            <div className="p-6">
              {pagaveis.length > 0 ? (
                <div className="space-y-4">
                  {pagaveis.map((pagavel) => (
                    <div key={pagavel.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{pagavel.descricao}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(pagavel.data_vencimento)}
                        </div>
                        {pagavel.fornecedor_nome && (
                          <p className="text-xs text-slate-500 mt-1">{pagavel.fornecedor_nome}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">{formatCurrency(pagavel.valor)}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          pagavel.status_pagamento === 'Pago' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {pagavel.status_pagamento}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900">Total:</span>
                      <span className="text-xl font-bold text-red-600">
                        {formatCurrency(pagaveis.reduce((sum, p) => sum + p.valor, 0))}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Nenhum pagável cadastrado</p>
                  <Link to="/pagaveis" className="text-amber-600 hover:text-amber-700 text-sm font-medium mt-2 inline-block">
                    Adicionar pagável
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
