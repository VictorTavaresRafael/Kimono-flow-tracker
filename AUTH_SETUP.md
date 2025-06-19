# Configuração de Autenticação - Sistema de Controle JJ

## Configuração no Supabase Dashboard

### 1. Configurar RLS (Row Level Security)

Acesse o Supabase Dashboard e execute os seguintes comandos SQL:

```sql
-- Habilitar RLS para a tabela usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam dados
CREATE POLICY "Usuários autenticados podem ver dados" ON usuarios
FOR SELECT 
TO authenticated 
USING (true);

-- Política para permitir criação de usuários durante cadastro
CREATE POLICY "Permitir inserção durante cadastro" ON usuarios
FOR INSERT 
TO authenticated 
USING (true);

-- Política para permitir atualização dos próprios dados
CREATE POLICY "Usuários podem atualizar próprios dados" ON usuarios
FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = id::text);
```

### 2. Configurar Email Templates (Opcional)

No Supabase Dashboard:
1. Vá para Authentication > Email Templates
2. Customize as mensagens de confirmação de email
3. Configure o domínio de redirecionamento

### 3. Configurar Providers de Autenticação

Por padrão, apenas email/senha está habilitado. Para adicionar outros:
1. Vá para Authentication > Providers
2. Configure Google, GitHub, etc. se necessário

### 4. Configurar Redirect URLs

Em Authentication > URL Configuration:
- Site URL: `http://localhost:8081` (desenvolvimento)
- Redirect URLs: `http://localhost:8081/**`

## Como usar o Sistema

### 1. Primeira vez - Criar conta de administrador

1. Acesse `http://localhost:8081/auth`
2. Clique em "Criar nova conta"
3. Preencha os dados:
   - Email: seu email
   - Nome: Seu nome completo
   - RA: PROF001 (ou MON001 para monitor)
   - Função: Professor (ou Monitor)
   - Senha: mínimo 6 caracteres

### 2. Confirmação de Email

1. Verifique seu email
2. Clique no link de confirmação
3. Volte para a aplicação e faça login

### 3. Usando o Sistema

Após fazer login, você terá acesso a:
- Dashboard principal com lista de alunos
- Cadastro e edição de alunos
- Registro de presenças
- Geração de QR codes

### 4. Logout

Use o botão "Sair" no canto superior direito.

## Funcionalidades Implementadas

### ✅ Autenticação
- Login com email e senha
- Cadastro de novos usuários (professores/monitores)
- Logout
- Proteção de rotas
- Persistência de sessão

### ✅ Interface
- Tela de login/cadastro responsiva
- Header com informações do usuário
- Botão de logout em todas as páginas
- Indicadores de carregamento

### ✅ Integração
- Contexto React para gerenciar estado
- Integração com Supabase Auth
- Fallback para erros de conexão
- Mensagens de feedback para o usuário

## Estrutura dos Arquivos

```
src/
├── contexts/
│   └── AuthContext.tsx        # Contexto de autenticação
├── components/
│   └── ProtectedRoute.tsx     # Componente para proteger rotas
├── pages/
│   └── Auth.tsx              # Tela de login/cadastro
└── ...
```

## Próximos Passos

1. **Configurar roles mais granulares** - Diferentes permissões para professores vs monitores
2. **Implementar recuperação de senha** - "Esqueci minha senha"
3. **Adicionar confirmação de ações** - Confirmação antes de deletar dados
4. **Audit logs** - Registrar quem fez o quê e quando
5. **Configurar produção** - URLs e configurações para ambiente de produção

## Troubleshooting

### Erro: "Invalid login credentials"
- Verifique se o email está correto
- Confirme se a conta foi verificada por email
- Tente resetar a senha

### Erro: "Email not confirmed"
- Verifique a caixa de spam
- Reenvie o email de confirmação no Supabase Dashboard

### Não consegue se cadastrar
- Verifique se o RA não está duplicado
- Confirme se todos os campos estão preenchidos
- Verifique o console do navegador para erros detalhados
