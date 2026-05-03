"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Especialidade = {
  id: string;
  codigo_especialidade: string;
  nome_especialidade: string;
  email_responsavel?: string;
};

const vazio = {
  id: "",
  codigo_especialidade: "",
  nome_especialidade: "",
};

export function EspecialidadesClient() {
  const [items, setItems] = useState<Especialidade[]>([]);
  const [form, setForm] = useState<Especialidade>(vazio);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    const response = await fetch("/api/especialidades");
    setItems(await response.json());
  }

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase();
    return items.filter((item) =>
      `${item.codigo_especialidade} ${item.nome_especialidade}`
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
      editando ? `/api/especialidades/${form.id}` : "/api/especialidades",
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

  async function excluir(item: Especialidade) {
    if (!confirm(`Excluir ${item.nome_especialidade}?`)) return;
    setMensagem("");
    setErro("");

    const response = await fetch(`/api/especialidades/${item.id}`, {
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
    <section className="grid-two">
      <form className="box stack" onSubmit={salvar}>
        <h2>{form.id ? "Editar especialidade" : "Nova especialidade"}</h2>
        <label>
          Código
          <input
            value={form.codigo_especialidade}
            onChange={(e) =>
              setForm({ ...form, codigo_especialidade: e.target.value })
            }
            placeholder="E001"
          />
        </label>
        <label>
          Nome
          <input
            value={form.nome_especialidade}
            onChange={(e) =>
              setForm({ ...form, nome_especialidade: e.target.value })
            }
            placeholder="Nome da especialidade"
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

      <div className="box stack">
        <h2>Especialidades</h2>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou código"
        />
        <div className="list">
          {filtrados.map((item) => (
            <article key={item.id} className="list-item">
              <div>
                <strong>{item.nome_especialidade}</strong>
                <span>{item.codigo_especialidade}</span>
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
