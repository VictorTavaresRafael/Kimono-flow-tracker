# Integração com Supabase - Sistema de Controle de Alunos

## Configuração do Banco de Dados

### 1. Configuração das Variáveis de Ambiente

O arquivo `.env` já está configurado com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://ujxbxsxyoczlysxyzyoj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Criação do Schema do Banco

Execute o SQL contido no arquivo `database-schema.sql` no seu Supabase para criar todas as tabelas necessárias:

1. Acesse seu projeto no Supabase Dashboard
2. Vá para "SQL Editor"
3. Cole e execute o conteúdo do arquivo `database-schema.sql`

### 3. Estrutura do Banco de Dados

O sistema utiliza as seguintes tabelas:

- **usuarios**: Tabela principal com todos os usuários (alunos, professores, monitores)
- **alunos_detalhes**: Detalhes específicos dos alunos (faixa, peso, altura, tempo de prática)
- **turmas**: Turmas de jiu-jitsu
- **aulas**: Aulas com QR codes para presença
- **presencas**: Registro de presenças
- **alunos_turmas**: Relacionamento entre alunos e turmas
- **monitores_turmas**: Relacionamento entre monitores e turmas

## Funcionamento da Aplicação

### Sistema Híbrido (Supabase + localStorage)

A aplicação foi projetada com um sistema híbrido que:

1. **Prioriza o Supabase** para persistência de dados
2. **Usa localStorage como fallback** em caso de erro de conexão
3. **Migra automaticamente** dados do localStorage para Supabase quando possível

### Funcionalidades Implementadas

#### 1. Gestão de Alunos
- Cadastro de alunos com conversão automática para o formato Supabase
- Busca de alunos por RA
- Listagem de todos os alunos com contagem de presenças

#### 2. Registro de Presenças
- Registro por RA do aluno
- Suporte a QR code para aulas (quando implementado)
- Contagem automática de presenças por aluno

#### 3. Compatibilidade com Sistema Anterior
- Conversão automática entre os formatos antigo e novo
- Migração transparente de dados
- Manutenção da interface existente

## Arquivos Principais

### `src/lib/supabase.ts`
Configuração do cliente Supabase com as variáveis de ambiente.

### `src/lib/supabase-service.ts`
Serviços para interação com o Supabase:
- CRUD de usuários e alunos
- Gestão de turmas e aulas
- Registro de presenças
- Funções de conversão entre formatos

### `src/utils/helpers.ts`
Funções principais da aplicação com fallback para localStorage:
- `getStudents()`: Busca todos os alunos
- `saveStudent()`: Salva/atualiza aluno
- `getStudentByRA()`: Busca aluno por RA
- `recordAttendance()`: Registra presença

### `src/types/student.ts`
Definições de tipos para:
- Tipos do banco de dados (Usuario, AlunoDetalhes, etc.)
- Tipos legados para compatibilidade
- Interfaces combinadas (AlunoCompleto)

## Como Usar

### 1. Desenvolvimento
```bash
# Instalar dependências
bun install

# Executar em modo desenvolvimento
bun run dev
```

### 2. Testando a Integração

1. **Cadastrar um aluno**: Use a interface para cadastrar um novo aluno
2. **Verificar no Supabase**: Confirme que os dados foram salvos nas tabelas `usuarios` e `alunos_detalhes`
3. **Registrar presença**: Use a página de presença para registrar a presença de um aluno
4. **Verificar registro**: Confirme que a presença foi registrada na tabela `presencas`

### 3. Fallback para localStorage

Se o Supabase estiver indisponível:
- Os dados serão automaticamente salvos no localStorage
- A aplicação continuará funcionando normalmente
- Quando a conexão for restaurada, você pode migrar os dados manualmente

## Próximos Passos

### 1. Sistema de Autenticação
- Implementar autenticação com Supabase Auth
- Criar sistema de login para professores/monitores
- Associar presenças ao usuário que as registrou

### 2. QR Code para Aulas
- Gerar QR codes únicos para cada aula
- Permitir registro de presença via QR code
- Implementar validação de tempo para QR codes

### 3. Dashboard Avançado
- Relatórios de frequência
- Gráficos de desempenho
- Gestão de turmas e horários

### 4. Migração de Dados
- Script para migrar dados do localStorage para Supabase
- Sincronização automática quando online

## Estrutura de Dados

### Conversão de Faixas
```typescript
// Sistema antigo -> Novo
'white' -> 'Branca'
'blue' -> 'Azul' 
'purple' -> 'Roxa'
'brown' -> 'Marrom'
'black' -> 'Preta'
```

### Exemplo de Dados
```typescript
// Formato antigo (Student)
{
  id: "123",
  ra: "2024001",
  name: "João Silva",
  belt: "blue",
  weight: 70.5,
  height: 175,
  attendanceCount: 5
}

// Formato novo (Usuario + AlunoDetalhes)
Usuario: {
  id: 1,
  ra: "2024001", 
  nome: "João Silva",
  tipo: "aluno"
}
AlunoDetalhes: {
  aluno_id: 1,
  faixa: "Azul",
  peso: 70.5,
  altura: 175
}
```

## Suporte

Para questões sobre a integração com Supabase, verifique:
1. Logs do console do navegador
2. Rede de conexão com o Supabase
3. Configuração das variáveis de ambiente
4. Permissões no Supabase Dashboard
