"use client";

import { useMemo, useState } from "react";

type Desbravador = {
  id: string;
  codigo_desbravador: string;
  nome_desbravador: string;
  unidade: string;
};

type Especialidade = {
  codigo_especialidade: string;
  nome_especialidade: string;
};

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
  desbravadores: Desbravador[];
  especialidades: Especialidade[];
  completas: Completa[];
};

type TipoRelatorio = "compra" | "especialidade" | "desbravador";

export function RelatoriosClient({ desbravadores, especialidades, completas }: Props) {
  const [tipoRelatorio, setTipoRelatorio] = useState<TipoRelatorio>("compra");
  const [especialidadesSelecionadas, setEspecialidadesSelecionadas] = useState<string[]>([]);
  const [desbravadoresSelecionados, setDesbravadoresSelecionados] = useState<string[]>([]);
  const [buscaEspecialidade, setBuscaEspecialidade] = useState("");
  const [buscaDesbravador, setBuscaDesbravador] = useState("");
  const [unidade, setUnidade] = useState("");

  const unidades = useMemo(
    () => Array.from(new Set(desbravadores.map((item) => item.unidade))).sort(),
    [desbravadores],
  );

  const resumoCompra = useMemo(() => {
    const totais = new Map<string, { codigo: string; nome: string; quantidade: number }>();

    especialidades.forEach((especialidade) => {
      totais.set(especialidade.codigo_especialidade, {
        codigo: especialidade.codigo_especialidade,
        nome: especialidade.nome_especialidade,
        quantidade: 0,
      });
    });

    completas.forEach((completa) => {
      const atual = totais.get(completa.codigo_especialidade);
      if (atual) atual.quantidade += 1;
    });

    return Array.from(totais.values())
      .filter((item) => item.quantidade > 0)
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [completas, especialidades]);

  const especialidadesFiltradas = useMemo(() => {
    const termo = buscaEspecialidade.toLowerCase();
    return especialidades.filter((item) =>
      `${item.codigo_especialidade} ${item.nome_especialidade}`
        .toLowerCase()
        .includes(termo),
    );
  }, [buscaEspecialidade, especialidades]);

  const desbravadoresFiltrados = useMemo(() => {
    const termo = buscaDesbravador.toLowerCase();
    return desbravadores.filter((item) => {
      const bateUnidade = !unidade || item.unidade === unidade;
      const bateBusca = `${item.codigo_desbravador} ${item.nome_desbravador} ${item.unidade}`
        .toLowerCase()
        .includes(termo);

      return bateUnidade && bateBusca;
    });
  }, [buscaDesbravador, desbravadores, unidade]);

  const relatorioPorEspecialidade = useMemo(() => {
    const codigos =
      especialidadesSelecionadas.length > 0
        ? especialidadesSelecionadas
        : especialidades.map((item) => item.codigo_especialidade);

    return completas
      .filter((item) => codigos.includes(item.codigo_especialidade))
      .sort((a, b) =>
        `${a.especialidade.nome_especialidade} ${a.desbravador.nome_desbravador}`.localeCompare(
          `${b.especialidade.nome_especialidade} ${b.desbravador.nome_desbravador}`,
          "pt-BR",
        ),
      );
  }, [completas, especialidades, especialidadesSelecionadas]);

  const relatorioPorEspecialidadeAgrupado = useMemo(() => {
    const grupos = new Map<
      string,
      {
        codigo: string;
        nome: string;
        desbravadores: {
          codigo: string;
          nome: string;
          unidade: string;
          created_at: string;
        }[];
      }
    >();

    relatorioPorEspecialidade.forEach((item) => {
      const grupo = grupos.get(item.codigo_especialidade) ?? {
        codigo: item.codigo_especialidade,
        nome: item.especialidade.nome_especialidade,
        desbravadores: [],
      };

      grupo.desbravadores.push({
        codigo: item.codigo_desbravador,
        nome: item.desbravador.nome_desbravador,
        unidade: item.desbravador.unidade,
        created_at: item.created_at,
      });
      grupos.set(item.codigo_especialidade, grupo);
    });

    return Array.from(grupos.values());
  }, [relatorioPorEspecialidade]);

  const relatorioPorDesbravador = useMemo(() => {
    const codigos =
      desbravadoresSelecionados.length > 0
        ? desbravadoresSelecionados
        : desbravadoresFiltrados.map((item) => item.codigo_desbravador);

    return completas
      .filter((item) => codigos.includes(item.codigo_desbravador))
      .filter((item) => !unidade || item.desbravador.unidade === unidade)
      .sort((a, b) =>
        `${a.desbravador.nome_desbravador} ${a.especialidade.nome_especialidade}`.localeCompare(
          `${b.desbravador.nome_desbravador} ${b.especialidade.nome_especialidade}`,
          "pt-BR",
        ),
      );
  }, [completas, desbravadoresFiltrados, desbravadoresSelecionados, unidade]);

  const relatorioPorDesbravadorAgrupado = useMemo(() => {
    const grupos = new Map<
      string,
      {
        codigo: string;
        nome: string;
        unidade: string;
        especialidades: {
          codigo: string;
          nome: string;
          created_at: string;
        }[];
      }
    >();

    relatorioPorDesbravador.forEach((item) => {
      const grupo = grupos.get(item.codigo_desbravador) ?? {
        codigo: item.codigo_desbravador,
        nome: item.desbravador.nome_desbravador,
        unidade: item.desbravador.unidade,
        especialidades: [],
      };

      grupo.especialidades.push({
        codigo: item.codigo_especialidade,
        nome: item.especialidade.nome_especialidade,
        created_at: item.created_at,
      });
      grupos.set(item.codigo_desbravador, grupo);
    });

    return Array.from(grupos.values());
  }, [relatorioPorDesbravador]);

  function alternarEspecialidade(codigo: string) {
    setEspecialidadesSelecionadas((atuais) =>
      atuais.includes(codigo)
        ? atuais.filter((item) => item !== codigo)
        : [...atuais, codigo],
    );
  }

  function alternarDesbravador(codigo: string) {
    setDesbravadoresSelecionados((atuais) =>
      atuais.includes(codigo)
        ? atuais.filter((item) => item !== codigo)
        : [...atuais, codigo],
    );
  }

  return (
    <div className="stack">
      <section className="box stack">
        <h2>Escolha o relatorio</h2>
        <div className="tabs">
          <button
            type="button"
            className={tipoRelatorio === "compra" ? "small" : "secondary small"}
            onClick={() => setTipoRelatorio("compra")}
          >
            Compra de especialidades
          </button>
          <button
            type="button"
            className={tipoRelatorio === "especialidade" ? "small" : "secondary small"}
            onClick={() => setTipoRelatorio("especialidade")}
          >
            Por especialidade
          </button>
          <button
            type="button"
            className={tipoRelatorio === "desbravador" ? "small" : "secondary small"}
            onClick={() => setTipoRelatorio("desbravador")}
          >
            Por desbravador
          </button>
        </div>
      </section>

      {tipoRelatorio === "compra" ? (
        <section className="box stack">
        <div className="selection-header">
          <h2>Compra de especialidades</h2>
          <div className="actions">
            <span>{resumoCompra.length} especialidade(s)</span>
            <button type="button" className="secondary small no-print" onClick={() => window.print()}>
              Imprimir
            </button>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Especialidade</th>
                <th>Quantidade concluida</th>
              </tr>
            </thead>
            <tbody>
              {resumoCompra.map((item) => (
                <tr key={item.codigo}>
                  <td>{item.nome}</td>
                  <td>{item.quantidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      ) : null}

      {tipoRelatorio === "especialidade" ? (
        <section className="grid-two">
        <div className="box stack">
          <div className="selection-header">
            <h2>Por especialidade</h2>
            <span>{especialidadesSelecionadas.length || "Todas"}</span>
          </div>
          <input
            value={buscaEspecialidade}
            onChange={(event) => setBuscaEspecialidade(event.target.value)}
            placeholder="Buscar especialidade"
          />
          <div className="actions">
            <button
              type="button"
              className="secondary small"
              onClick={() =>
                setEspecialidadesSelecionadas(
                  especialidadesFiltradas.map((item) => item.codigo_especialidade),
                )
              }
            >
              Selecionar filtradas
            </button>
            <button
              type="button"
              className="secondary small"
              onClick={() => setEspecialidadesSelecionadas([])}
            >
              Mostrar todas
            </button>
          </div>
          <div className="check-list report-list">
            {especialidadesFiltradas.map((item) => (
              <label key={item.codigo_especialidade} className="check-item">
                <input
                  type="checkbox"
                  checked={especialidadesSelecionadas.includes(item.codigo_especialidade)}
                  onChange={() => alternarEspecialidade(item.codigo_especialidade)}
                />
                <span>
                  <strong>{item.nome_especialidade}</strong>
                  <small>{item.codigo_especialidade}</small>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="box stack">
          <div className="selection-header">
            <h2>Resultado</h2>
            <div className="actions">
              <span>{relatorioPorEspecialidade.length} registro(s)</span>
              <button type="button" className="secondary small no-print" onClick={() => window.print()}>
                Imprimir
              </button>
            </div>
          </div>
          <div className="report-groups">
            {relatorioPorEspecialidadeAgrupado.map((grupo) => (
              <article key={grupo.codigo} className="report-group">
                <div className="report-group-title">
                  <h3>{grupo.nome}</h3>
                  <span>{grupo.desbravadores.length} desbravador(es)</span>
                </div>
                <ul>
                  {grupo.desbravadores.map((item) => (
                    <li key={`${grupo.codigo}-${item.codigo}`}>
                      <strong>{item.nome}</strong>
                      <span>{item.unidade}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {tipoRelatorio === "desbravador" ? (
        <section className="grid-two">
        <div className="box stack">
          <div className="selection-header">
            <h2>Por desbravador</h2>
            <span>{desbravadoresSelecionados.length || "Todos"}</span>
          </div>
          <label>
            Unidade
            <select
              value={unidade}
              onChange={(event) => {
                setUnidade(event.target.value);
                setDesbravadoresSelecionados([]);
              }}
            >
              <option value="">Todas as unidades</option>
              {unidades.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <input
            value={buscaDesbravador}
            onChange={(event) => setBuscaDesbravador(event.target.value)}
            placeholder="Buscar desbravador"
          />
          <div className="actions">
            <button
              type="button"
              className="secondary small"
              onClick={() =>
                setDesbravadoresSelecionados(
                  desbravadoresFiltrados.map((item) => item.codigo_desbravador),
                )
              }
            >
              Selecionar filtrados
            </button>
            <button
              type="button"
              className="secondary small"
              onClick={() => setDesbravadoresSelecionados([])}
            >
              Mostrar todos
            </button>
          </div>
          <div className="check-list report-list">
            {desbravadoresFiltrados.map((item) => (
              <label key={item.codigo_desbravador} className="check-item">
                <input
                  type="checkbox"
                  checked={desbravadoresSelecionados.includes(item.codigo_desbravador)}
                  onChange={() => alternarDesbravador(item.codigo_desbravador)}
                />
                <span>
                  <strong>{item.nome_desbravador}</strong>
                  <small>
                    {item.codigo_desbravador} - {item.unidade}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="box stack">
          <div className="selection-header">
            <h2>Resultado</h2>
            <div className="actions">
              <span>{relatorioPorDesbravador.length} registro(s)</span>
              <button type="button" className="secondary small no-print" onClick={() => window.print()}>
                Imprimir
              </button>
            </div>
          </div>
          <div className="report-groups">
            {relatorioPorDesbravadorAgrupado.map((grupo) => (
              <article key={grupo.codigo} className="report-group">
                <div className="report-group-title">
                  <h3>{grupo.nome}</h3>
                  <span>
                    {grupo.unidade} · {grupo.especialidades.length} especialidade(s)
                  </span>
                </div>
                <ul>
                  {grupo.especialidades.map((item) => (
                    <li key={`${grupo.codigo}-${item.codigo}`}>
                      <strong>{item.nome}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
      ) : null}
    </div>
  );
}
