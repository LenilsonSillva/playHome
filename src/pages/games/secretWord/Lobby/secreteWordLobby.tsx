import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayers } from "../../../../contexts/contextHook";
import { categories } from "../../../../data/words";
import { createTeams } from "../GameLogistic/gameLogistic";
import styles from "./secreteLobby.module.css";
import { SecretWordHeader } from "../../../../components/SecretWordHeader/SecretWordHeader";

export function SecretWordLobby() {
  const navigate = useNavigate();
  const { players, addPlayer, removePlayer } = usePlayers();

  // Configurações
  const [mode, setMode] = useState<"blitz" | "duel">("blitz");
  const [teamCount, setTeamCount] = useState(2);
  const [assignmentMode, setAssignmentMode] = useState<"random" | "manual">(
    "random",
  );
  const [name, setName] = useState("");
  const [selectedTime, setSelectedTime] = useState(60);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCats, setSelectedCats] = useState<string[]>([
    "Objetos",
    "Animais",
    "Ciência",
    "Natureza",
    "Comida",
    "Emoções",
    "Substantivos variados",
    "Lugares",
    "Países e Cidades",
    "Tecnologia",
  ]);

  const [matchLimit, setMatchLimit] = useState(5); // Padrão 5

  // Mapeamento Manual: id do player -> index do time (0 a 9)
  const [manualAssignments, setManualAssignments] = useState<
    Record<string, number>
  >({});

  const blitzTimes = [60, 90, 120];
  const duelTimes = [15, 30, 60];

  useEffect(() => {
    setSelectedTime(mode === "blitz" ? 60 : 15);
  }, [mode]);

  // Sincroniza o mapa manual quando players entram ou a Qtd de times muda
  useEffect(() => {
    const newAssignments = { ...manualAssignments };
    players.forEach((p) => {
      if (
        newAssignments[p.id] === undefined ||
        newAssignments[p.id] >= teamCount
      ) {
        newAssignments[p.id] = 0;
      }
    });
    setManualAssignments(newAssignments);
  }, [players, teamCount]);

  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim() || players.length >= 20) return;
    addPlayer(name.trim());
    setName("");
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
  };

  const handleStart = () => {
    let teams;
    if (assignmentMode === "random") {
      teams = createTeams(players, teamCount);
    } else {
      teams = Array.from({ length: teamCount }).map((_, i) => ({
        id: `team-${i}`,
        name: `Esquadrão ${["Alfa", "Bravo", "Charlie", "Delta", "Eco", "Foxtrot", "Golfe", "Hotel", "Índia", "Julieta"][i]}`,
        playerIds: players
          .filter((p) => manualAssignments[p.id] === i)
          .map((p) => p.id),
        score: 0,
        roundScore: 0,
        color: [
          "#3b82f6",
          "#ff003c",
          "#10b981",
          "#facc15",
          "#a855f7",
          "#ec4899",
          "#06b6d4",
          "#f97316",
          "#84cc16",
          "#64748b",
        ][i],
        wordsGuessed: [],
      }));
    }

    // ESQUADRÃO NÃO FICA VAZIO

    if (teams.some((t) => t.playerIds.length === 0)) {
      alert(
        "Atenção: Todos os esquadrões precisam de pelo menos 1 tripulante!",
      );
      return;
    }

    // SE TIVER MAIS DE 4 JOGADORES, OS ESQUEDRÕES TÊM DE TER MAIS QUE 2 JOGADORES

    if (players.length >= 4 && teams.some((t) => t.playerIds.length === 1)) {
      alert(
        "Protocolo Inválido: Com 4 ou mais jogadores, cada grupo deve ser composto por no mínimo 2 pessoas (formar duplas). " +
          "Reduza a quantidade de grupos ou redistribua os jogadores.",
      );
      return;
    }

    // VAI PARA A PÁGINA QUE MOSTRA OS GRUPOS FORMADOS

    navigate("/games/secretWord/game", {
      state: {
        data: {
          mode,
          teams,
          currentTeamIdx: 0,
          currentOperatorId: null,
          roundTime: selectedTime,
          selectedCategories: selectedCats,
          phase: "team-reveal",
          currentWord: null,
          usedWords: [],
          matchLimit: mode === "duel" ? matchLimit : 1, // Blitz não usa limite de palavras fixo por partida
          currentMatchIdx: 0,
        },
      },
    });
  };

  return (
    <div className={styles.lobbyWrapperHeaderAndContent}>
      <SecretWordHeader mode={setMode} currentMode={mode} />

      {/* 1. EXPLICAÇÃO (Mantida) */}
      <div className={styles.lobbyWrapperContent}>
        <div className={`${styles.section} ${styles.modeInfoBox}`}>
          <div className={styles.infoIcon}>📡</div>
          <div className={styles.infoContent}>
            <h3 className={styles.infoTitle}>
              {mode === "blitz"
                ? "PROTOCOLO INFILTRAÇÃO"
                : "PROTOCOLO INTERCEPTAÇÃO"}
            </h3>
            <p className={styles.infoText}>
              {mode === "blitz"
                ? "Um operador recebe uma palavra e os seus colegas de equipe tentam adivinha-la. Um esquadrão por vez, acerte o máximo de palavras antes do tempo acabar."
                : "Os operadores dos esquadrões recebem a mesma palavra, cada um dá uma dica por vez, ganha quem acertar primeiro."}
            </p>
          </div>
        </div>

        {/* 2. FORMAÇÃO DE ESQUADRÕES (Apenas Opção) */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>
            DISTRIBUIÇÃO DOS JOGADORES
          </label>
          <div className={styles.segmentedControl}>
            <button
              className={`${styles.segBtn} ${assignmentMode === "random" ? styles.segActive : ""}`}
              onClick={() => setAssignmentMode("random")}
            >
              ALEATÓRIO
            </button>
            <button
              className={`${styles.segBtn} ${assignmentMode === "manual" ? styles.segActive : ""}`}
              onClick={() => setAssignmentMode("manual")}
            >
              MANUAL
            </button>
          </div>
        </div>

        {/* 3. QUANTIDADE DE ESQUADRÕES (Até 10) */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>NÚMERO DE GRUPOS</label>
          <div className={styles.counter}>
            <button
              className={styles.countBtn}
              onClick={() => setTeamCount(Math.max(2, teamCount - 1))}
            >
              -
            </button>
            <span className={styles.countDisplay}>{teamCount}</span>
            <button
              className={styles.countBtn}
              onClick={() => setTeamCount(Math.min(10, teamCount + 1))}
            >
              +
            </button>
          </div>
        </div>

        {/* 4. ADICIONAR JOGADORES + LISTA COM SELECT (Se manual) */}
        <div className={styles.section}>
          <label className={styles.sectionLabel}>
            TRIPULANTES ({players.length}/20)
          </label>
          <form className={styles.inputGroup} onSubmit={handleAddPlayer}>
            <input
              type="text"
              placeholder="Nome do Tripulante"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.textInput}
              maxLength={156}
            />
            <button
              type="submit"
              className={styles.addButton}
              disabled={players.length >= 20}
            >
              ADICIONAR
            </button>
          </form>

          <div className={styles.playersList}>
            {players.map((p) => (
              <div key={p.id} className={styles.playerTag}>
                <div className={styles.playerTagContent}>
                  <span className={styles.dotIndicator} />
                  <span className={styles.pName}>{p.name}</span>
                </div>

                <div className={styles.playerTagActions}>
                  {assignmentMode === "manual" && (
                    <select
                      className={styles.inlineSelect}
                      value={manualAssignments[p.id]}
                      onChange={(e) =>
                        setManualAssignments({
                          ...manualAssignments,
                          [p.id]: parseInt(e.target.value),
                        })
                      }
                    >
                      {Array.from({ length: teamCount }).map((_, i) => (
                        <option key={i} value={i}>
                          Grupo {i + 1}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => removePlayer(p.id)}
                    className={styles.removeBtn}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. CONFIGURAÇÕES TÉCNICAS */}
        <div className={styles.configGrid}>
          <div className={styles.section}>
            <label className={styles.sectionLabel}>CRONÔMETRO</label>
            <div className={styles.timeOptions}>
              {(mode === "blitz" ? blitzTimes : duelTimes).map((t) => (
                <button
                  key={t}
                  className={`${styles.timeBtn} ${selectedTime === t ? styles.timeActive : ""}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>
          {mode === "duel" && (
            <div className={styles.section}>
              <label className={styles.sectionLabel}>
                QUANTIDADE DE PALAVRAS
              </label>
              <div className={styles.timeOptions}>
                {[5, 10, 20].map((n) => (
                  <button
                    key={n}
                    className={`${styles.timeBtn} ${matchLimit === n ? styles.timeActive : ""}`}
                    onClick={() => setMatchLimit(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>BANCO DE DADOS</label>
            <button
              className={`${styles.catToggle} ${showCategories ? styles.catOpen : ""}`}
              onClick={() => setShowCategories(!showCategories)}
            >
              {showCategories ? "FECHAR" : "CATEGORIAS"}
            </button>
          </div>
        </div>

        {showCategories && (
          <div className={styles.catGrid}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.catItem} ${selectedCats.includes(cat) ? styles.catActive : ""}`}
                onClick={() =>
                  setSelectedCats((prev) =>
                    prev.includes(cat)
                      ? prev.filter((c) => c !== cat)
                      : [...prev, cat],
                  )
                }
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <button
          className={styles.startBtn}
          disabled={players.length < teamCount}
          onClick={handleStart}
        >
          INICIALIZAR MISSÃO
        </button>
      </div>
    </div>
  );
}
