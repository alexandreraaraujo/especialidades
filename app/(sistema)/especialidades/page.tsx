import { EspecialidadesClient } from "@/components/EspecialidadesClient";

export default function EspecialidadesPage() {
  return (
    <section className="stack">
      <div className="page-title">
        <h1>Especialidades</h1>
        <p>Gerencie o catálogo de especialidades disponíveis.</p>
      </div>
      <EspecialidadesClient />
    </section>
  );
}
