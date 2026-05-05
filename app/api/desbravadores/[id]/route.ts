import { prisma } from "@/lib/prisma";
import {
  isAdmin,
  jsonError,
  jsonSuccess,
  normalizeCode,
  normalizeText,
  prismaError,
  requireUserEmail,
} from "@/lib/api";

export const runtime = "nodejs";

function desbravadorDto(desbravador: {
  id: string;
  nome_desbravador: string;
  unidade: string;
  email_responsavel: string;
  created_at: Date;
  updated_at: Date;
}) {
  return {
    ...desbravador,
    codigo_desbravador: desbravador.id,
  };
}

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const desbravador = await prisma.desbravador.findUnique({ where: { id } });

  if (!desbravador) return jsonError("Desbravador nao encontrado.", 404);

  return jsonSuccess(desbravadorDto(desbravador));
}

export async function PUT(request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const existente = await prisma.desbravador.findUnique({ where: { id } });

  if (!existente) return jsonError("Desbravador nao encontrado.", 404);

  if (!(await isAdmin(authResult.email))) {
    return jsonError("Apenas administradores podem alterar desbravadores.", 403);
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
      data: { id: codigo_desbravador, nome_desbravador, unidade },
    });

    return jsonSuccess({
      message: "Desbravador atualizado com sucesso.",
      desbravador: desbravadorDto(desbravador),
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

  if (!(await isAdmin(authResult.email))) {
    return jsonError("Apenas administradores podem excluir desbravadores.", 403);
  }

  const total = await prisma.completa.count({
    where: { codigo_desbravador: desbravador.id },
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
