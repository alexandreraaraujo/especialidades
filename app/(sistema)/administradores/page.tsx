import { AdministradoresClient } from "@/components/AdministradoresClient";

export default function AdministradoresPage() {
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
