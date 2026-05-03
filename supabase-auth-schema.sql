create table if not exists "User" (
  "id" text primary key,
  "name" text,
  "email" text unique,
  "emailVerified" timestamp(3),
  "image" text
);

create table if not exists "Account" (
  "id" text primary key,
  "userId" text not null references "User"("id") on delete cascade,
  "type" text not null,
  "provider" text not null,
  "providerAccountId" text not null,
  "refresh_token" text,
  "access_token" text,
  "expires_at" integer,
  "token_type" text,
  "scope" text,
  "id_token" text,
  "session_state" text,
  constraint "Account_provider_providerAccountId_key" unique ("provider", "providerAccountId")
);

create table if not exists "Session" (
  "id" text primary key,
  "sessionToken" text not null unique,
  "userId" text not null references "User"("id") on delete cascade,
  "expires" timestamp(3) not null
);

create table if not exists "VerificationToken" (
  "identifier" text not null,
  "token" text not null unique,
  "expires" timestamp(3) not null,
  constraint "VerificationToken_identifier_token_key" unique ("identifier", "token")
);

create table if not exists "desbravador" (
  "id" text primary key,
  "codigo_desbravador" text not null unique,
  "nome_desbravador" text not null,
  "unidade" text not null,
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp
);

create table if not exists "especialidades" (
  "id" text primary key,
  "codigo_especialidade" text not null unique,
  "nome_especialidade" text not null,
  "created_at" timestamp(3) not null default current_timestamp,
  "updated_at" timestamp(3) not null default current_timestamp
);

create table if not exists "especialidade_completa" (
  "id" text primary key,
  "codigo_desbravador" text not null references "desbravador"("codigo_desbravador") on delete restrict on update cascade,
  "codigo_especialidade" text not null references "especialidades"("codigo_especialidade") on delete restrict on update cascade,
  "email_responsavel" text not null,
  "created_at" timestamp(3) not null default current_timestamp,
  constraint "especialidade_completa_codigo_desbravador_codigo_especialidade_key" unique ("codigo_desbravador", "codigo_especialidade")
);

create index if not exists "especialidade_completa_codigo_desbravador_idx"
  on "especialidade_completa"("codigo_desbravador");

create index if not exists "especialidade_completa_codigo_especialidade_idx"
  on "especialidade_completa"("codigo_especialidade");
