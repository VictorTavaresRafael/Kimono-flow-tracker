-- Criar tipo enum para user_role
CREATE TYPE public.user_role AS ENUM ('aluno', 'professor', 'monitor');

-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS public.usuarios (
  id SERIAL PRIMARY KEY,
  ra VARCHAR(20) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  tipo public.user_role NOT NULL,
  senha_hash TEXT NOT NULL,
  criado_em TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Criar tabela de detalhes dos alunos
CREATE TABLE IF NOT EXISTS public.alunos_detalhes (
  aluno_id INTEGER NOT NULL PRIMARY KEY,
  faixa VARCHAR(50) NOT NULL,
  peso NUMERIC(5, 2),
  altura NUMERIC(4, 2),
  tempo_pratica INTEGER,
  CONSTRAINT fk_aluno_detalhes_usuarios FOREIGN KEY (aluno_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

-- Criar tabela de turmas
CREATE TABLE IF NOT EXISTS public.turmas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  professor_id INTEGER NOT NULL,
  criado_em TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_turmas_usuarios FOREIGN KEY (professor_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

-- Criar tabela de aulas
CREATE TABLE IF NOT EXISTS public.aulas (
  id SERIAL PRIMARY KEY,
  turma_id INTEGER NOT NULL,
  data_hora TIMESTAMP WITHOUT TIME ZONE NOT NULL,
  qr_token VARCHAR(255) NOT NULL UNIQUE,
  criado_em TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_aulas_turmas FOREIGN KEY (turma_id) REFERENCES turmas (id) ON DELETE CASCADE
);

-- Criar tabela de presenças
CREATE TABLE IF NOT EXISTS public.presencas (
  id SERIAL PRIMARY KEY,
  aula_id INTEGER NOT NULL,
  aluno_id INTEGER NOT NULL,
  registrada_por INTEGER NOT NULL,
  horario TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_presencas_aulas FOREIGN KEY (aula_id) REFERENCES aulas (id) ON DELETE CASCADE,
  CONSTRAINT fk_presencas_alunos_usuarios FOREIGN KEY (aluno_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_presencas_registrada_por_usuarios FOREIGN KEY (registrada_por) REFERENCES usuarios (id) ON DELETE CASCADE
);

-- Criar tabela de relacionamento alunos-turmas
CREATE TABLE IF NOT EXISTS public.alunos_turmas (
  aluno_id INTEGER NOT NULL,
  turma_id INTEGER NOT NULL,
  PRIMARY KEY (aluno_id, turma_id),
  CONSTRAINT fk_alunos_turmas_usuarios FOREIGN KEY (aluno_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_alunos_turmas_turmas FOREIGN KEY (turma_id) REFERENCES turmas (id) ON DELETE CASCADE
);

-- Criar tabela de relacionamento monitores-turmas
CREATE TABLE IF NOT EXISTS public.monitores_turmas (
  monitor_id INTEGER NOT NULL,
  turma_id INTEGER NOT NULL,
  PRIMARY KEY (monitor_id, turma_id),
  CONSTRAINT fk_monitores_turmas_usuarios FOREIGN KEY (monitor_id) REFERENCES usuarios (id) ON DELETE CASCADE,
  CONSTRAINT fk_monitores_turmas_turmas FOREIGN KEY (turma_id) REFERENCES turmas (id) ON DELETE CASCADE
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_ra ON usuarios(ra);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo);
CREATE INDEX IF NOT EXISTS idx_aulas_qr_token ON aulas(qr_token);
CREATE INDEX IF NOT EXISTS idx_presencas_aluno_id ON presencas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_presencas_aula_id ON presencas(aula_id);

-- Comentários nas tabelas
COMMENT ON TABLE usuarios IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE alunos_detalhes IS 'Detalhes específicos dos alunos (faixa, peso, altura, etc.)';
COMMENT ON TABLE turmas IS 'Turmas de jiu-jitsu';
COMMENT ON TABLE aulas IS 'Aulas realizadas com QR code para presença';
COMMENT ON TABLE presencas IS 'Registro de presenças dos alunos nas aulas';
COMMENT ON TABLE alunos_turmas IS 'Relacionamento entre alunos e turmas';
COMMENT ON TABLE monitores_turmas IS 'Relacionamento entre monitores e turmas';
