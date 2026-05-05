# Sistema de Especialidades Concluidas

Aplicacao web em Next.js com TypeScript para controlar especialidades concluidas por desbravadores. O login usa Google OAuth via Auth.js/NextAuth, o banco usa PostgreSQL com Prisma ORM, e as constraints do banco impedem codigos e vinculos duplicados.

## Funcionalidades

- Login com Google.
- Dashboard com totais de desbravadores, especialidades e conclusoes.
- CRUD de desbravadores somente para administradores.
- Importacao de desbravadores por CSV somente para administradores.
- Especialidades permanecem no banco/API para registro, sem tela de cadastro no menu.
- Registro em massa por desbravador.
- Registro em massa por especialidade.
- Listagem de especialidades concluidas com responsavel e data/hora.
- Exclusao segura de vinculos.
- Bloqueio de exclusao de desbravadores/especialidades que possuem registros concluidos.
- Alteracao e exclusao restritas ao usuario que cadastrou ou a administradores.

## Variaveis de ambiente

Crie `.env` a partir de `.env.example` para ambiente local, ou configure na Vercel:

```env
AUTH_SECRET="segredo-gerado"
AUTH_GOOGLE_ID="client-id-google"
AUTH_GOOGLE_SECRET="client-secret-google"
AUTH_URL="https://seu-dominio.vercel.app"
AUTH_TRUST_HOST="true"
ADMIN_EMAILS="admin@example.com,outro-admin@example.com"
DATABASE_URL="postgresql://..."
```

Na Vercel, coloque apenas o valor no campo **Value**, sem aspas e sem `NOME=`.

`ADMIN_EMAILS` e uma lista separada por virgulas. Esses usuarios podem alterar e excluir qualquer registro. Quem nao esta nessa lista so pode alterar ou excluir registros que ele mesmo cadastrou.

Use `ADMIN_EMAILS` para definir pelo menos o primeiro administrador. Depois do login, esse administrador pode cadastrar outros pela tela `/administradores`.

## Google OAuth

No Google Cloud:

1. Acesse **Google Auth Platform > Branding** e configure a tela de consentimento.
2. Em **Publico-alvo**, escolha o publico adequado.
3. Em **Clientes**, crie um cliente do tipo **Aplicativo da Web**.
4. Adicione o redirect URI:

```text
https://seu-dominio.vercel.app/api/auth/callback/google
```

5. Copie o **ID do cliente** para `AUTH_GOOGLE_ID`.
6. Copie a **Chave secreta do cliente** para `AUTH_GOOGLE_SECRET`.

## Banco PostgreSQL / Supabase

Use uma connection string PostgreSQL em `DATABASE_URL`. Para Supabase na Vercel, prefira a URL do pooler:

```text
postgresql://postgres.xxxxx:SENHA@aws-1-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

Se a senha tiver caracteres especiais, codifique na URL ou troque por uma senha com letras e numeros.

## Migrations

Com Node/npm instalado:

```bash
npm install
npm run prisma:migrate
```

Se estiver usando Supabase sem rodar localmente, cole no **SQL Editor** o conteudo de:

```text
supabase-auth-schema.sql
```

Esse arquivo cria as tabelas do Auth.js e tambem:

- `desbravador`
- `especialidades`
- `especialidade_completa`

## Seed opcional

```bash
npm run prisma:seed
```

O seed cria alguns exemplos de desbravadores e especialidades.

## Rodar localmente

```bash
npm install
npm run prisma:migrate
npm run dev
```

Abra:

```text
http://localhost:3000
```

Para login local, adicione no Google OAuth:

```text
http://localhost:3000/api/auth/callback/google
```

## Deploy na Vercel

1. Envie o projeto para o GitHub.
2. Importe o repositorio na Vercel.
3. Configure as variaveis de ambiente.
4. Rode as migrations ou o SQL no Supabase.
5. Faca deploy.

Depois do deploy, teste:

```text
https://seu-dominio.vercel.app/api/auth/providers
```

Deve retornar um JSON com o provider `google`.

## Endpoints

Autenticacao:

- `GET /api/auth/session`
- Rotas padrao do Auth.js para Google OAuth

Desbravadores:

- `GET /api/desbravadores`
- `POST /api/desbravadores`
- `POST /api/desbravadores/importar`
- `GET /api/desbravadores/:id`
- `PUT /api/desbravadores/:id`
- `DELETE /api/desbravadores/:id`

## Importar desbravadores por CSV

A tela `/desbravadores` possui upload de CSV para administradores. O arquivo deve conter as colunas:

```csv
id,Nome,Unidade
D001,Ana Silva,Aguias
D002,Bruno Souza,Leoes
```

Tambem sao aceitos arquivos separados por ponto e virgula:

```csv
id;Nome;Unidade
D001;Ana Silva;Aguias
```

Mapeamento:

- `id` vira `codigo_desbravador`
- `Nome` vira `nome_desbravador`
- `Unidade` vira `unidade`

O sistema bloqueia a importacao se houver `id` repetido no arquivo ou se algum codigo ja existir no banco.

Especialidades:

- `GET /api/especialidades`
- `POST /api/especialidades`
- `GET /api/especialidades/:id`
- `PUT /api/especialidades/:id`
- `DELETE /api/especialidades/:id`

Especialidades concluidas:

- `GET /api/completas`
- `POST /api/completas/por-desbravador`
- `POST /api/completas/por-especialidade`
- `DELETE /api/completas/:id`

## Rotas da interface

- `/` login
- `/dashboard`
- `/desbravadores` somente para administradores
- `/registrar/desbravador`
- `/registrar/especialidade`
- `/completas`
- `/administradores`
