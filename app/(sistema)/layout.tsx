import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppNav } from "@/components/AppNav";

export const dynamic = "force-dynamic";

export default async function SistemaLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <>
      <AppNav />
      <main className="app-main">{children}</main>
    </>
  );
}
