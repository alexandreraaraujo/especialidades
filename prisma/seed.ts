import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.desbravador.createMany({
    data: [
      { codigo_desbravador: "D001", nome_desbravador: "Ana Silva", unidade: "Aguias", email_responsavel: "sistema" },
      { codigo_desbravador: "D002", nome_desbravador: "Bruno Souza", unidade: "Leoes", email_responsavel: "sistema" },
      { codigo_desbravador: "D003", nome_desbravador: "Carla Santos", unidade: "Falcao", email_responsavel: "sistema" },
    ],
    skipDuplicates: true,
  });

  await prisma.especialidade.createMany({
    data: [
      { codigo_especialidade: "E001", nome_especialidade: "Primeiros Socorros", email_responsavel: "sistema" },
      { codigo_especialidade: "E002", nome_especialidade: "Nos e Amarras", email_responsavel: "sistema" },
      { codigo_especialidade: "E003", nome_especialidade: "Acampamento", email_responsavel: "sistema" },
    ],
    skipDuplicates: true,
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
