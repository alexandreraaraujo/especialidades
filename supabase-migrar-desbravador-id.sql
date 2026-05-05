-- Use este SQL apenas se a tabela desbravador ainda tiver a coluna
-- codigo_desbravador e voce quer transformar esse codigo no id.

alter table "especialidade_completa"
  drop constraint if exists "especialidade_completa_codigo_desbravador_fkey";

drop index if exists "desbravador_codigo_desbravador_key";

update "desbravador"
set "id" = "codigo_desbravador"
where "codigo_desbravador" is not null
  and "codigo_desbravador" <> ''
  and "id" <> "codigo_desbravador";

alter table "desbravador"
  drop column if exists "codigo_desbravador";

alter table "especialidade_completa"
  add constraint "especialidade_completa_codigo_desbravador_fkey"
  foreign key ("codigo_desbravador")
  references "desbravador"("id")
  on delete restrict
  on update cascade;
