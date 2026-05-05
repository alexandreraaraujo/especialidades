import { prisma } from "@/lib/prisma";
import { isAdmin, jsonError, jsonSuccess, normalizeCode, normalizeText, requireUserEmail } from "@/lib/api";
import { parseCsv } from "@/lib/csv";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  if (!(await isAdmin(authResult.email))) {
    return jsonError("Apenas administradores podem importar desbravadores.", 403);
  }

  const formData = await request.formData();
  const file = formData.get("arquivo");

  if (!(file instanceof File)) {
    return jsonError("Envie um arquivo CSV no campo arquivo.");
  }

  const rows = parseCsv(await file.text());

  if (rows.length === 0) {
    return jsonError("O CSV esta vazio ou nao possui linhas de dados.");
  }

  const desbravadores = rows.map((row, index) => {
    const codigo = normalizeCode(row.id ?? row.codigo_desbravador);
    return {
      linha: index + 2,
      id: codigo,
      codigo_desbravador: codigo,
      nome_desbravador: normalizeText(row.Nome ?? row.nome_desbravador),
      unidade: normalizeText(row.Unidade ?? row.unidade),
    };
  });

  const incompletos = desbravadores.filter(
    (item) => !item.codigo_desbravador || !item.nome_desbravador || !item.unidade,
  );

  if (incompletos.length > 0) {
    return jsonError(
      `Existem linhas sem id, nome_desbravador ou unidade: ${incompletos
        .map((item) => item.linha)
        .join(", ")}.`,
    );
  }

  const codigos = desbravadores.map((item) => item.codigo_desbravador);
  const repetidosNoArquivo = codigos.filter(
    (codigo, index) => codigos.indexOf(codigo) !== index,
  );

  if (repetidosNoArquivo.length > 0) {
    return jsonError(
      `O CSV possui codigo_desbravador repetido: ${[
        ...new Set(repetidosNoArquivo),
      ].join(", ")}.`,
      409,
    );
  }

  const existentes = await prisma.desbravador.findMany({
    where: { id: { in: codigos } },
    select: { id: true },
  });

  if (existentes.length > 0) {
    return jsonError(
      `Ja existem desbravadores com estes codigos: ${existentes
        .map((item) => item.id)
        .join(", ")}.`,
      409,
    );
  }

  const resultado = await prisma.desbravador.createMany({
    data: desbravadores.map((item) => ({
      id: item.id,
      nome_desbravador: item.nome_desbravador,
      unidade: item.unidade,
      email_responsavel: authResult.email,
    })),
  });

  return jsonSuccess({
    message: "Desbravadores importados com sucesso.",
    total: resultado.count,
  });
}
