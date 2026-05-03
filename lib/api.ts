import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { auth } from "@/auth";

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
