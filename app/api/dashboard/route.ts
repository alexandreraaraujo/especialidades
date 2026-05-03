import { prisma } from "@/lib/prisma";
import { jsonSuccess, requireUserEmail } from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const [desbravadores, especialidades, completas] = await Promise.all([
    prisma.desbravador.count(),
    prisma.especialidade.count(),
    prisma.completa.count(),
  ]);

  return jsonSuccess({ desbravadores, especialidades, completas });
}
