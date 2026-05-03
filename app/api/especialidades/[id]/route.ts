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
  const especialidade = await prisma.especialidade.findUnique({ where: { id } });

  if (!especialidade) return jsonError("Especialidade nao encontrada.", 404);

  return jsonSuccess(especialidade);
}

export async function PUT(request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const existente = await prisma.especialidade.findUnique({ where: { id } });

  if (!existente) return jsonError("Especialidade nao encontrada.", 404);

  if (!(await canManage(existente.email_responsavel, authResult.email))) {
    return forbiddenOwnerMessage();
  }

  const body = await request.json();
  const codigo_especialidade = normalizeCode(body.codigo_especialidade);
  const nome_especialidade = normalizeText(body.nome_especialidade);

  if (!codigo_especialidade || !nome_especialidade) {
    return jsonError("Informe codigo e nome da especialidade.");
  }

  try {
    const especialidade = await prisma.especialidade.update({
      where: { id },
      data: { codigo_especialidade, nome_especialidade },
    });

    return jsonSuccess({
      message: "Especialidade atualizada com sucesso.",
      especialidade,
    });
  } catch (error) {
    return prismaError(error, "Ja existe uma especialidade com este codigo.");
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const especialidade = await prisma.especialidade.findUnique({ where: { id } });

  if (!especialidade) return jsonError("Especialidade nao encontrada.", 404);

  if (!(await canManage(especialidade.email_responsavel, authResult.email))) {
    return forbiddenOwnerMessage();
  }

  const total = await prisma.completa.count({
    where: { codigo_especialidade: especialidade.codigo_especialidade },
  });

  if (total > 0) {
    return jsonError(
      "Nao e possivel excluir esta especialidade porque ela possui registros concluidos.",
      409,
    );
  }

  await prisma.especialidade.delete({ where: { id } });

  return jsonSuccess({ message: "Especialidade excluida com sucesso." });
}
