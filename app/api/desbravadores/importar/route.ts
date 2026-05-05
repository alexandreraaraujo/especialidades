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

  const desbravadores = rows.map((row, index) => ({
    linha: index + 2,
    codigo_desbravador: normalizeCode(row.id),
    nome_desbravador: normalizeText(row.Nome),
    unidade: normalizeText(row.Unidade),
  }));

  const incompletos = desbravadores.filter(
    (item) => !item.codigo_desbravador || !item.nome_desbravador || !item.unidade,
  );

  if (incompletos.length > 0) {
    return jsonError(
      `Existem linhas sem id, Nome ou Unidade: ${incompletos
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
    where: { codigo_desbravador: { in: codigos } },
    select: { codigo_desbravador: true },
  });

  if (existentes.length > 0) {
    return jsonError(
      `Ja existem desbravadores com estes codigos: ${existentes
        .map((item) => item.codigo_desbravador)
        .join(", ")}.`,
      409,
    );
  }

  const resultado = await prisma.desbravador.createMany({
    data: desbravadores.map((item) => ({
      codigo_desbravador: item.codigo_desbravador,
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
