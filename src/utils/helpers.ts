
import { BeltType, Student } from "@/types/student";

export function calculateBeltTime(beltStartDate: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - beltStartDate.getTime());
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

// Mock data para desenvolvimento inicial
export const mockStudents: Student[] = [
  {
    id: '1',
    ra: '2023001',
    name: 'João Silva',
    belt: 'blue',
    beltStartDate: new Date(2022, 5, 15),
    weight: 75,
    height: 178,
    additionalInfo: 'Prefere treinar no horário da tarde. Foco em competições.',
    attendanceCount: 87
  },
  {
    id: '2',
    ra: '2023002',
    name: 'Maria Oliveira',
    belt: 'purple',
    beltStartDate: new Date(2021, 2, 10),
    weight: 62,
    height: 165,
    additionalInfo: 'Tem dificuldade com posição de guarda. Lesão antiga no joelho direito.',
    attendanceCount: 135
  },
  {
    id: '3',
    ra: '2023003',
    name: 'Pedro Santos',
    belt: 'white',
    beltStartDate: new Date(2023, 1, 20),
    weight: 82,
    height: 183,
    additionalInfo: 'Iniciante com experiência em judô.',
    attendanceCount: 23
  },
  {
    id: '4',
    ra: '2023004',
    name: 'Ana Costa',
    belt: 'brown',
    beltStartDate: new Date(2019, 8, 5),
    weight: 59,
    height: 162,
    additionalInfo: 'Professora assistente nas aulas infantis.',
    attendanceCount: 284
  },
  {
    id: '5',
    ra: '2023005',
    name: 'Lucas Mendes',
    belt: 'black',
    beltStartDate: new Date(2017, 4, 12),
    weight: 78,
    height: 175,
    additionalInfo: 'Professor principal. Especialista em finalizações.',
    attendanceCount: 512
  },
  {
    id: '6',
    ra: '2023006',
    name: 'Fernanda Lima',
    belt: 'blue',
    beltStartDate: new Date(2022, 10, 25),
    weight: 57,
    height: 160,
    additionalInfo: 'Atleta de competição. Técnica forte de raspagem.',
    attendanceCount: 68
  },
];

// Mock de armazenamento local
export const getStudents = (): Student[] => {
  const studentsJson = localStorage.getItem('jj-students');
  if (!studentsJson) {
    // Inicializa com dados mock na primeira vez
    localStorage.setItem('jj-students', JSON.stringify(mockStudents));
    return mockStudents;
  }
  return JSON.parse(studentsJson);
};

export const saveStudent = (student: Student) => {
  const students = getStudents();
  const existingIndex = students.findIndex(s => s.ra === student.ra);
  
  if (existingIndex >= 0) {
    students[existingIndex] = student;
  } else {
    // Gerar ID único para novo aluno
    student.id = new Date().getTime().toString();
    students.push(student);
  }
  
  localStorage.setItem('jj-students', JSON.stringify(students));
  return student;
};

export const getStudentByRA = (ra: string): Student | undefined => {
  const students = getStudents();
  return students.find(s => s.ra === ra);
};

export const recordAttendance = (ra: string): boolean => {
  const students = getStudents();
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
};

export const getAttendances = () => {
  const attendancesJson = localStorage.getItem('jj-attendances');
  if (!attendancesJson) {
    return [];
  }
  return JSON.parse(attendancesJson);
};
