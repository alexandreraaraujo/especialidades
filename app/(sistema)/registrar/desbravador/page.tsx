import { RegistrarClient } from "@/components/RegistrarClient";

export default function RegistrarPorDesbravadorPage() {
  return (
    <section className="stack">
      <div className="page-title">
        <h1>Registrar por desbravador</h1>
        <p>Selecione um desbravador e marque todas as especialidades concluídas.</p>
      </div>
      <RegistrarClient modo="desbravador" />
    </section>
  );
}
