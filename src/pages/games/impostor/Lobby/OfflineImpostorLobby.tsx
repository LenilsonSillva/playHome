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
    "Ciência",
    "Plantas",
    "Natureza",
    "Comida",
    "Emoções",
    "Gramática e Substantivos",
    "Lugares",
    "Países e Cidades",
    "Tecnologia",
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
      <div className={styles.headerArea}>
        <h1 className={styles.title}>OPÇÕES DE PROTOCOLO</h1>
        <p className={styles.subtitle}>Configure os parâmetros da missão</p>
      </div>

      {/* SEÇÃO DE JOGADORES */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>EQUIPE DE EXPLORAÇÃO</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Identificação do Tripulante"
            className={styles.textInput}
            value={name}
            maxLength={15}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleAddNamePlayer} className={styles.addButton}>
            ADICIONAR
          </button>
        </div>

        <div className={styles.playersList}>
          {players.map((player) => (
            <div key={player.id} className={styles.playerTag}>
              <span className={styles.dotIndicator} />
              <span className={styles.pName}>{player.name}</span>
              <button
                className={styles.removeBtn}
                onClick={() => removePlayer(player.id)}
                aria-label="Remover jogador"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEÇÃO DE IMPOSTORES */}
      <div className={styles.section}>
        <div className={styles.counterRow}>
          <h2 className={styles.sectionTitle}>QUANTIDADE DE IMPOSTORES</h2>
          <div className={styles.counterControls}>
            <button
              className={styles.countBtn}
              onClick={() =>
                setSelectImpostorNumbers((p) => Math.max(p - 1, 1))
              }
            >
              -
            </button>
            <span className={styles.countDisplay}>{selectImpostorNumbers}</span>
            <button
              className={styles.countBtn}
              onClick={() =>
                setSelectImpostorNumbers((p) => Math.min(p + 1, maxImpostors))
              }
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* CONFIGURAÇÕES GERAIS EM GRADE */}
      <div className={styles.gridSettings}>
        {[
          {
            label: "Duas palavras",
            state: twoGroups,
            fn: handleTwoGroupsChange,
          },
          {
            label: "Jogador aleatório inicia",
            state: whoStart,
            fn: handleWhoStart,
          },
          {
            label: "Impostor pode iniciar",
            state: impostorCanStart,
            fn: handleImpostorCanStart,
          },
          {
            label: "Impostor tem dica",
            state: impostorHint,
            fn: handleImpostorHintChange,
          },
        ].map((item, i) => (
          <label key={i} className={styles.checkboxLabel}>
            <span className={styles.checkText}>{item.label}</span>
            <div className={styles.switchWrapper}>
              <input
                type="checkbox"
                className={styles.checkboxInput}
                checked={item.state}
                onChange={item.fn}
              />
              <span className={styles.switchSlider}></span>
            </div>
          </label>
        ))}
      </div>

      {/* CATEGORIAS */}
      <div className={styles.categorySection}>
        <button
          type="button"
          className={`${styles.categoryToggle} ${showCategories ? styles.active : ""}`}
          onClick={() => setShowCategories(!showCategories)}
        >
          {showCategories ? "OCULTAR CATEGORIAS" : "SELECIONAR CATEGORIAS"}
        </button>

        {showCategories && (
          <div className={styles.categoryContainer}>
            <div className={styles.categoryGrid}>
              {categories.map((cat, index) => (
                <label key={index} className={styles.categoryItem}>
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={categorie.includes(cat)}
                    onChange={() => handleCategorie(cat)}
                  />
                  <span className={styles.categoryBox}>{cat}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={startGame}
        className={styles.startButton}
        disabled={players.length < 3}
      >
        INICIAR MISSÃO
      </button>
    </div>
  );
}
