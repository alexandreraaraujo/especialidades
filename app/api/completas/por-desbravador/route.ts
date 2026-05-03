import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, normalizeCode, requireUserEmail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const codigo_desbravador = normalizeCode(body.codigo_desbravador);
  const codigos_especialidades = Array.isArray(body.codigos_especialidades)
    ? [...new Set(body.codigos_especialidades.map(normalizeCode).filter(Boolean))]
    : [];

  if (!codigo_desbravador || codigos_especialidades.length === 0) {
    return jsonError("Selecione um desbravador e pelo menos uma especialidade.");
  }

  const desbravador = await prisma.desbravador.findUnique({
    where: { codigo_desbravador },
  });

  if (!desbravador) return jsonError("Desbravador nao encontrado.", 404);

  const especialidades = await prisma.especialidade.findMany({
    where: { codigo_especialidade: { in: codigos_especialidades } },
  });

  if (especialidades.length !== codigos_especialidades.length) {
    return jsonError("Uma ou mais especialidades nao foram encontradas.", 404);
  }

  try {
    const resultado = await prisma.completa.createMany({
      data: codigos_especialidades.map((codigo_especialidade) => ({
        codigo_desbravador,
        codigo_especialidade,
        email_responsavel: authResult.email,
      })),
    });

    return jsonSuccess({
      message: "Especialidades registradas com sucesso.",
      total: resultado.count,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(
        "Uma ou mais especialidades ja estavam registradas para este desbravador.",
        409,
      );
    }

    return jsonError("Nao foi possivel registrar as especialidades.", 500);
  }
}
