-- Documentos vinculados a eventos
CREATE TABLE documentos_evento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  tipo_documento TEXT,
  mime_type TEXT,
  tamanho INTEGER,
  conteudo BLOB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documentos_evento_evento_id ON documentos_evento(evento_id);
CREATE INDEX idx_documentos_evento_user_id ON documentos_evento(user_id);



