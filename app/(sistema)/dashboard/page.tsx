import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const [desbravadores, especialidades, completas] = await Promise.all([
    prisma.desbravador.count(),
    prisma.especialidade.count(),
    prisma.completa.count(),
  ]);

  return (
    <section className="stack">
      <div className="page-title">
        <h1>Dashboard</h1>
        <p>Resumo geral dos cadastros e registros concluídos.</p>
      </div>
      <div className="stats-grid">
        <article className="stat-card">
          <span>Desbravadores</span>
          <strong>{desbravadores}</strong>
        </article>
        <article className="stat-card">
          <span>Especialidades</span>
          <strong>{especialidades}</strong>
        </article>
        <article className="stat-card">
          <span>Concluídas</span>
          <strong>{completas}</strong>
        </article>
      </div>
    </section>
  );
}
