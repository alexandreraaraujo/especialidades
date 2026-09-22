import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function HistoricoComprasPage() {
  const lotes = await prisma.loteCompra.findMany({
    include: {
      _count: {
        select: { registros: true },
      },
    },
    orderBy: [{ criado_em: "desc" }],
  });

  return (
    <section className="stack">
      <div className="page-title">
        <h1>Histórico de compras</h1>
        <p>Lotes de compra fechados e registros históricos associados.</p>
      </div>
      <div className="box table-wrap">
        <table>
          <thead>
            <tr>
              <th>Compra</th>
              <th>Data</th>
              <th>Quantidade</th>
            </tr>
          </thead>
          <tbody>
            {lotes.map((lote) => (
              <tr key={lote.id}>
                <td>
                  <Link href={`/historico-compras/${lote.id}`}>{lote.nome}</Link>
                </td>
                <td>
                  {lote.data_compra
                    ? lote.data_compra.toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td>{lote._count.registros}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
