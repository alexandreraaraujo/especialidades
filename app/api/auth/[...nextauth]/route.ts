import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: "DATABASE_URL is missing",
        },
        { status: 500 },
      );
    }

    await prisma.$queryRaw`select 1`;
    await prisma.user.findFirst();

    return NextResponse.json({
      ok: true,
      databaseUrlConfigured: true,
      userTableAccessible: true,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          ok: false,
          name: error.name,
          message: error.message,
          cause: "cause" in error ? error.cause : undefined,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error,
      },
      { status: 500 },
    );
  }
}
