import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function requireUserEmail() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return {
      error: NextResponse.json(
        { error: "Usuario nao autenticado." },
        { status: 401 },
      ),
    };
  }

  return { email };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function prismaError(error: unknown, duplicateMessage: string) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return jsonError(duplicateMessage, 409);
  }

  return jsonError("Nao foi possivel concluir a operacao.", 500);
}

export function normalizeCode(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

export function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export function isEnvAdmin(email: string) {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((admin) => admin.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(email.toLowerCase());
}

export async function isAdmin(email: string) {
  if (isEnvAdmin(email)) return true;

  const admin = await prisma.administrador.findUnique({
    where: { email: email.toLowerCase() },
  });

  return Boolean(admin);
}

export async function canManage(ownerEmail: string, userEmail: string) {
  return ownerEmail.toLowerCase() === userEmail.toLowerCase() || isAdmin(userEmail);
}

export function forbiddenOwnerMessage() {
  return jsonError(
    "Apenas quem cadastrou este registro ou um administrador pode alterar ou excluir.",
    403,
  );
}
