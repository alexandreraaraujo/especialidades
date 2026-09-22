import { prisma } from "@/lib/prisma";
import { isAdmin, jsonError, jsonSuccess, normalizeText, requireUserEmail } from "@/lib/api";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authResult = await requireUserEmail();
  if ("error" in authResult) return authResult.error;

  if (!(await isAdmin(authResult.email))) {
    return jsonError("Apenas administradores podem fechar uma compra.", 403);
  }

  const body = await request.json();
  const nome = normalizeText(body.nome);
  const dataCompraTexto = normalizeText(body.data_compra);
  const data_compra = dataCompraTexto ? new Date(`${dataCompraTexto}T00:00:00`) : null;

  if (!nome) {
    return jsonError("Informe o nome do lote de compra.");
  }

  if (dataCompraTexto && Number.isNaN(data_compra?.getTime())) {
    return jsonError("Informe uma data de compra valida.");
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const pendentes = await tx.completa.count({
        where: { lote_compra_id: null },
      });

      if (pendentes === 0) {
        throw new Error("SEM_PENDENTES");
      }

      const lote = await tx.loteCompra.create({
        data: {
          nome,
          data_compra,
          criado_por: authResult.email,
        },
      });

      const atualizados = await tx.completa.updateMany({
        where: { lote_compra_id: null },
        data: { lote_compra_id: lote.id },
      });

      if (atualizados.count === 0) {
        throw new Error("SEM_PENDENTES");
      }

      return { lote, total: atualizados.count };
    });

    return jsonSuccess(
      {
        message: "Compra fechada com sucesso.",
        lote: resultado.lote,
        total: resultado.total,
      },
      201,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "SEM_PENDENTES") {
      return jsonError("Nao ha registros pendentes para fechar compra.", 409);
    }

    return jsonError("Nao foi possivel fechar a compra.", 500);
  }
}
