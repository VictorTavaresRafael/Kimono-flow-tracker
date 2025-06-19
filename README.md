
# Sistema de Controle de Alunos - Jiu-Jitsu

Um sistema completo para gerenciar alunos, presenças e atividades em academias de jiu-jitsu.

## 🚀 Funcionalidades

### ✅ Sistema de Autenticação
- Login seguro com email e senha
- Cadastro de professores e monitores
- Proteção de rotas
- Logout automático

### ✅ Gestão de Alunos
- Cadastro completo de alunos (nome, RA, faixa, peso, altura)
- Busca e filtragem
- Edição de dados
- Visualização de perfil detalhado

### ✅ Controle de Presença
- Registro rápido por RA
- Histórico de presenças
- Interface otimizada para mobile
- Geração de QR codes

### ✅ Dashboard Intuitivo
- Interface moderna e responsiva
- Informações do usuário logado
- Navegação intuitiva
- Feedback visual em tempo real

## 🛠 Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth + Database)
- **Roteamento**: React Router
- **Estado**: React Context
- **Formulários**: React Hook Form
- **Notificações**: Toast UI

## 📦 Instalação e Configuração

### 1. Clone o repositório
```sh
git clone <YOUR_GIT_URL>
cd kimono-flow-tracker
```

### 2. Instale as dependências
```sh
npm install
```

### 3. Configure as variáveis de ambiente
Renomeie `.env.example` para `.env` e configure:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

### 4. Configure o banco de dados
Execute o script SQL do arquivo `database-schema.sql` no seu Supabase Dashboard.

### 5. Inicie o servidor de desenvolvimento
```sh
npm run dev
```

## 🔐 Primeiro Acesso

1. Acesse `http://localhost:8081/auth`
2. Clique em "Criar nova conta"
3. Preencha os dados:
   - **Email**: seu email profissional
   - **Nome**: seu nome completo
   - **RA**: PROF001 (professores) ou MON001 (monitores)
   - **Função**: Professor ou Monitor
   - **Senha**: mínimo 6 caracteres
4. Confirme o email (verifique spam se necessário)
5. Faça login e comece a usar!

## 📖 Documentação Adicional

- [`SUPABASE_INTEGRATION.md`](./SUPABASE_INTEGRATION.md) - Detalhes da integração com Supabase
- [`AUTH_SETUP.md`](./AUTH_SETUP.md) - Configuração do sistema de autenticação
- [`database-schema.sql`](./database-schema.sql) - Schema do banco de dados

## 🎯 Como Usar

### Cadastrar Alunos
1. No dashboard, clique em "Adicionar Aluno"
2. Preencha os dados obrigatórios
3. Salve - o aluno será sincronizado automaticamente

### Registrar Presença
1. Acesse "Registrar Presença" no menu
2. Digite o RA do aluno
3. Confirme - a presença será registrada automaticamente

### Gerar QR Code
1. No dashboard, clique em "Gerar QR Code"
2. Use o código para registros rápidos via mobile

## 🔧 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
├── contexts/           # Contextos React (Auth, etc.)
├── hooks/              # Hooks customizados
├── lib/                # Bibliotecas e configurações
├── pages/              # Páginas da aplicação
├── types/              # Definições de tipos TypeScript
└── utils/              # Funções utilitárias
```

## 🚀 Deploy

### Desenvolvimento
```sh
npm run dev
```

### Build de Produção
```sh
npm run build
npm run preview
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 💡 Próximas Funcionalidades

- [ ] Relatórios de frequência
- [ ] Sistema de graduações
- [ ] Integração com WhatsApp
- [ ] App mobile nativo
- [ ] Sistema de pagamentos
- [ ] Calendário de eventos

## 📞 Suporte

Em caso de dúvidas ou problemas:
1. Verifique a documentação
2. Confira os logs do console
3. Abra uma issue no GitHub
- React
- shadcn-ui
- Tailwind CSS
