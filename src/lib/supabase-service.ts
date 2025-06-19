import { supabase } from './supabase';
import { 
  Usuario, 
  AlunoDetalhes, 
  Turma, 
  Aula, 
  Presenca, 
  AlunoCompleto,
  UserRole,
  BeltType,
  Student
} from '@/types/student';

// Função para converter faixa do sistema antigo para o novo
const convertBeltToFaixa = (belt: string): string => {
  const beltMap: { [key: string]: string } = {
    'white': 'Branca',
    'blue': 'Azul',
    'purple': 'Roxa',
    'brown': 'Marrom',
    'black': 'Preta'
  };
  return beltMap[belt] || belt;
};

// Função para converter faixa do novo sistema para o antigo
const convertFaixaToBelt = (faixa: string): string => {
  const faixaMap: { [key: string]: string } = {
    'Branca': 'white',
    'Azul': 'blue',
    'Roxa': 'purple',
    'Marrom': 'brown',
    'Preta': 'black'
  };
  return faixaMap[faixa] || 'white';
};

// Usuários
export const getUsuarios = async (): Promise<Usuario[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*');
  
  if (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
  
  return data || [];
};

export const getUsuarioByRA = async (ra: string): Promise<Usuario | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('ra', ra)
    .single();
  
  if (error) {
    console.error('Erro ao buscar usuário por RA:', error);
    return null;
  }
  
  return data;
};

export const createUsuario = async (usuario: Omit<Usuario, 'id' | 'criado_em'>): Promise<Usuario | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      ...usuario,
      criado_em: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar usuário:', error);
    return null;
  }
  
  return data;
};

// Alunos Detalhes
export const getAlunoDetalhes = async (alunoId: number): Promise<AlunoDetalhes | null> => {
  const { data, error } = await supabase
    .from('alunos_detalhes')
    .select('*')
    .eq('aluno_id', alunoId)
    .single();
  
  if (error) {
    console.error('Erro ao buscar detalhes do aluno:', error);
    return null;
  }
  
  return data;
};

export const saveAlunoDetalhes = async (detalhes: AlunoDetalhes): Promise<AlunoDetalhes | null> => {
  const { data, error } = await supabase
    .from('alunos_detalhes')
    .upsert(detalhes)
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao salvar detalhes do aluno:', error);
    return null;
  }
  
  return data;
};

// Alunos Completos (com detalhes)
export const getAlunosCompletos = async (): Promise<AlunoCompleto[]> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      alunos_detalhes (*)
    `)
    .eq('tipo', 'aluno');
  
  if (error) {
    console.error('Erro ao buscar alunos completos:', error);
    return [];
  }
  
  return data?.map(usuario => ({
    ...usuario,
    detalhes: usuario.alunos_detalhes?.[0] || null
  })) || [];
};

export const getAlunoCompletoByRA = async (ra: string): Promise<AlunoCompleto | null> => {
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      *,
      alunos_detalhes (*)
    `)
    .eq('ra', ra)
    .eq('tipo', 'aluno')
    .single();
  
  if (error) {
    console.error('Erro ao buscar aluno completo por RA:', error);
    return null;
  }
  
  return {
    ...data,
    detalhes: data.alunos_detalhes?.[0] || null
  };
};

export const saveAlunoCompleto = async (
  usuario: Omit<Usuario, 'id' | 'criado_em'>,
  detalhes: Omit<AlunoDetalhes, 'aluno_id'>
): Promise<AlunoCompleto | null> => {
  try {
    // Primeiro, criar ou atualizar o usuário
    let usuarioData: Usuario | null = null;
    
    // Verificar se o usuário já existe
    const existingUser = await getUsuarioByRA(usuario.ra);
    
    if (existingUser) {
      // Atualizar usuário existente
      const { data, error } = await supabase
        .from('usuarios')
        .update(usuario)
        .eq('ra', usuario.ra)
        .select()
        .single();
      
      if (error) throw error;
      usuarioData = data;
    } else {
      // Criar novo usuário
      usuarioData = await createUsuario(usuario);
    }
    
    if (!usuarioData) {
      throw new Error('Falha ao salvar usuário');
    }
    
    // Depois, salvar os detalhes
    const detalhesData = await saveAlunoDetalhes({
      ...detalhes,
      aluno_id: usuarioData.id
    });
    
    return {
      ...usuarioData,
      detalhes: detalhesData
    };
  } catch (error) {
    console.error('Erro ao salvar aluno completo:', error);
    return null;
  }
};

// Turmas
export const getTurmas = async (): Promise<Turma[]> => {
  const { data, error } = await supabase
    .from('turmas')
    .select('*');
  
  if (error) {
    console.error('Erro ao buscar turmas:', error);
    return [];
  }
  
  return data || [];
};

