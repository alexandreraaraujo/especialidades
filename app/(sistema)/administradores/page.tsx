import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdministradoresClient } from "@/components/AdministradoresClient";
import { isAdmin } from "@/lib/api";

export default async function AdministradoresPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isAdmin(email))) {
    redirect("/dashboard");
  }

  return (
    <section className="stack">
      <div className="page-title">
        <h1>Administradores</h1>
        <p>Cadastre usuários que podem alterar e excluir qualquer registro do sistema.</p>
      </div>
      <AdministradoresClient />
    </section>
  );
}
