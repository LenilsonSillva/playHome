import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categories } from "../../../../data/words";
import styles from "./OnlineLobby.module.css";
import { useSocket } from "../../../../contexts/socketContext";

export function OnlineImpostorLobby() {
  const socket = useSocket();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [inRoom, setInRoom] = useState(false);

  const [players, setPlayers] = useState<any[]>([]);
  const [isHost, setIsHost] = useState(false);

  const [selectImpostorNumbers, setSelectImpostorNumbers] = useState(1);

  const [twoGroups, setTwoGroups] = useState(false);
  const [whoStart, setWhoStart] = useState(true);
  const [impostorCanStart, setImpostorCanStart] = useState(true);
  const [impostorHint, setImpostorHint] = useState(false);

  const [showCategories, setShowCategories] = useState(false);
  const [categorie, setCategorie] = useState<string[]>([
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

  const PLAYER_ICONS = [
    "🤫",
    "😁",
    "👾",
    "🧑🏻‍🚀",
    "👩🏽‍🚀",
    "👽",
    "🤖",
    "😎",
    "🫥",
    "🤔",
    "🤐",
    "😶‍🌫️",
    "😶",
    "🫠",
    "🥸",
    "🤥",
    "🫣",
    "🧐",
    "👹",
    "🫢",
    "🤓",
    "😈",
    "👿",
    "💀",
    "👻",
    "👺",
    "🧞‍♀️",
    "🧞‍♂️",
    "🧟",
    "🧌",
    "👨🏻",
    "👨🏽",
    "👩🏽",
    "👩🏻",
    "🤴🏻",
    "👸🏻",
    "🧑🏻‍🎄",
    "🕵🏻‍♀️",
    "🦹🏻",
    "🦸🏻",
    "🧙🏻",
    "🧛🏻",
  ];

  const ICON_COLORS = [
    "#ff003c",
    "#3b82f6",
    "#facc15",
    "#51890c",
    "#6d28d9",
    "#19a5ac",
    "#ff7b00",
    "#ff00fb",
    "#00ff40",
    "#69166b",
    "#7f1d1d",
    "#075985",
    "#a16207",
    "#065f46",
    "#4c1d95",
    "#13697f",
    "#b91c1c",
    "#1d4ed8",
    "#ba8d07",
    "#777777",
  ];

  function generateId() {
    return (
      Math.random().toString(36).substring(2, 9) +
      new Date().getTime().toString(36)
    );
  }

  function getRandomFromArray(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  const maxImpostors = useMemo(() => {
    if (players.length >= 7) return 3;
    if (players.length >= 5) return 2;
    return 1;
  }, [players.length]);

  useEffect(() => {
    setSelectImpostorNumbers((p) => Math.min(p, maxImpostors));
  }, [players.length, maxImpostors]);

  useEffect(() => {
    socket.on("room-updated", (room) => {
      setPlayers(room.players);
      setRoomCode(room.code);
      setIsHost(room.hostId === socket.id);
    });

    socket.on("game-update", (data) => {
      navigate("/games/impostor/online", { state: data });
    });

    return () => {
      socket.off("room-updated");
      socket.off("game-update");
    };
  }, [navigate, socket]);

  function handleCategorie(cat: string) {
    categorie.includes(cat)
      ? setCategorie((prev) => prev.filter((item) => item !== cat))
      : setCategorie((prev) => [...prev, cat]);
  }

  function handleCreate() {
    if (!name.trim()) return alert("Digite seu nome");

    const id = generateId();
    const emoji = getRandomFromArray(PLAYER_ICONS);
    const color = getRandomFromArray(ICON_COLORS);

    socket.emit("create-room", { name, id, emoji, color }, (res: any) => {
      if (res.error) return alert(res.error);
      setInRoom(true);
    });
  }

  function handleJoin() {
    if (!name.trim() || !roomCode.trim()) return alert("Preencha tudo");

    const id = generateId();
    const emoji = getRandomFromArray(PLAYER_ICONS);
    const color = getRandomFromArray(ICON_COLORS);

    socket.emit(
      "join-room",
      { name, id, emoji, color, roomCode: roomCode.toUpperCase() },
      (res: any) => {
        if (res.error) return alert(res.error);
        setInRoom(true);
      },
    );
  }

  function startGame() {
    socket.emit("start-game", {
      roomCode,
      config: {
        howManyImpostors: selectImpostorNumbers,
        twoWordsMode: twoGroups,
        whoStart,
        impostorCanStart,
        impostorHasHint: impostorHint,
        selectedCategories: categorie,
      },
    });
  }

  if (!inRoom) {
    return (
      <div className={styles.lobbyWrapper}>
        <h1 className={styles.title}>CONEXÃO ONLINE</h1>

        <div className={styles.section}>
          <input
            className={styles.textInput}
            placeholder="Seu Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={15}
          />

          <button
            className={styles.startButton}
            style={{ marginTop: "20px" }}
            onClick={handleCreate}
          >
            CRIAR ESTAÇÃO
          </button>

          <div
            style={{
              textAlign: "center",
              margin: "20px",
              color: "var(--text-muted)",
            }}
          >
            OU
          </div>

          <div className={styles.inputGroup}>
            <input
              className={styles.textInput}
              placeholder="CÓDIGO"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <button className={styles.addButton} onClick={handleJoin}>
              ENTRAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.lobbyWrapper}>
      <div className={styles.headerArea}>
        <h1 className={styles.title}>SALA: {roomCode}</h1>
        <p className={styles.subtitle}>
          {isHost ? "Você é o comandante" : "Aguardando o comandante..."}
        </p>
      </div>

      {/* JOGADORES */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>EQUIPE DE EXPLORAÇÃO</h2>
        <div className={styles.playersList}>
          {players.map((p) => (
            <div key={p.socketId} className={styles.playerTag}>
              <span className={styles.dotIndicator} />
              <span className={styles.pName}>
                {p.name} {p.socketId === socket.id ? "(Você)" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SOMENTE HOST VÊ AS CONFIGS */}
      {isHost && (
        <>
          {/* IMPOSTORES */}
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
                <span className={styles.countDisplay}>
                  {selectImpostorNumbers}
                </span>
                <button
                  className={styles.countBtn}
                  onClick={() =>
                    setSelectImpostorNumbers((p) =>
                      Math.min(p + 1, maxImpostors),
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* GRADE DE CONFIG */}
          <div className={styles.gridSettings}>
            {[
              {
                label: "Duas palavras",
                state: twoGroups,
                fn: (e: any) => setTwoGroups(e.target.checked),
              },
              {
                label: "Jogador aleatório inicia",
                state: whoStart,
                fn: (e: any) => setWhoStart(e.target.checked),
              },
              {
                label: "Impostor pode iniciar",
                state: impostorCanStart,
                fn: (e: any) => setImpostorCanStart(e.target.checked),
              },
              {
                label: "Impostor tem dica",
                state: impostorHint,
                fn: (e: any) => setImpostorHint(e.target.checked),
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

          {/* INICIAR */}
          <button
            className={styles.startButton}
            disabled={players.length < 3}
            onClick={startGame}
          >
            INICIAR MISSÃO
          </button>
        </>
      )}
    </div>
  );
}
