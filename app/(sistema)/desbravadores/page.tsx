import { DesbravadoresClient } from "@/components/DesbravadoresClient";

export default function DesbravadoresPage() {
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
