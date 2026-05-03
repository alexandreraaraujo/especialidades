import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  debug: process.env.NODE_ENV === "production",
  providers: [Google],
  logger: {
    error(error) {
      console.error("[auth][error]", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: "cause" in error ? error.cause : undefined,
      });
    },
    warn(code) {
      console.warn("[auth][warn]", code);
    },
    debug(code, metadata) {
      console.log("[auth][debug]", code, metadata);
    },
  },
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "database",
  },
});