// Aulas
export const createAula = async (turmaId: number): Promise<Aula | null> => {
  const qrToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  const { data, error } = await supabase
    .from('aulas')
    .insert({
      turma_id: turmaId,
      data_hora: new Date().toISOString(),
      qr_token: qrToken,
      criado_em: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar aula:', error);
    return null;
  }
  
  return data;
};

export const getAulaByQRToken = async (qrToken: string): Promise<Aula | null> => {
  const { data, error } = await supabase
    .from('aulas')
    .select('*')
    .eq('qr_token', qrToken)
    .single();
  
  if (error) {
    console.error('Erro ao buscar aula por QR token:', error);
    return null;
  }
  
  return data;
};

// Presenças
export const recordPresenca = async (
  aulaId: number,
  alunoId: number,
  registradaPor: number
): Promise<boolean> => {
  // Verificar se já existe presença para este aluno nesta aula
  const { data: existingPresenca } = await supabase
    .from('presencas')
    .select('id')
    .eq('aula_id', aulaId)
    .eq('aluno_id', alunoId)
    .single();
  
  if (existingPresenca) {
    console.log('Presença já registrada para este aluno nesta aula');
    return false;
  }
  
  const { error } = await supabase
    .from('presencas')
    .insert({
      aula_id: aulaId,
      aluno_id: alunoId,
      registrada_por: registradaPor,
      horario: new Date().toISOString()
    });
  
  if (error) {
    console.error('Erro ao registrar presença:', error);
    return false;
  }
  
  return true;
};

export const getPresencasByAluno = async (alunoId: number): Promise<Presenca[]> => {
  const { data, error } = await supabase
    .from('presencas')
    .select('*')
    .eq('aluno_id', alunoId);
  
  if (error) {
    console.error('Erro ao buscar presenças do aluno:', error);
    return [];
  }
  
  return data || [];
};

export const getTotalPresencasByAluno = async (alunoId: number): Promise<number> => {
  const { count, error } = await supabase
    .from('presencas')
    .select('*', { count: 'exact', head: true })
    .eq('aluno_id', alunoId);
  
  if (error) {
    console.error('Erro ao contar presenças do aluno:', error);
    return 0;
  }
  
  return count || 0;
};

// Função para registrar presença por RA e QR token
export const recordAttendanceByRAAndQR = async (
  ra: string,
  qrToken: string,
  registradaPor: number
): Promise<boolean> => {
  try {
    // Buscar aluno
    const aluno = await getUsuarioByRA(ra);
    if (!aluno || aluno.tipo !== 'aluno') {
      console.error('Aluno não encontrado ou tipo inválido');
      return false;
    }
    
    // Buscar aula
    const aula = await getAulaByQRToken(qrToken);
    if (!aula) {
      console.error('Aula não encontrada para o QR token');
      return false;
    }
    
    // Registrar presença
    return await recordPresenca(aula.id, aluno.id, registradaPor);
  } catch (error) {
    console.error('Erro ao registrar presença por RA e QR:', error);
    return false;
  }
};

// Funções de compatibilidade com o sistema anterior
export const convertStudentToSupabase = async (student: Student): Promise<AlunoCompleto | null> => {
  const usuario: Omit<Usuario, 'id' | 'criado_em'> = {
    ra: student.ra,
    nome: student.name,
    tipo: 'aluno',
    senha_hash: '' // Será necessário implementar autenticação
  };
  
  const detalhes: Omit<AlunoDetalhes, 'aluno_id'> = {
    faixa: convertBeltToFaixa(student.belt),
    peso: student.weight,
    altura: student.height,
    tempo_pratica: student.beltStartDate ? 
      Math.floor((new Date().getTime() - new Date(student.beltStartDate).getTime()) / (1000 * 60 * 60 * 24)) : 
      null
  };
  
  return await saveAlunoCompleto(usuario, detalhes);
};

export const convertSupabaseToStudent = (alunoCompleto: AlunoCompleto): Student => {
  return {
    id: alunoCompleto.id.toString(),
    ra: alunoCompleto.ra,
    name: alunoCompleto.nome,
    belt: alunoCompleto.detalhes ? convertFaixaToBelt(alunoCompleto.detalhes.faixa) as BeltType : 'white',
    beltStartDate: alunoCompleto.detalhes?.tempo_pratica ? 
      new Date(Date.now() - (alunoCompleto.detalhes.tempo_pratica * 24 * 60 * 60 * 1000)) : 
      new Date(),
    attendanceCount: alunoCompleto.total_presencas || 0,
    weight: alunoCompleto.detalhes?.peso,
    height: alunoCompleto.detalhes?.altura
  };
};
