"use client";

import { useEffect, useMemo, useState } from "react";

type Completa = {
  id: string;
  codigo_desbravador: string;
  codigo_especialidade: string;
  email_responsavel: string;
  created_at: string;
  desbravador: {
    nome_desbravador: string;
    unidade: string;
  };
  especialidade: {
    nome_especialidade: string;
  };
};

export function CompletasClient() {
  const [items, setItems] = useState<Completa[]>([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    const response = await fetch("/api/completas");
    setItems(await response.json());
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(termo),
    );
  }, [busca, items]);

  async function excluir(item: Completa) {
    if (
      !confirm(
        `Excluir o vínculo entre ${item.desbravador.nome_desbravador} e ${item.especialidade.nome_especialidade}?`,
      )
    ) {
      return;
    }

    setMensagem("");
    setErro("");
    const response = await fetch(`/api/completas/${item.id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      setErro(data.error ?? "Nao foi possivel excluir.");
      return;
    }

    setMensagem(data.message);
    carregar();
  }

  return (
    <section className="box stack">
      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por desbravador, especialidade, unidade ou responsável"
      />
      <Feedback mensagem={mensagem} erro={erro} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Desbravador</th>
              <th>Código</th>
              <th>Unidade</th>
              <th>Especialidade</th>
              <th>Código</th>
              <th>Responsável</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((item) => (
              <tr key={item.id}>
                <td>{item.desbravador.nome_desbravador}</td>
                <td>{item.codigo_desbravador}</td>
                <td>{item.desbravador.unidade}</td>
                <td>{item.especialidade.nome_especialidade}</td>
                <td>{item.codigo_especialidade}</td>
                <td>{item.email_responsavel}</td>
                <td>{new Date(item.created_at).toLocaleString("pt-BR")}</td>
                <td>
                  <button type="button" className="danger small" onClick={() => excluir(item)}>
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Feedback({ mensagem, erro }: { mensagem: string; erro: string }) {
  if (!mensagem && !erro) return null;
  return <p className={erro ? "feedback error" : "feedback success"}>{erro || mensagem}</p>;
}
