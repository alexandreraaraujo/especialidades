import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, normalizeCode, requireUserEmail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const codigo_especialidade = normalizeCode(body.codigo_especialidade);
  const codigos_desbravadores: string[] = Array.isArray(body.codigos_desbravadores)
    ? Array.from(
        new Set(
          body.codigos_desbravadores
            .map((codigo: unknown) => normalizeCode(codigo))
            .filter((codigo: string) => Boolean(codigo)),
        ),
      )
    : [];

  if (!codigo_especialidade || codigos_desbravadores.length === 0) {
    return jsonError("Selecione uma especialidade e pelo menos um desbravador.");
  }

  const especialidade = await prisma.especialidade.findUnique({
    where: { codigo_especialidade },
  });

  if (!especialidade) return jsonError("Especialidade nao encontrada.", 404);

  const desbravadores = await prisma.desbravador.findMany({
    where: { codigo_desbravador: { in: codigos_desbravadores } },
  });

  if (desbravadores.length !== codigos_desbravadores.length) {
    return jsonError("Um ou mais desbravadores nao foram encontrados.", 404);
  }

  try {
    const resultado = await prisma.completa.createMany({
      data: codigos_desbravadores.map((codigo_desbravador) => ({
        codigo_desbravador,
        codigo_especialidade,
        email_responsavel: authResult.email,
      })),
    });

    return jsonSuccess({
      message: "Desbravadores registrados com sucesso.",
      total: resultado.count,
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError(
        "Um ou mais desbravadores ja tinham esta especialidade registrada.",
        409,
      );
    }

    return jsonError("Nao foi possivel registrar os desbravadores.", 500);
  }
}
