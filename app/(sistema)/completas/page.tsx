import { CompletasClient } from "@/components/CompletasClient";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/api";

export default async function CompletasPage() {
  const session = await auth();
  const admin = session?.user?.email ? await isAdmin(session.user.email) : false;

  return (
    <section className="stack">
      <div className="page-title">
        <h1>Pendentes para compra</h1>
        <p>Registros ainda não associados a um lote de compra.</p>
      </div>
      <CompletasClient admin={admin} />
    </section>
  );
}
