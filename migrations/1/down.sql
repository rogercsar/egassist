
DROP INDEX idx_tarefas_evento_data_vencimento;
DROP INDEX idx_tarefas_evento_user_id;
DROP INDEX idx_tarefas_evento_evento_id;
DROP TABLE tarefas_evento;

DROP INDEX idx_tarefas_template_template_id;
DROP TABLE tarefas_template;

DROP INDEX idx_templates_checklist_user_id;
DROP TABLE templates_checklist;

DROP INDEX idx_vencimentos_pagar_data_vencimento;
DROP INDEX idx_vencimentos_pagar_fornecedor_id;
DROP INDEX idx_vencimentos_pagar_user_id;
DROP INDEX idx_vencimentos_pagar_evento_id;
DROP TABLE vencimentos_pagar;

DROP INDEX idx_vencimentos_receber_status;
DROP INDEX idx_vencimentos_receber_data_vencimento;
DROP INDEX idx_vencimentos_receber_user_id;
DROP INDEX idx_vencimentos_receber_evento_id;
DROP TABLE vencimentos_receber;

DROP INDEX idx_eventos_contratante_id;
DROP INDEX idx_eventos_data_evento;
DROP INDEX idx_eventos_user_id;
DROP TABLE eventos;

DROP INDEX idx_fornecedores_user_id;
DROP TABLE fornecedores;

DROP INDEX idx_contratantes_user_id;
DROP TABLE contratantes;
