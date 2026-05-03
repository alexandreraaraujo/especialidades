import { prisma } from "@/lib/prisma";
import {
  jsonError,
  jsonSuccess,
  normalizeCode,
  normalizeText,
  prismaError,
  requireUserEmail,
} from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const especialidades = await prisma.especialidade.findMany({
    orderBy: [{ nome_especialidade: "asc" }],
  });

  return jsonSuccess(especialidades);
}

export async function POST(request: Request) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const body = await request.json();
  const codigo_especialidade = normalizeCode(body.codigo_especialidade);
  const nome_especialidade = normalizeText(body.nome_especialidade);

  if (!codigo_especialidade || !nome_especialidade) {
    return jsonError("Informe codigo e nome da especialidade.");
  }

  try {
    const especialidade = await prisma.especialidade.create({
      data: {
        codigo_especialidade,
        nome_especialidade,
        email_responsavel: authResult.email,
      },
    });

    return jsonSuccess(
      { message: "Especialidade cadastrada com sucesso.", especialidade },
      201,
    );
  } catch (error) {
    return prismaError(error, "Ja existe uma especialidade com este codigo.");
  }
}
