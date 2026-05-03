import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, requireUserEmail } from "@/lib/api";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const completa = await prisma.completa.findUnique({ where: { id } });

  if (!completa) return jsonError("Registro nao encontrado.", 404);

  await prisma.completa.delete({ where: { id } });

  return jsonSuccess({ message: "Vinculo excluido com sucesso." });
}
