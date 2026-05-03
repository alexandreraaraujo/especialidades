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
