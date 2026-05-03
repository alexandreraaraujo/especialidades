import Link from "next/link";

import { auth, signOut } from "@/auth";
import { isAdmin } from "@/lib/api";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/desbravadores", label: "Desbravadores" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/registrar/desbravador", label: "Registrar por desbravador" },
  { href: "/registrar/especialidade", label: "Registrar por especialidade" },
  { href: "/completas", label: "Concluidas" },
];

export async function AppNav() {
  const session = await auth();
  const admin = session?.user?.email ? await isAdmin(session.user.email) : false;
  const visibleLinks = admin
    ? [...links, { href: "/administradores", label: "Administradores" }]
    : links;

  return (
    <header className="app-header">
      <div>
        <strong>Especialidades</strong>
        <span>{session?.user?.email}</span>
      </div>
      <nav>
        {visibleLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit" className="secondary small">
          Sair
        </button>
      </form>
    </header>
  );
}
