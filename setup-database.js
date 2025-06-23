import { supabase } from './src/lib/supabase';

// Script para configuração inicial do banco de dados
async function setupDatabase() {
  console.log('🚀 Iniciando configuração do banco de dados...');

  try {
    // 1. Verificar conexão
    const { data, error } = await supabase.from('usuarios').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Erro de conexão com Supabase:', error.message);
      console.log('💡 Verifique suas credenciais no arquivo .env');
      return;
    }

    console.log('✅ Conexão com Supabase estabelecida');

    // 2. Verificar se existem usuários
    const userCount = data || 0;
    console.log(`📊 Usuários no sistema: ${userCount}`);

    // 3. Configurar RLS (Row Level Security)
    console.log('🔒 Configurando políticas de segurança...');
    
    const policies = [
      `ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;`,
      `CREATE POLICY IF NOT EXISTS "Usuários autenticados podem ver dados" ON usuarios FOR SELECT TO authenticated USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Permitir inserção durante cadastro" ON usuarios FOR INSERT TO authenticated USING (true);`,
      `CREATE POLICY IF NOT EXISTS "Usuários podem atualizar próprios dados" ON usuarios FOR UPDATE TO authenticated USING (auth.uid()::text = id::text);`
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
      if (policyError && !policyError.message.includes('already exists')) {
        console.warn('⚠️ Aviso ao configurar política:', policyError.message);
      }
    }

    console.log('✅ Políticas de segurança configuradas');

    // 4. Criar usuário admin padrão (opcional)
    if (userCount === 0) {
      console.log('👤 Nenhum usuário encontrado. Você pode criar o primeiro usuário via interface web.');
    }

    console.log('🎉 Configuração concluída com sucesso!');
    console.log('📝 Próximos passos:');
    console.log('   1. Execute: npm run dev');
    console.log('   2. Acesse: http://localhost:8081/auth');
    console.log('   3. Crie sua primeira conta de administrador');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
