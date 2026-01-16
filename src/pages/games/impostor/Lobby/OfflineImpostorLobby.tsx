import { useEffect, useState } from "react";
import { usePlayers } from "../../../../contexts/contextHook";
import { getImpostorCount, initializeGame } from "../GameLogistic/gameLogistic";
import { useNavigate } from "react-router-dom";
import { categories } from "../GameLogistic/words";
import styles from "./offlineLobbyStyle.module.css";
import type { GameRouteState } from "../GameLogistic/types";

export function OfflineImpostorLobby() {
  const navigate = useNavigate();
  const { players, addPlayer, removePlayer } = usePlayers();
  const [name, setName] = useState("");
  const maxImpostors = getImpostorCount(players.length);
  const [selectImpostorNumbers, setSelectImpostorNumbers] = useState(1);
  const [twoGroups, setTwoGroups] = useState<boolean>(false);
  const initialCategories = [
    "Objetos",
    "Animais",
    "Frutas",
    "Plantas",
    "Natureza",
    "Comida",
  ];
  const [categorie, setCategorie] = useState<string[]>(initialCategories);
  const [impostorHint, setImpostorHint] = useState<boolean>(false);
  const [whoStart, setWhoStart] = useState<boolean>(true);
  const [impostorCanStart, setImpostorCanStart] = useState<boolean>(true);
  const [showCategories, setShowCategories] = useState(false);

  // Função para adicionar um jogador à lista

  function handleAddNamePlayer() {
    if (!name.trim()) return;
    addPlayer(name.trim());
    setName("");
  }

  // Função para lidar com a mudança do checkbox de dois grupos

  function handleTwoGroupsChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTwoGroups(event.target.checked);
  }

  function handleWhoStart(event: React.ChangeEvent<HTMLInputElement>) {
    setWhoStart(event.target.checked);
  }

  function handleImpostorCanStart(event: React.ChangeEvent<HTMLInputElement>) {
    setImpostorCanStart(event.target.checked);
  }

  function handleCategorie(cat: string) {
    categorie.includes(cat)
      ? setCategorie((prev) => prev.filter((item) => item !== cat))
      : setCategorie((prev) => [...prev, cat]);
  }

  // Função para lidar com a mudança do checkbox de dica do impostor

  function handleImpostorHintChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setImpostorHint(event.target.checked);
  }

  // Atualiza o número máximo de impostores quando a lista de jogadores muda

  useEffect(() => {
    setSelectImpostorNumbers(Math.min(selectImpostorNumbers, maxImpostors));
  }, [players.length, maxImpostors]);

  // Função para iniciar o jogo

  function startGame() {
    const allData = initializeGame(
      players,
      selectImpostorNumbers,
      twoGroups,
      impostorHint,
      categorie,
      whoStart,
      impostorCanStart,
    );

    if (allData !== undefined) {
      navigate("/games/impostor/offline", {
        state: {
          data: {
            players: allData.allPlayers,
            howManyImpostors: allData.howManyImpostors,
            impostorCanStart: allData.impostorCanStart,
            impostorHint: allData.impostorHasHint,
            selectedCategories: allData.selectedCategories,
            twoWordsMode: allData.twoWordsMode,
            whoStart: allData.whoStart,
            phase: "reveal",
          },
        } satisfies GameRouteState,
      });
    }
  }

  return (
    <div className={styles.lobbyWrapper}>
      <h1 className={styles.title}>OPÇÕES DE JOGO</h1>

      <div className={styles.section}>
        <label style={{ fontSize: "1.7rem" }}>
          Adicione os jogadores (Mínimo 3):
        </label>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Nome do Jogador"
            value={name}
            maxLength={15}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            onClick={handleAddNamePlayer}
            className={styles.optButton}
            style={{ padding: "10px 20px", fontSize: "1.5rem" }}
          >
            Adicionar
          </button>
        </div>

        <div className={styles.playersList}>
          {players.map((player) => (
            <div key={player.id} className={styles.playerTag}>
              <span>{player.name}</span>
              <button
                className={styles.removeBtn}
                onClick={() => removePlayer(player.id)}
                title="Remover tripulante"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label style={{ fontSize: "1.7rem" }}>Quantidade de impostor:</label>
        <div
          className={styles.inputGroup}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <button
            className={styles.optButton}
            style={{ padding: "5px 15px" }}
            onClick={() => setSelectImpostorNumbers((p) => Math.max(p - 1, 1))}
          >
            -
          </button>
          <span
            style={{
              fontSize: "1.7rem",
              minWidth: "40px",
              textAlign: "center",
            }}
          >
            {selectImpostorNumbers}
          </span>
          <button
            className={styles.optButton}
            style={{ padding: "5px 15px" }}
            onClick={() =>
              setSelectImpostorNumbers((p) => Math.min(p + 1, maxImpostors))
            }
          >
            +
          </button>
        </div>
      </div>

      <div className={`${styles.section} ${styles.gridSettings}`}>
        <label className={styles.checkboxLabel}>
          <span>Duas palavras</span>
          <div style={{ position: "relative" }}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={twoGroups}
              onChange={handleTwoGroupsChange}
            />
            <span className={styles.switch}></span>
          </div>
        </label>

        <label className={styles.checkboxLabel}>
          <span>Jogador aleatório inicia</span>
          <div style={{ position: "relative" }}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={whoStart}
              onChange={handleWhoStart}
            />
            <span className={styles.switch}></span>
          </div>
        </label>

        <label className={styles.checkboxLabel}>
          <span>Impostor pode iniciar</span>
          <div style={{ position: "relative" }}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={impostorCanStart}
              onChange={handleImpostorCanStart}
            />
            <span className={styles.switch}></span>
          </div>
        </label>
        <label className={styles.checkboxLabel}>
          <span>Impostor tem dica</span>
          <div style={{ position: "relative" }}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={impostorHint}
              onChange={handleImpostorHintChange}
            />
            <span className={styles.switch}></span>
          </div>
        </label>
      </div>

      {/* Botão para mostrar/esconder categorias */}
      <div className={styles.section} style={{ textAlign: "center" }}>
        <button
          type="button"
          className={styles.optButton}
          style={{
            background: showCategories
              ? "var(--gray-600)"
              : "var(--plasma-blue)",
            fontSize: "1.5rem",
            padding: "10px 20px",
            width: "auto",
          }}
          onClick={() => setShowCategories(!showCategories)}
        >
          {showCategories ? "Esconder Categorias" : "Selecionar Categorias"}
        </button>
      </div>

      {/* Renderização Condicional das Categorias */}
      {showCategories && (
        <div className={styles.section}>
          <p
            style={{
              marginBottom: "10px",
              fontSize: "1.5rem",
              color: "var(--tech-cyan)",
            }}
          >
            Categorias de palavras Selecionadas:
          </p>
          <div className={styles.categoryGrid}>
            {categories.map((cat, index) => (
              <label key={index} className={styles.checkboxLabel}>
                <span>{cat}</span>
                <div style={{ position: "relative" }}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={categorie.includes(cat)}
                    onChange={() => handleCategorie(cat)}
                  />
                  <span className={styles.switch}></span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={startGame}
        className={styles.startButton}
        disabled={players.length < 3}
      >
        INICIAR JOGO
      </button>
    </div>
  );
}
