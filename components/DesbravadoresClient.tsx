"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Desbravador = {
  id: string;
  codigo_desbravador: string;
  nome_desbravador: string;
  unidade: string;
  email_responsavel?: string;
};

const vazio = {
  id: "",
  codigo_desbravador: "",
  nome_desbravador: "",
  unidade: "",
};

export function DesbravadoresClient() {
  const [items, setItems] = useState<Desbravador[]>([]);
  const [form, setForm] = useState<Desbravador>(vazio);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    const response = await fetch("/api/desbravadores");
    setItems(await response.json());
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return items.filter((item) =>
      `${item.codigo_desbravador} ${item.nome_desbravador} ${item.unidade}`
        .toLowerCase()
        .includes(termo),
    );
  }, [busca, items]);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    const editando = Boolean(form.id);
    const response = await fetch(
      editando ? `/api/desbravadores/${form.id}` : "/api/desbravadores",
      {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      setErro(data.error ?? "Nao foi possivel salvar.");
      return;
    }

    setMensagem(data.message);
    setForm(vazio);
    carregar();
  }

  async function excluir(item: Desbravador) {
    if (!confirm(`Excluir ${item.nome_desbravador}?`)) return;
    setMensagem("");
    setErro("");

    const response = await fetch(`/api/desbravadores/${item.id}`, {
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

  async function importar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/desbravadores/importar", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (!response.ok) {
      setErro(data.error ?? "Nao foi possivel importar o CSV.");
      return;
    }

    setMensagem(`${data.message} Total: ${data.total}.`);
    event.currentTarget.reset();
    carregar();
  }

  return (
    <section className="grid-two">
      <div className="stack">
        <form className="box stack" onSubmit={salvar}>
          <h2>{form.id ? "Editar desbravador" : "Novo desbravador"}</h2>
          <label>
            Código
            <input
              value={form.codigo_desbravador}
              onChange={(e) =>
                setForm({ ...form, codigo_desbravador: e.target.value })
              }
              placeholder="D001"
            />
          </label>
          <label>
            Nome
            <input
              value={form.nome_desbravador}
              onChange={(e) =>
                setForm({ ...form, nome_desbravador: e.target.value })
              }
              placeholder="Nome do desbravador"
            />
          </label>
          <label>
            Unidade
            <input
              value={form.unidade}
              onChange={(e) => setForm({ ...form, unidade: e.target.value })}
              placeholder="Unidade"
            />
          </label>
          <div className="actions">
            <button type="submit">Salvar</button>
            {form.id ? (
              <button type="button" className="secondary" onClick={() => setForm(vazio)}>
                Cancelar
              </button>
            ) : null}
          </div>
          <Feedback mensagem={mensagem} erro={erro} />
        </form>

        <form className="box stack" onSubmit={importar}>
          <h2>Importar CSV</h2>
          <p className="hint">Colunas esperadas: id, Nome, Unidade.</p>
          <label>
            Arquivo CSV
            <input name="arquivo" type="file" accept=".csv,text/csv" />
          </label>
          <button type="submit">Importar desbravadores</button>
        </form>
      </div>

      <div className="box stack">
        <h2>Desbravadores</h2>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, código ou unidade"
        />
        <div className="list">
          {filtrados.map((item) => (
            <article key={item.id} className="list-item">
              <div>
                <strong>{item.nome_desbravador}</strong>
                <span>
                  {item.codigo_desbravador} · {item.unidade}
                </span>
                {item.email_responsavel ? <span>Cadastro: {item.email_responsavel}</span> : null}
              </div>
              <div className="row-actions">
                <button type="button" className="secondary small" onClick={() => setForm(item)}>
                  Editar
                </button>
                <button type="button" className="danger small" onClick={() => excluir(item)}>
                  Excluir
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Feedback({ mensagem, erro }: { mensagem: string; erro: string }) {
  if (!mensagem && !erro) return null;
  return <p className={erro ? "feedback error" : "feedback success"}>{erro || mensagem}</p>;
}
