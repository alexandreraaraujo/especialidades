import { RegistrarClient } from "@/components/RegistrarClient";

export default function RegistrarPorEspecialidadePage() {
  return (
    <section className="stack">
      <div className="page-title">
        <h1>Registrar por especialidade</h1>
        <p>Selecione uma especialidade e marque todos os desbravadores que concluíram.</p>
      </div>
      <RegistrarClient modo="especialidade" />
    </section>
  );
}
