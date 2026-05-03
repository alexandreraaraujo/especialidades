import Link from "next/link";

import { auth, signOut } from "@/auth";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/desbravadores", label: "Desbravadores" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/registrar/desbravador", label: "Registrar por desbravador" },
  { href: "/registrar/especialidade", label: "Registrar por especialidade" },
  { href: "/completas", label: "Concluidas" },
  { href: "/administradores", label: "Administradores" },
];

export async function AppNav() {
  const session = await auth();

  return (
    <header className="app-header">
      <div>
        <strong>Especialidades</strong>
        <span>{session?.user?.email}</span>
      </div>
      <nav>
        {links.map((link) => (
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
