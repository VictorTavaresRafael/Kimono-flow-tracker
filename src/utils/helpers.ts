
import { BeltType, Student, AlunoCompleto } from "@/types/student";
import { 
  getAlunosCompletos,
  getAlunoCompletoByRA,
  saveAlunoCompleto,
  recordAttendanceByRAAndQR,
  convertStudentToSupabase,
  convertSupabaseToStudent,
  getTotalPresencasByAluno
} from "@/lib/supabase-service";

export function calculateBeltTime(beltStartDate: Date | string): string {
  // Convert to Date object if it's a string
  const startDate = typeof beltStartDate === 'string' ? new Date(beltStartDate) : beltStartDate;
  
  // Check if the date is valid
  if (!startDate || isNaN(startDate.getTime())) {
    return "Data inválida";
  }
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} dias`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'ano' : 'anos'}`;
    } else {
      return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
    }
  }
}

export function getBeltColor(belt: BeltType): string {
  const colors = {
    'white': 'bg-belt-white border border-gray-300 text-gray-800',
    'blue': 'bg-belt-blue text-white',
    'purple': 'bg-belt-purple text-white',
    'brown': 'bg-belt-brown text-white',
    'black': 'bg-belt-black text-white',
  };
  
  return colors[belt];
}

// Funções principais que usam Supabase
export const getStudents = async (): Promise<Student[]> => {
  try {
    const alunosCompletos = await getAlunosCompletos();
    
    // Buscar total de presenças para cada aluno
    const studentsWithAttendance = await Promise.all(
      alunosCompletos.map(async (aluno) => {
        const totalPresencas = await getTotalPresencasByAluno(aluno.id);
        return {
          ...convertSupabaseToStudent(aluno),
          attendanceCount: totalPresencas
        };
      })
    );
    
    return studentsWithAttendance;
  } catch (error) {
    console.warn('Erro ao buscar alunos do Supabase, usando localStorage:', error);
    return getStudentsFromLocalStorage();
  }
};

export const saveStudent = async (student: Student): Promise<Student> => {
  try {
    const alunoCompleto = await convertStudentToSupabase(student);
    if (alunoCompleto) {
      return convertSupabaseToStudent(alunoCompleto);
    }
    throw new Error('Falha ao salvar no Supabase');
  } catch (error) {
    console.warn('Erro ao salvar no Supabase, usando localStorage:', error);
    return saveStudentToLocalStorage(student);
  }
};

export const getStudentByRA = async (ra: string): Promise<Student | undefined> => {
  try {
    const alunoCompleto = await getAlunoCompletoByRA(ra);
    if (alunoCompleto) {
      const totalPresencas = await getTotalPresencasByAluno(alunoCompleto.id);
      return {
        ...convertSupabaseToStudent(alunoCompleto),
        attendanceCount: totalPresencas
      };
    }
    return undefined;
  } catch (error) {
    console.warn('Erro ao buscar aluno do Supabase, usando localStorage:', error);
    return getStudentByRAFromLocalStorage(ra);
  }
};

export const recordAttendance = async (ra: string, qrToken?: string): Promise<boolean> => {
  try {
    if (qrToken) {
      // Usar ID do usuário atual como registrador (temporário - implementar autenticação depois)
      const success = await recordAttendanceByRAAndQR(ra, qrToken, 1);
      if (success) {
        return true;
      }
    }
    throw new Error('Falha ao registrar no Supabase');
  } catch (error) {
    console.warn('Erro ao registrar presença no Supabase, usando localStorage:', error);
    return recordAttendanceToLocalStorage(ra);
  }
};

// Funções de fallback para localStorage
const getStudentsFromLocalStorage = (): Student[] => {
  try {
    const studentsJson = localStorage.getItem('jj-students');
    if (!studentsJson) {
      return [];
    }
    return JSON.parse(studentsJson);
  } catch (error) {
    console.warn('Storage access denied, returning empty array:', error);
    return [];
  }
};

const saveStudentToLocalStorage = (student: Student): Student => {
  try {
    const students = getStudentsFromLocalStorage();
    const existingIndex = students.findIndex(s => s.ra === student.ra);
    
    if (existingIndex >= 0) {
      students[existingIndex] = student;
    } else {
      // Gerar ID único para novo aluno
      const newStudent = { ...student, id: new Date().getTime().toString() };
      students.push(newStudent);
      student = newStudent;
    }
    
    localStorage.setItem('jj-students', JSON.stringify(students));
    return student;
  } catch (error) {
    console.warn('Storage access denied, returning student without saving:', error);
    return student;
  }
};

const getStudentByRAFromLocalStorage = (ra: string): Student | undefined => {
  const students = getStudentsFromLocalStorage();
  return students.find(s => s.ra === ra);
};

const recordAttendanceToLocalStorage = (ra: string): boolean => {
  try {
    const students = getStudentsFromLocalStorage();
    const studentIndex = students.findIndex(s => s.ra === ra);
    
    if (studentIndex >= 0) {
      students[studentIndex].attendanceCount += 1;
      localStorage.setItem('jj-students', JSON.stringify(students));
      
      // Salvar registro de presença
      const attendances = getAttendances();
      const newAttendance = {
        id: new Date().getTime().toString(),
        studentRA: ra,
        date: new Date()
      };
      attendances.push(newAttendance);
      localStorage.setItem('jj-attendances', JSON.stringify(attendances));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.warn('Storage access denied, cannot record attendance:', error);
    return false;
  }
};

export const getAttendances = () => {
  try {
    const attendancesJson = localStorage.getItem('jj-attendances');
    if (!attendancesJson) {
      return [];
    }
    return JSON.parse(attendancesJson);
  } catch (error) {
    console.warn('Storage access denied, returning empty attendances:', error);
    return [];
  }
};
