CREATE TABLE IF NOT EXISTS "lotes_compra" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "data_compra" TIMESTAMP(3),
  "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "criado_por" TEXT NOT NULL,
  CONSTRAINT "lotes_compra_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "especialidade_completa"
  ADD COLUMN IF NOT EXISTS "lote_compra_id" TEXT;

CREATE INDEX IF NOT EXISTS "especialidade_completa_lote_compra_id_idx"
  ON "especialidade_completa"("lote_compra_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'especialidade_completa_lote_compra_id_fkey'
  ) THEN
    ALTER TABLE "especialidade_completa"
      ADD CONSTRAINT "especialidade_completa_lote_compra_id_fkey"
      FOREIGN KEY ("lote_compra_id")
      REFERENCES "lotes_compra"("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE;
  END IF;
END $$;

WITH lote_historico AS (
  INSERT INTO "lotes_compra" ("id", "nome", "data_compra", "criado_em", "criado_por")
  SELECT
    'compra-junho-2026',
    'Compra Junho/2026',
    TIMESTAMP '2026-06-01 00:00:00',
    CURRENT_TIMESTAMP,
    'sistema'
  WHERE NOT EXISTS (
    SELECT 1 FROM "lotes_compra" WHERE "id" = 'compra-junho-2026'
  )
  RETURNING "id"
)
UPDATE "especialidade_completa"
SET "lote_compra_id" = 'compra-junho-2026'
WHERE "lote_compra_id" IS NULL;
