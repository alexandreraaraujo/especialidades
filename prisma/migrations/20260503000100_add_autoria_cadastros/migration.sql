ALTER TABLE "desbravador"
  ADD COLUMN IF NOT EXISTS "email_responsavel" TEXT NOT NULL DEFAULT 'sistema';

ALTER TABLE "especialidades"
  ADD COLUMN IF NOT EXISTS "email_responsavel" TEXT NOT NULL DEFAULT 'sistema';
