import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RelatoriosClient } from "@/components/RelatoriosClient";
import { isAdmin } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export default async function RelatoriosPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isAdmin(email))) {
    redirect("/dashboard");
  }

  const [desbravadores, especialidades, completas] = await Promise.all([
    prisma.desbravador.findMany({
      orderBy: [{ unidade: "asc" }, { nome_desbravador: "asc" }],
    }),
    prisma.especialidade.findMany({
      orderBy: [{ nome_especialidade: "asc" }],
    }),
    prisma.completa.findMany({
      include: {
        desbravador: true,
        especialidade: true,
        lote_compra: true,
      },
      orderBy: [{ codigo_especialidade: "asc" }, { codigo_desbravador: "asc" }],
    }),
  ]);

  return (
    <section className="stack">
      <div className="page-title">
        <h1>Relatorios</h1>
        <p>Consultas administrativas para compra, especialidades e desbravadores.</p>
      </div>
      <RelatoriosClient
        desbravadores={desbravadores.map((item) => ({
          id: item.id,
          codigo_desbravador: item.id,
          nome_desbravador: item.nome_desbravador,
          unidade: item.unidade,
        }))}
        especialidades={especialidades.map((item) => ({
          codigo_especialidade: item.codigo_especialidade,
          nome_especialidade: item.nome_especialidade,
        }))}
        completas={completas.map((item) => ({
          id: item.id,
          codigo_desbravador: item.codigo_desbravador,
          codigo_especialidade: item.codigo_especialidade,
          email_responsavel: item.email_responsavel,
          created_at: item.created_at.toISOString(),
          desbravador: {
            nome_desbravador: item.desbravador.nome_desbravador,
            unidade: item.desbravador.unidade,
          },
          especialidade: {
            nome_especialidade: item.especialidade.nome_especialidade,
          },
          lote_compra: item.lote_compra
            ? {
                nome: item.lote_compra.nome,
              }
            : null,
        }))}
      />
    </section>
  );
}
