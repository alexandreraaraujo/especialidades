import { prisma } from "@/lib/prisma";
import { jsonSuccess, requireUserEmail } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const url = new URL(request.url);
  const todos = url.searchParams.get("todos") === "1";

  const completas = await prisma.completa.findMany({
    where: todos ? undefined : { lote_compra_id: null },
    include: {
      desbravador: true,
      especialidade: true,
      lote_compra: true,
    },
    orderBy: { created_at: "desc" },
  });

  return jsonSuccess(completas);
}
