
export type BeltType = 'white' | 'blue' | 'purple' | 'brown' | 'black';

export interface Student {
  id: string;
  ra: string; // Registro do Aluno (chave primária)
  name: string;
  belt: BeltType;
  beltStartDate: Date;
  weight: number; // em kg
  height: number; // em cm
  additionalInfo?: string;
  attendanceCount: number; // contador de presenças
}

export interface Attendance {
  id: string;
  studentRA: string;
  date: Date;
}
