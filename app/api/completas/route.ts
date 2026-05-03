import { prisma } from "@/lib/prisma";
import { jsonSuccess, requireUserEmail } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const completas = await prisma.completa.findMany({
    include: {
      desbravador: true,
      especialidade: true,
    },
    orderBy: { created_at: "desc" },
  });

  return jsonSuccess(completas);
}
