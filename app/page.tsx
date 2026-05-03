import { redirect } from "next/navigation";

import { auth, signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="page">
      <section className="panel">
        <h1>Login com Google</h1>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button type="submit">Entrar com Google</button>
        </form>
      </section>
    </main>
  );
}
