# Login com Google usando Next.js, Auth.js e Supabase

Aplicacao minima em Next.js com TypeScript para testar login com Google usando Auth.js/NextAuth e Supabase Postgres como banco de dados.

## Requisitos

- Node.js 20 ou superior
- Conta Google Cloud
- Projeto Supabase
- Conta Vercel

## Publicar na web

O fluxo principal deste projeto e rodar na Vercel. Voce nao precisa rodar a aplicacao localmente para publicar.

1. Crie um repositorio GitHub para este projeto.
2. Envie estes arquivos para o repositorio.
3. Acesse a [Vercel](https://vercel.com/).
4. Clique em **Add New > Project**.
5. Importe o repositorio.
6. Configure as variaveis de ambiente listadas abaixo.
7. Clique em **Deploy**.

## Configurar Google OAuth

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie ou selecione um projeto.
3. Va em **APIs e servicos > Tela de consentimento OAuth** e configure a tela de consentimento.
4. Va em **APIs e servicos > Credenciais**.
5. Clique em **Criar credenciais > ID do cliente OAuth**.
6. Escolha **Aplicativo da Web**.
7. Adicione os URIs de redirecionamento autorizados:

```text
https://seu-dominio.vercel.app/api/auth/callback/google
```

8. Copie o **Client ID** para `AUTH_GOOGLE_ID`.
9. Copie o **Client Secret** para `AUTH_GOOGLE_SECRET`.

## Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com/).
2. Abra **Project Settings > Database**.
3. Copie a connection string Postgres.
4. Use essa connection string em `DATABASE_URL`.

As tabelas do Auth.js precisam existir no banco. Como o objetivo e publicar direto na web, use o painel do Supabase:

1. Abra o projeto no Supabase.
2. Va em **SQL Editor**.
3. Cole o conteudo do arquivo `supabase-auth-schema.sql`.
4. Clique em **Run**.

Isso cria as tabelas `User`, `Account`, `Session` e `VerificationToken` usadas pelo Auth.js.

## Configurar variaveis na Vercel

No painel da Vercel, abra o projeto e va em **Settings > Environment Variables**.

Adicione:

```env
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."
AUTH_URL="https://seu-dominio.vercel.app"
DATABASE_URL="postgresql://..."
```

Use a URL final da Vercel em `AUTH_URL`. Essa mesma URL deve estar cadastrada no Google OAuth como redirecionamento autorizado.

Para gerar `AUTH_SECRET`, voce pode usar:

```bash
npx auth secret
```

Ou gere uma string segura pelo painel/terminal de sua preferencia.

## Deploy na Vercel

Depois de configurar as variaveis:

1. Va em **Deployments**.
2. Clique em **Redeploy** se o primeiro deploy tiver sido feito antes das variaveis.
3. Acesse `https://seu-dominio.vercel.app`.
4. Clique em **Entrar com Google**.
5. Depois do login, o usuario sera redirecionado para `/protegido`.

Na pagina protegida, o app mostra:

```text
Logado
```

Tambem mostra nome, e-mail e o botao **Sair** quando esses dados estiverem disponiveis.

## Rodar localmente, opcional

Este passo nao e necessario para publicar na web. Use somente se quiser testar antes do deploy ou preferir criar as tabelas via Prisma.

```bash
npm install
cp .env.example .env
npm run prisma:push
npm run dev
```

Para login local, adicione tambem `http://localhost:3000/api/auth/callback/google` no Google OAuth.

## Arquivos principais

- `auth.ts`: configuracao do Auth.js com Google e Prisma Adapter.
- `app/protegido/page.tsx`: protege a rota `/protegido` com `auth()` e redireciona usuarios sem sessao.
- `app/page.tsx`: tela inicial com o botao **Entrar com Google**.
- `prisma/schema.prisma`: tabelas usadas pelo Auth.js no Supabase.
