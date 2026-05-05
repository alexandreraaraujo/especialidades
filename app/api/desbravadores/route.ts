import { prisma } from "@/lib/prisma";
import {
  jsonError,
  jsonSuccess,
  normalizeCode,
  normalizeText,
  prismaError,
  requireUserEmail,
  isAdmin,
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

export async function GET() {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  const desbravadores = await prisma.desbravador.findMany({
    orderBy: [{ nome_desbravador: "asc" }],
  });

  return jsonSuccess(desbravadores.map(desbravadorDto));
}

export async function POST(request: Request) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  if (!(await isAdmin(authResult.email))) {
    return jsonError("Apenas administradores podem cadastrar desbravadores.", 403);
  }

  const body = await request.json();
  const codigo_desbravador = normalizeCode(body.codigo_desbravador);
  const nome_desbravador = normalizeText(body.nome_desbravador);
  const unidade = normalizeText(body.unidade);

  if (!codigo_desbravador || !nome_desbravador || !unidade) {
    return jsonError("Informe codigo, nome e unidade do desbravador.");
  }

  try {
    const desbravador = await prisma.desbravador.create({
      data: {
        id: codigo_desbravador,
        nome_desbravador,
        unidade,
        email_responsavel: authResult.email,
      },
    });

    return jsonSuccess(
      {
        message: "Desbravador cadastrado com sucesso.",
        desbravador: desbravadorDto(desbravador),
      },
      201,
    );
  } catch (error) {
    return prismaError(error, "Ja existe um desbravador com este codigo.");
  }
}
