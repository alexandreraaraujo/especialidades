import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { DesbravadoresClient } from "@/components/DesbravadoresClient";
import { isAdmin } from "@/lib/api";

export default async function DesbravadoresPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isAdmin(email))) {
    redirect("/dashboard");
  }

  return (
    <section className="stack">
      <div className="page-title">
        <h1>Desbravadores</h1>
        <p>Cadastre, edite e exclua desbravadores sem vínculos registrados.</p>
      </div>
      <DesbravadoresClient />
    </section>
  );
}
