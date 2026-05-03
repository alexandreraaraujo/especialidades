import { prisma } from "@/lib/prisma";
import {
  canManage,
  forbiddenOwnerMessage,
  jsonError,
  jsonSuccess,
  normalizeCode,
  normalizeText,
  prismaError,
  requireUserEmail,
} from "@/lib/api";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const desbravador = await prisma.desbravador.findUnique({ where: { id } });

  if (!desbravador) return jsonError("Desbravador nao encontrado.", 404);

  return jsonSuccess(desbravador);
}

export async function PUT(request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const existente = await prisma.desbravador.findUnique({ where: { id } });

  if (!existente) return jsonError("Desbravador nao encontrado.", 404);

  if (!(await canManage(existente.email_responsavel, authResult.email))) {
    return forbiddenOwnerMessage();
  }

  const body = await request.json();
  const codigo_desbravador = normalizeCode(body.codigo_desbravador);
  const nome_desbravador = normalizeText(body.nome_desbravador);
  const unidade = normalizeText(body.unidade);

  if (!codigo_desbravador || !nome_desbravador || !unidade) {
    return jsonError("Informe codigo, nome e unidade do desbravador.");
  }

  try {
    const desbravador = await prisma.desbravador.update({
      where: { id },
      data: { codigo_desbravador, nome_desbravador, unidade },
    });

    return jsonSuccess({
      message: "Desbravador atualizado com sucesso.",
      desbravador,
    });
  } catch (error) {
    return prismaError(error, "Ja existe um desbravador com este codigo.");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const desbravador = await prisma.desbravador.findUnique({ where: { id } });

  if (!desbravador) return jsonError("Desbravador nao encontrado.", 404);

  if (!(await canManage(desbravador.email_responsavel, authResult.email))) {
    return forbiddenOwnerMessage();
  }

  const total = await prisma.completa.count({
    where: { codigo_desbravador: desbravador.codigo_desbravador },
  });

  if (total > 0) {
    return jsonError(
      "Nao e possivel excluir este desbravador porque ele possui especialidades concluidas.",
      409,
    );
  }

  await prisma.desbravador.delete({ where: { id } });

  return jsonSuccess({ message: "Desbravador excluido com sucesso." });
}
