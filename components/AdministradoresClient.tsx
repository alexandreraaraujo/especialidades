"use client";

import { FormEvent, useEffect, useState } from "react";

type Administrador = {
  id: string;
  email: string;
  created_at: string;
};

export function AdministradoresClient() {
  const [items, setItems] = useState<Administrador[]>([]);
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function carregar() {
    const response = await fetch("/api/administradores");
    const data = await response.json();

    if (!response.ok) {
      setErro(data.error ?? "Nao foi possivel carregar administradores.");
      return;
    }

    setItems(data);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    const response = await fetch("/api/administradores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();

    if (!response.ok) {
      setErro(data.error ?? "Nao foi possivel cadastrar administrador.");
      return;
    }

    setMensagem(data.message);
    setEmail("");
    carregar();
  }

  async function excluir(item: Administrador) {
    if (!confirm(`Excluir administrador ${item.email}?`)) return;
    setMensagem("");
    setErro("");

    const response = await fetch(`/api/administradores/${item.id}`, {
      method: "DELETE",
    });
    const data = await response.json();

    if (!response.ok) {
      setErro(data.error ?? "Nao foi possivel excluir administrador.");
      return;
    }

    setMensagem(data.message);
    carregar();
  }

  return (
    <section className="grid-two">
      <form className="box stack" onSubmit={salvar}>
        <h2>Novo administrador</h2>
        <label>
          E-mail
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="admin@example.com"
            type="email"
          />
        </label>
        <button type="submit">Salvar</button>
        <Feedback mensagem={mensagem} erro={erro} />
      </form>

      <div className="box stack">
        <h2>Administradores</h2>
        <div className="list">
          {items.map((item) => (
            <article key={item.id} className="list-item">
              <div>
                <strong>{item.email}</strong>
                <span>{new Date(item.created_at).toLocaleString("pt-BR")}</span>
              </div>
              <button type="button" className="danger small" onClick={() => excluir(item)}>
                Excluir
              </button>
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
