import { supabase } from './supabase';

// Função para criar dados de exemplo
export const seedDatabase = async () => {
  try {
    console.log('Iniciando população do banco de dados...');

    // 1. Criar usuários de exemplo
    const usuarios = [
      {
        ra: '2024001',
        nome: 'João Silva',
        tipo: 'aluno' as const,
        senha_hash: 'hash_temporario'
      },
      {
        ra: '2024002',
        nome: 'Maria Santos',
        tipo: 'aluno' as const,
        senha_hash: 'hash_temporario'
      },
      {
        ra: '2024003',
        nome: 'Pedro Oliveira',
        tipo: 'aluno' as const,
        senha_hash: 'hash_temporario'
      },
      {
        ra: 'PROF001',
        nome: 'Professor Roberto',
        tipo: 'professor' as const,
        senha_hash: 'hash_temporario'
      },
      {
        ra: 'MON001',
        nome: 'Monitor Carlos',
        tipo: 'monitor' as const,
        senha_hash: 'hash_temporario'
      }
    ];

    // Inserir usuários
    const { data: usuariosInseridos, error: usuariosError } = await supabase
      .from('usuarios')
      .insert(usuarios)
      .select();

    if (usuariosError) {
      console.error('Erro ao inserir usuários:', usuariosError);
      return;
    }

    console.log('Usuários criados:', usuariosInseridos);

    // 2. Criar detalhes dos alunos
    const alunosDetalhes = usuariosInseridos
      .filter(u => u.tipo === 'aluno')
      .map((aluno, index) => ({
        aluno_id: aluno.id,
        faixa: ['Branca', 'Azul', 'Roxa'][index] || 'Branca',
        peso: [70.5, 65.0, 80.2][index] || 70.0,
        altura: [175, 168, 182][index] || 175,
        tempo_pratica: [365, 730, 1095][index] || 365 // dias
      }));

    const { error: detalhesError } = await supabase
      .from('alunos_detalhes')
      .insert(alunosDetalhes);

    if (detalhesError) {
      console.error('Erro ao inserir detalhes dos alunos:', detalhesError);
      return;
    }

    console.log('Detalhes dos alunos criados');

    // 3. Criar turma de exemplo
    const professor = usuariosInseridos.find(u => u.tipo === 'professor');
    if (professor) {
      const { data: turma, error: turmaError } = await supabase
        .from('turmas')
        .insert({
          nome: 'Jiu-Jitsu Iniciante',
          descricao: 'Turma para iniciantes no jiu-jitsu',
          professor_id: professor.id,
          criado_em: new Date().toISOString()
        })
        .select()
        .single();

      if (turmaError) {
        console.error('Erro ao criar turma:', turmaError);
        return;
      }

      console.log('Turma criada:', turma);

      // 4. Associar alunos à turma
      const alunosIds = usuariosInseridos
        .filter(u => u.tipo === 'aluno')
        .map(aluno => ({
          aluno_id: aluno.id,
          turma_id: turma.id
        }));

      const { error: alunosTurmasError } = await supabase
        .from('alunos_turmas')
        .insert(alunosIds);

      if (alunosTurmasError) {
        console.error('Erro ao associar alunos à turma:', alunosTurmasError);
        return;
      }

      console.log('Alunos associados à turma');

      // 5. Criar aula de exemplo
      const { data: aula, error: aulaError } = await supabase
        .from('aulas')
        .insert({
          turma_id: turma.id,
          data_hora: new Date().toISOString(),
          qr_token: 'EXEMPLO_QR_TOKEN_123',
          criado_em: new Date().toISOString()
        })
        .select()
        .single();

      if (aulaError) {
        console.error('Erro ao criar aula:', aulaError);
        return;
      }

      console.log('Aula criada:', aula);

      // 6. Registrar algumas presenças de exemplo
      const presencas = usuariosInseridos
        .filter(u => u.tipo === 'aluno')
        .slice(0, 2) // Apenas os 2 primeiros alunos
        .map(aluno => ({
          aula_id: aula.id,
          aluno_id: aluno.id,
          registrada_por: professor.id,
          horario: new Date().toISOString()
        }));

      const { error: presencasError } = await supabase
        .from('presencas')
        .insert(presencas);

      if (presencasError) {
        console.error('Erro ao registrar presenças:', presencasError);
        return;
      }

      console.log('Presenças registradas');
    }

    console.log('✅ Banco de dados populado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    return false;
  }
};

// Função para limpar dados de teste
export const clearTestData = async () => {
  try {
    console.log('Limpando dados de teste...');

    // Deletar em ordem (respeitando foreign keys)
    await supabase.from('presencas').delete().neq('id', 0);
    await supabase.from('aulas').delete().neq('id', 0);
    await supabase.from('alunos_turmas').delete().neq('aluno_id', 0);
    await supabase.from('monitores_turmas').delete().neq('monitor_id', 0);
    await supabase.from('turmas').delete().neq('id', 0);
    await supabase.from('alunos_detalhes').delete().neq('aluno_id', 0);
    await supabase.from('usuarios').delete().neq('id', 0);

    console.log('✅ Dados de teste removidos!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao limpar dados de teste:', error);
    return false;
  }
};
