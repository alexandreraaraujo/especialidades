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

type Props = {
  admin: boolean;
};

export function CompletasClient({ admin }: Props) {
  const [items, setItems] = useState<Completa[]>([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [nomeLote, setNomeLote] = useState("");
  const [dataCompra, setDataCompra] = useState("");

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

  const resumo = useMemo(() => {
    const totais = new Map<string, { codigo: string; nome: string; quantidade: number }>();

    items.forEach((item) => {
      const atual = totais.get(item.codigo_especialidade) ?? {
        codigo: item.codigo_especialidade,
        nome: item.especialidade.nome_especialidade,
        quantidade: 0,
      };

      atual.quantidade += 1;
      totais.set(item.codigo_especialidade, atual);
    });

    return Array.from(totais.values()).sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR"),
    );
  }, [items]);

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

  async function fecharCompra() {
    setMensagem("");
    setErro("");

    if (items.length === 0) {
      setErro("Nao ha registros pendentes para fechar compra.");
      return;
    }

    if (!nomeLote.trim()) {
      setErro("Informe o nome do lote.");
      return;
    }

    if (
      !confirm(
        `Fechar a compra "${nomeLote}" com ${items.length} registro(s) pendente(s)?`,
      )
    ) {
      return;
    }

    const response = await fetch("/api/lotes-compra/fechar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nomeLote,
        data_compra: dataCompra,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setErro(data.error ?? "Nao foi possivel fechar a compra.");
      return;
    }

    setMensagem(`${data.message} Total: ${data.total}.`);
    setNomeLote("");
    setDataCompra("");
    carregar();
  }

  return (
    <section className="stack">
      <div className="stats-grid">
        <article className="stat-card">
          <span>Pendentes para compra</span>
          <strong>{items.length}</strong>
        </article>
        <article className="stat-card">
          <span>Especialidades no resumo</span>
          <strong>{resumo.length}</strong>
        </article>
      </div>

      {admin ? (
        <div className="box stack">
          <div className="selection-header">
            <h2>Fechar compra atual</h2>
            <span>{items.length} registro(s) serão incluídos</span>
          </div>
          <div className="grid-two compact-grid">
            <label>
              Nome do lote
              <input
                value={nomeLote}
                onChange={(event) => setNomeLote(event.target.value)}
                placeholder="Compra Julho/2026"
              />
            </label>
            <label>
              Data da compra
              <input
                type="date"
                value={dataCompra}
                onChange={(event) => setDataCompra(event.target.value)}
              />
            </label>
          </div>
          <button type="button" onClick={fecharCompra}>
            Fechar compra atual
          </button>
        </div>
      ) : null}

      <section className="box stack">
        <div className="selection-header">
          <h2>Resumo para compra</h2>
          <span>{resumo.length} especialidade(s)</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Especialidade</th>
                <th>Código</th>
                <th>Quantidade</th>
              </tr>
            </thead>
            <tbody>
              {resumo.map((item) => (
                <tr key={item.codigo}>
                  <td>{item.nome}</td>
                  <td>{item.codigo}</td>
                  <td>{item.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
    </section>
  );
}

function Feedback({ mensagem, erro }: { mensagem: string; erro: string }) {
  if (!mensagem && !erro) return null;
  return <p className={erro ? "feedback error" : "feedback success"}>{erro || mensagem}</p>;
}
