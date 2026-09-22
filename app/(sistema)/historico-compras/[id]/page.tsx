import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export default async function LoteCompraDetalhePage({ params }: Params) {
  const { id } = await params;
  const lote = await prisma.loteCompra.findUnique({
    where: { id },
    include: {
      registros: {
        include: {
          desbravador: true,
          especialidade: true,
        },
        orderBy: [
          { codigo_especialidade: "asc" },
          { codigo_desbravador: "asc" },
        ],
      },
    },
  });

  if (!lote) notFound();

  const resumo = new Map<string, { codigo: string; nome: string; quantidade: number }>();

  lote.registros.forEach((registro) => {
    const atual = resumo.get(registro.codigo_especialidade) ?? {
      codigo: registro.codigo_especialidade,
      nome: registro.especialidade.nome_especialidade,
      quantidade: 0,
    };

    atual.quantidade += 1;
    resumo.set(registro.codigo_especialidade, atual);
  });

  const resumoOrdenado = Array.from(resumo.values()).sort((a, b) =>
    a.nome.localeCompare(b.nome, "pt-BR"),
  );

  return (
    <section className="stack">
      <div className="page-title">
        <h1>{lote.nome}</h1>
        <p>
          Criado por {lote.criado_por} em {lote.criado_em.toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <span>Data da compra</span>
          <strong>
            {lote.data_compra ? lote.data_compra.toLocaleDateString("pt-BR") : "-"}
          </strong>
        </article>
        <article className="stat-card">
          <span>Total de registros</span>
          <strong>{lote.registros.length}</strong>
        </article>
      </div>

      <div className="actions">
        <Link className="button-link" href="/historico-compras">
          Voltar
        </Link>
        <Link className="button-link secondary" href={`/api/lotes-compra/${lote.id}/csv`}>
          Exportar CSV
        </Link>
      </div>

      <section className="box stack">
        <div className="selection-header">
          <h2>Resumo por especialidade</h2>
          <span>{resumoOrdenado.length} especialidade(s)</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Especialidade</th>
                <th>Código</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {resumoOrdenado.map((item) => (
                <tr key={item.codigo}>
                  <td>{item.nome}</td>
                  <td>{item.codigo}</td>
                  <td>{item.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="box stack">
        <div className="selection-header">
          <h2>Registros individuais</h2>
          <span>{lote.registros.length} registro(s)</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Desbravador</th>
                <th>Unidade</th>
                <th>Especialidade</th>
                <th>Código</th>
                <th>Registrado por</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {lote.registros.map((registro) => (
                <tr key={registro.id}>
                  <td>{registro.desbravador.nome_desbravador}</td>
                  <td>{registro.desbravador.unidade}</td>
                  <td>{registro.especialidade.nome_especialidade}</td>
                  <td>{registro.codigo_especialidade}</td>
                  <td>{registro.email_responsavel}</td>
                  <td>{registro.created_at.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
