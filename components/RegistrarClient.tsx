"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Desbravador = {
  codigo_desbravador: string;
  nome_desbravador: string;
  unidade: string;
};

type Especialidade = {
  codigo_especialidade: string;
  nome_especialidade: string;
};

type Props =
  | { modo: "desbravador" }
  | { modo: "especialidade" };

export function RegistrarClient({ modo }: Props) {
  const [desbravadores, setDesbravadores] = useState<Desbravador[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [principal, setPrincipal] = useState("");
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [busca, setBusca] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/desbravadores"), fetch("/api/especialidades")])
      .then(async ([desbravadoresResponse, especialidadesResponse]) => {
        setDesbravadores(await desbravadoresResponse.json());
        setEspecialidades(await especialidadesResponse.json());
      });
  }, []);

  const opcoes = modo === "desbravador" ? especialidades : desbravadores;
  const filtradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return opcoes.filter((item) => JSON.stringify(item).toLowerCase().includes(termo));
  }, [busca, opcoes]);

  function alternar(codigo: string) {
    setSelecionados((atuais) =>
      atuais.includes(codigo)
        ? atuais.filter((item) => item !== codigo)
        : [...atuais, codigo],
    );
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    const porDesbravador = modo === "desbravador";
    const response = await fetch(
      porDesbravador
        ? "/api/completas/por-desbravador"
        : "/api/completas/por-especialidade",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          porDesbravador
            ? {
                codigo_desbravador: principal,
                codigos_especialidades: selecionados,
              }
            : {
                codigo_especialidade: principal,
                codigos_desbravadores: selecionados,
              },
        ),
      },
    );
    const data = await response.json();

    if (!response.ok) {
      setErro(data.error ?? "Nao foi possivel registrar.");
      return;
    }

    setMensagem(`${data.message} Total: ${data.total}.`);
    setSelecionados([]);
  }

  return (
    <form className="box stack" onSubmit={salvar}>
      <label>
        {modo === "desbravador" ? "Desbravador" : "Especialidade"}
        <select value={principal} onChange={(e) => setPrincipal(e.target.value)}>
          <option value="">Selecione</option>
          {modo === "desbravador"
            ? desbravadores.map((item) => (
                <option key={item.codigo_desbravador} value={item.codigo_desbravador}>
                  {item.nome_desbravador} ({item.codigo_desbravador}) - {item.unidade}
                </option>
              ))
            : especialidades.map((item) => (
                <option key={item.codigo_especialidade} value={item.codigo_especialidade}>
                  {item.nome_especialidade} ({item.codigo_especialidade})
                </option>
              ))}
        </select>
      </label>

      <label>
        Buscar na lista
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={
            modo === "desbravador"
              ? "Buscar especialidade"
              : "Buscar desbravador"
          }
        />
      </label>

      <div className="selection-header">
        <strong>
          {modo === "desbravador" ? "Especialidades" : "Desbravadores"}
        </strong>
        <span>{selecionados.length} selecionado(s)</span>
      </div>

      <div className="check-list">
        {filtradas.map((item) => {
          const codigo =
            modo === "desbravador"
              ? (item as Especialidade).codigo_especialidade
              : (item as Desbravador).codigo_desbravador;
          const nome =
            modo === "desbravador"
              ? (item as Especialidade).nome_especialidade
              : (item as Desbravador).nome_desbravador;

          return (
            <label key={codigo} className="check-item">
              <input
                type="checkbox"
                checked={selecionados.includes(codigo)}
                onChange={() => alternar(codigo)}
              />
              <span>
                <strong>{nome}</strong>
                <small>{codigo}</small>
              </span>
            </label>
          );
        })}
      </div>

      <div className="actions">
        <button type="submit">Salvar registros</button>
        <button type="button" className="secondary" onClick={() => setSelecionados([])}>
          Limpar seleção
        </button>
      </div>
      <Feedback mensagem={mensagem} erro={erro} />
    </form>
  );
}

function Feedback({ mensagem, erro }: { mensagem: string; erro: string }) {
  if (!mensagem && !erro) return null;
  return <p className={erro ? "feedback error" : "feedback success"}>{erro || mensagem}</p>;
}
