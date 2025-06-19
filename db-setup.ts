import { seedDatabase, clearTestData } from './src/lib/seed-database';

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  console.log('🚀 Iniciando operação no banco de dados...\n');

  switch (command) {
    case 'seed':
      console.log('📦 Populando banco de dados com dados de exemplo...');
      const seedSuccess = await seedDatabase();
      if (seedSuccess) {
        console.log('\n✅ Banco de dados populado com sucesso!');
        console.log('📋 Dados criados:');
        console.log('  - 3 alunos de exemplo');
        console.log('  - 1 professor');
        console.log('  - 1 monitor');
        console.log('  - 1 turma');
        console.log('  - 1 aula com QR token: EXEMPLO_QR_TOKEN_123');
        console.log('  - Algumas presenças de exemplo');
      } else {
        console.log('\n❌ Falha ao popular banco de dados');
        process.exit(1);
      }
      break;

    case 'clear':
      console.log('🗑️ Limpando dados de teste...');
      const clearSuccess = await clearTestData();
      if (clearSuccess) {
        console.log('\n✅ Dados de teste removidos!');
      } else {
        console.log('\n❌ Falha ao limpar dados de teste');
        process.exit(1);
      }
      break;

    case 'reset':
      console.log('🔄 Resetando banco de dados...');
      const clearResult = await clearTestData();
      if (clearResult) {
        console.log('✅ Dados antigos removidos');
        const seedResult = await seedDatabase();
        if (seedResult) {
          console.log('\n✅ Banco de dados resetado com sucesso!');
        } else {
          console.log('\n❌ Falha ao repovoar banco de dados');
          process.exit(1);
        }
      } else {
        console.log('\n❌ Falha ao limpar dados antigos');
        process.exit(1);
      }
      break;

    default:
      console.log('📚 Uso: npx tsx db-setup.ts [comando]');
      console.log('\nComandos disponíveis:');
      console.log('  seed  - Popula o banco com dados de exemplo');
      console.log('  clear - Remove todos os dados de teste');
      console.log('  reset - Limpa e repopula o banco');
      console.log('\nExemplo: npx tsx db-setup.ts seed');
      break;
  }
}

main().catch(console.error);
