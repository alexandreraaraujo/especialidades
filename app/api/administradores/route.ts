import { prisma } from "@/lib/prisma";
import {
  isAdmin,
  jsonError,
  jsonSuccess,
  normalizeText,
  prismaError,
  requireUserEmail,
} from "@/lib/api";

export const runtime = "nodejs";

export async function GET() {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  if (!(await isAdmin(authResult.email))) {
    return jsonError("Apenas administradores podem listar administradores.", 403);
  }

  const administradores = await prisma.administrador.findMany({
    orderBy: { email: "asc" },
  });

  return jsonSuccess(administradores);
}

export async function POST(request: Request) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  if (!(await isAdmin(authResult.email))) {
    return jsonError("Apenas administradores podem cadastrar administradores.", 403);
  }

  const body = await request.json();
  const email = normalizeText(body.email).toLowerCase();

  if (!email || !email.includes("@")) {
    return jsonError("Informe um e-mail valido.");
  }

  try {
    const administrador = await prisma.administrador.create({
      data: { email },
    });

    return jsonSuccess(
      { message: "Administrador cadastrado com sucesso.", administrador },
      201,
    );
  } catch (error) {
    return prismaError(error, "Este administrador ja esta cadastrado.");
  }
}
