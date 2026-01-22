import { useEffect, useRef, useState } from "react";
import styles from "./discussPhase.module.css";
import type {
  GameRouteState,
  ImpostorGameState,
} from "../../GameLogistic/types";
import { PlayerAvatar } from "../../../../../components/PlayerAvatar/PlayerAvatar";
import startedSd from "./../../../../../assets/sounds/alert.wav";

type DiscussPhaseProps = {
  data: GameRouteState["data"];
  onNextPhase: (phase: ImpostorGameState["phase"]) => void;
};

export function DiscussPhase({ data, onNextPhase }: DiscussPhaseProps) {
  const [seconds, setSeconds] = useState(0);
  const aliveImpostorsCount = data.players.filter(
    (p) => p.isImpostor && p.isAlive,
  ).length;
  const [, setFeedback] = useState<"none" | "started">("none");
  const impostorSound = useRef(new Audio(startedSd));

  const playSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reinicia o áudio se ele já estiver tocando
      audioRef.current.play().catch(() => {}); // Evita erro de interação do navegador
    }
  };

  const triggerFeedback = (type: "started") => {
    if (type === "started") {
      playSound(impostorSound); // Usa a função auxiliar
      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }
      setTimeout(() => setFeedback("none"), 10);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setSeconds((p) => p + 1), 1000);
    if (seconds === 0) {
      triggerFeedback("started");
    }
    return () => clearInterval(interval);
  }, []);

  // ORDENAÇÃO: Filtramos os vivos e ordenamos pelo score decrescente
  const sortedPlayers = [...data.players]
    .filter((p) => p.isAlive)
    // Ordena por globalScore (que agora contém o total até a rodada passada)
    .sort((a, b) => (b.globalScore ?? 0) - (a.globalScore ?? 0));

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  return (
    <div className={styles.container}>
      <div className={styles.glassPanel}>
        <h1 className={styles.title}>Discussão</h1>

        <div className={styles.timerContainer}>
          <span className={styles.timerLabel}>TEMPO DECORRIDO</span>
          <div className={styles.clock}>{formatTime(seconds)}</div>
        </div>

        <div className={styles.statusBox}>
          {data.whoStart && (
            <p className={styles.startInfo}>
              📡 <strong>{data.whoStart.toUpperCase()}</strong> captou algo e
              inicia a rodada.
            </p>
          )}

          <p className={styles.impostorCount}>
            ⚠️{" "}
            {aliveImpostorsCount === 1
              ? "1 IMPOSTOR VIVO"
              : `${aliveImpostorsCount} IMPOSTORES VIVOS`}
          </p>
        </div>

        <div className={styles.playerGrid}>
          {sortedPlayers.map((p) => (
            <div
              key={p.id}
              className={styles.playerCard}
              style={{ "--player-color": p.color } as any}
            >
              {/* Passamos hideScan para limpar o visual */}
              <PlayerAvatar
                emoji={p.emoji}
                color={p.color}
                size={40}
                hideScan
              />
              <div className={styles.playerInfo}>
                <span className={styles.playerName}>{p.name}</span>
                {/* Mostra o placar atualizado das rodadas já finalizadas */}
                <span className={styles.playerScore}>
                  Pontos: {p.globalScore}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.buttonGroup}>
          <button
            className={`${styles.actionBtn} ${styles.votingBtn}`}
            onClick={() => onNextPhase("voting")}
          >
            VOTAR
          </button>
          <button
            className={`${styles.actionBtn} ${styles.skipBtn}`}
            onClick={() => onNextPhase("elimination")}
          >
            PULAR VOTAÇÃO
          </button>
        </div>
      </div>
    </div>
  );
}
