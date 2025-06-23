
// Database Types
export type UserRole = 'aluno' | 'professor' | 'monitor';

export interface Usuario {
  id: number;
  ra: string;
  nome: string;
  tipo: UserRole;
  senha_hash: string;
  criado_em: string;
}

export interface AlunoDetalhes {
  aluno_id: number;
  faixa: string;
  peso?: number;
  altura?: number;
  tempo_pratica?: number;
}

export interface Turma {
  id: number;
  nome: string;
  descricao?: string;
  professor_id: number;
  criado_em: string;
}

export interface Aula {
  id: number;
  turma_id: number;
  data_hora: string;
  qr_token: string;
  criado_em: string;
}

export interface Presenca {
  id: number;
  aula_id: number;
  aluno_id: number;
  registrada_por: number;
  horario: string;
}

export interface AlunoTurma {
  aluno_id: number;
  turma_id: number;
}

export interface MonitorTurma {
  monitor_id: number;
  turma_id: number;
}

// Combined types for easier frontend usage
export interface AlunoCompleto extends Usuario {
  detalhes?: AlunoDetalhes;
  turmas?: Turma[];
  total_presencas?: number;
}

// Legacy types for compatibility
export type BeltType = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface Student {
  id?: string;
  ra: string;
  name: string;
  belt: BeltType;
  beltStartDate: Date | string;
  attendanceCount: number;
  weight?: number;
  height?: number;
}

export interface Attendance {
  id: string;
  studentRA: string;
  date: Date;
}
