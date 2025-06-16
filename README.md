# UNA Vagas

Um sistema moderno de gerenciamento de vagas desenvolvido com Next.js, TypeScript e Prisma.

## 🌐 Acesso ao Deploy

A aplicação está disponível para visualização e teste no seguinte link:

**URL:** [https://una-vagas.vercel.app/](https://una-vagas.vercel.app/)

#### **Perfil: Candidato**

- **Como acessar:** A melhor forma de testar é criando seu próprio usuário.
- **Página de Cadastro:** [https://una-vagas.vercel.app/cadastro](https://una-vagas.vercel.app/cadastro)
- **Observação:** Lembre-se que este é um ambiente de demonstração. **Não utilize dados ou senhas reais**.

## 🚀 Sobre o Projeto

UNA Vagas é uma plataforma completa para gerenciamento de oportunidades de trabalho para estudantes da UNA Itabira, permitindo que empresas publiquem vagas e candidatos encontrem oportunidades adequadas ao seu perfil.

## ✨ Funcionalidades

- 📋 **Gerenciamento de Vagas**: Criação, edição e exclusão de oportunidades
- 👥 **Sistema de Candidaturas**: Processo simplificado para aplicação em vagas
- 🔐 **Autenticação**: Sistema seguro de login e registro
- 📊 **Painel Administrativo**: Interface completa para gestão do sistema
- 📱 **Design Responsivo**: Experiência otimizada para todos os dispositivos
- 🔍 **Busca Avançada**: Filtros inteligentes para encontrar vagas específicas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM
- **Authentication**: NextAuth.js
- **Deploy**: Vercel

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- Node.js (versão 18 ou superior)
- npm ou yarn
- Banco de dados (PostgreSQL, MySQL ou SQLite)

## 🚀 Instalação

1. **Clone o repositório**

   ```bash
   git clone https://github.com/ArthurViniciusBA1/una-vagas.git
   cd una-vagas
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   cp .env.example .env
   ```

   Edite o arquivo `.env` com suas configurações:

   ```env
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
    JWT_SECRET="SUA_CHAVE_SECRETA_DE_32_CARACTERES_AQUI"
    ENCRYPTION_KEY="SUA_CHAVE_DE_64_CARACTERES_HEXADECIMAIS_AQUI"
   ```

    Como gerar as chaves:

    - JWT_SECRET: Você pode usar o comando openssl rand -base64 32 no terminal.

    - ENCRYPTION_KEY: Você pode usar openssl rand -hex 32.

4. **Execute as migrações do banco de dados**

   ```bash
   npx prisma migrate dev
   ```

5. **Inicie o servidor de desenvolvimento**

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

6. **Acesse a aplicação**

   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```md
una-vagas/
├── prisma/              # Esquemas e migrações do banco
├── public/              # Arquivos estáticos
├── src/
│   ├── app/            # App Router do Next.js
│   ├── components/     # Componentes reutilizáveis
│   ├── lib/           # Utilitários e configurações
│   └── types/         # Definições de tipos TypeScript
├── .env.example       # Exemplo de variáveis de ambiente
├── next.config.ts     # Configuração do Next.js
├── tailwind.config.js # Configuração do Tailwind
└── tsconfig.json      # Configuração do TypeScript
```

## 🗄️ Banco de Dados

O projeto utiliza Prisma como ORM. Para visualizar e gerenciar o banco de dados:

```bash
npx prisma studio
```

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para o GitHub
2. Conecte seu repositório no [Vercel](https://vercel.com)
3. Configure as variáveis de ambiente
4. Deploy automático será realizado

### Outros Provedores

O projeto pode ser deployado em qualquer provedor que suporte Next.js:

```bash
npm run build
npm start
```

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria a build de produção
- `npm run start` - Inicia o servidor de produção
- `npm run lint` - Executa o linter
- `npx prisma studio` - Abre o Prisma Studio
- `npx prisma migrate dev` - Executa migrações em desenvolvimento

⭐ Se a ideia te agrada, considere dar uma estrela no repositório!
