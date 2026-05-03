import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";

export default async function ProtegidoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Logado</h1>
        <div className="user-info">
          {session.user.name ? <p>Nome: {session.user.name}</p> : null}
          {session.user.email ? <p>E-mail: {session.user.email}</p> : null}
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button type="submit" className="secondary">
            Sair
          </button>
        </form>
      </section>
    </main>
  );
}
