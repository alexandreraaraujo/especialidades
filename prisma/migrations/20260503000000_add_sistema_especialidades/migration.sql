CREATE TABLE IF NOT EXISTS "desbravador" (
  "id" TEXT NOT NULL,
  "codigo_desbravador" TEXT NOT NULL,
  "nome_desbravador" TEXT NOT NULL,
  "unidade" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "desbravador_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "especialidades" (
  "id" TEXT NOT NULL,
  "codigo_especialidade" TEXT NOT NULL,
  "nome_especialidade" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "especialidades_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "especialidade_completa" (
  "id" TEXT NOT NULL,
  "codigo_desbravador" TEXT NOT NULL,
  "codigo_especialidade" TEXT NOT NULL,
  "email_responsavel" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "especialidade_completa_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "desbravador_codigo_desbravador_key"
  ON "desbravador"("codigo_desbravador");

CREATE UNIQUE INDEX IF NOT EXISTS "especialidades_codigo_especialidade_key"
  ON "especialidades"("codigo_especialidade");

CREATE UNIQUE INDEX IF NOT EXISTS "especialidade_completa_codigo_desbravador_codigo_especialidade_key"
  ON "especialidade_completa"("codigo_desbravador", "codigo_especialidade");

CREATE INDEX IF NOT EXISTS "especialidade_completa_codigo_desbravador_idx"
  ON "especialidade_completa"("codigo_desbravador");

CREATE INDEX IF NOT EXISTS "especialidade_completa_codigo_especialidade_idx"
  ON "especialidade_completa"("codigo_especialidade");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'especialidade_completa_codigo_desbravador_fkey'
  ) THEN
    ALTER TABLE "especialidade_completa"
      ADD CONSTRAINT "especialidade_completa_codigo_desbravador_fkey"
      FOREIGN KEY ("codigo_desbravador")
      REFERENCES "desbravador"("codigo_desbravador")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'especialidade_completa_codigo_especialidade_fkey'
  ) THEN
    ALTER TABLE "especialidade_completa"
      ADD CONSTRAINT "especialidade_completa_codigo_especialidade_fkey"
      FOREIGN KEY ("codigo_especialidade")
      REFERENCES "especialidades"("codigo_especialidade")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;
