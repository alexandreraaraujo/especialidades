import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.desbravador.createMany({
    data: [
      { codigo_desbravador: "D001", nome_desbravador: "Ana Silva", unidade: "Aguias" },
      { codigo_desbravador: "D002", nome_desbravador: "Bruno Souza", unidade: "Leoes" },
      { codigo_desbravador: "D003", nome_desbravador: "Carla Santos", unidade: "Falcao" },
    ],
    skipDuplicates: true,
  });

  await prisma.especialidade.createMany({
    data: [
      { codigo_especialidade: "E001", nome_especialidade: "Primeiros Socorros" },
      { codigo_especialidade: "E002", nome_especialidade: "Nos e Amarras" },
      { codigo_especialidade: "E003", nome_especialidade: "Acampamento" },
    ],
    skipDuplicates: true,
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
