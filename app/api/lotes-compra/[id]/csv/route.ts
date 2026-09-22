import { NextResponse } from "next/server";

import { requireUserEmail } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

function csvValue(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(_request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

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

  if (!lote) {
    return NextResponse.json({ error: "Lote nao encontrado." }, { status: 404 });
  }

  const linhas = [
    [
      "desbravador",
      "codigo_desbravador",
      "unidade",
      "especialidade",
      "codigo_especialidade",
      "registrado_por",
      "data_registro",
      "lote",
      "data_compra",
    ],
    ...lote.registros.map((registro) => [
      registro.desbravador.nome_desbravador,
      registro.codigo_desbravador,
      registro.desbravador.unidade,
      registro.especialidade.nome_especialidade,
      registro.codigo_especialidade,
      registro.email_responsavel,
      registro.created_at.toISOString(),
      lote.nome,
      lote.data_compra?.toISOString() ?? "",
    ]),
  ];

  const csv = linhas.map((linha) => linha.map(csvValue).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${lote.id}.csv"`,
    },
  });
}
