import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/protegido");
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Login com Google</h1>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/protegido" });
          }}
        >
          <button type="submit">Entrar com Google</button>
        </form>
      </section>
    </main>
  );
}
