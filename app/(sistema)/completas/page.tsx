import { CompletasClient } from "@/components/CompletasClient";

export default function CompletasPage() {
  return (
    <section className="stack">
      <div className="page-title">
        <h1>Especialidades concluídas</h1>
        <p>Consulte e remova apenas o vínculo entre desbravador e especialidade.</p>
      </div>
      <CompletasClient />
    </section>
  );
}
