import { prisma } from "@/lib/prisma";
import { isAdmin, jsonError, jsonSuccess, requireUserEmail } from "@/lib/api";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  if (!(await isAdmin(authResult.email))) {
    return jsonError("Apenas administradores podem excluir administradores.", 403);
  }

  const { id } = await params;
  const administrador = await prisma.administrador.findUnique({ where: { id } });

  if (!administrador) return jsonError("Administrador nao encontrado.", 404);

  await prisma.administrador.delete({ where: { id } });

  return jsonSuccess({ message: "Administrador excluido com sucesso." });
}
