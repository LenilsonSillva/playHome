import { useEffect, useState } from "react";
import styles from "./revelPhase.module.css";
import type { ImpostorGameState } from "../../GameLogistic/types";
import { PlayerAvatar } from "../../../../../components/PlayerAvatar/PlayerAvatar";

type RevealPhaseProps = {
  data: any;
  onNextPhase: (phase: ImpostorGameState["phase"]) => void;
  onExit: () => void;
  isOnline?: boolean;
  onReroll?: () => void;
  onToggleReadyOnline?: () => void;
};

export function RevealPhase({
  data,
  onNextPhase,
  onExit,
  isOnline,
  onReroll,
  onToggleReadyOnline,
}: RevealPhaseProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const allReady = data.allPlayers?.every((p: any) => p.ready);

  const canReroll = isOnline ? data.isHost : true;

  const player = isOnline
    ? {
        name: data.myName || "VOCÊ",
        emoji: data.myEmoji,
        color: data.myColor,
        isImpostor: data.isImpostor,
        word: data.word,
        hint: data.hint,
      }
    : data.players[index];

  function handleNext() {
    if (isOnline) {
      onNextPhase("discussion"); // envia o "ready" pro servidor
      return;
    }

    setRevealed(false);
    setIndex((prev) => prev + 1);
  }

  const handleRerollAction = () => {
    if (window.confirm("Trocar palavra e sortear novos impostores?")) {
      onReroll?.();
      setIndex(0);
      setRevealed(false);
    }
  };

  const handleReadyButtonOnline = () => {
    setRevealed(false);
    !data.ready && onToggleReadyOnline?.();
  };

  useEffect(() => {
    if (isOnline) {
      setRevealed(false);
    }
  }, [isOnline, data.word]);

  useEffect(() => {
    if (!isOnline && !player) {
      onNextPhase("discussion");
    }
  }, [onNextPhase, player, isOnline]);

  if (!player) return null;

  return (
    <div className={styles.container}>
      <button className={styles.exitBtn} onClick={onExit}>
        <strong className={styles.exitAndRerolEmoji}>⬅️</strong> SAIR
      </button>

      {canReroll && (
        <button className={styles.rerollBtn} onClick={handleRerollAction}>
          TROCAR <strong className={styles.exitAndRerolEmoji}> 🔄</strong>
        </button>
      )}

      <div className={styles.revealCard}>
        {!revealed ? (
          <>
            <p className={styles.instruction}>
              {isOnline ? "CONFIRME SUA IDENTIDADE" : "PASSE O CELULAR PARA"}
            </p>

            <PlayerAvatar
              emoji={player.emoji}
              color={player.color}
              size={100}
              hideScan={false}
            />

            <h1 className={styles.playerName}>{player.name}</h1>

            <button
              className={`${styles.actionBtn} ${styles.revealBtn}`}
              onClick={() => {
                setRevealed(true);
              }}
            >
              REVELAR
            </button>
          </>
        ) : (
          <>
            <div className={styles.infoWrapper}>
              {player.isImpostor ? (
                <>
                  <p className={styles.instruction}>VOCÊ É O</p>
                  <div className={styles.wordDisplayImpostor}>
                    <h1
                      className={`${styles.secretWord} ${styles.impostorGlow}`}
                    >
                      IMPOSTOR
                    </h1>
                  </div>
                  {player.hint && (
                    <div className={styles.hintBox}>
                      <p>DICA: {player.hint}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className={styles.instruction}>SUA PALAVRA É</p>
                  <div className={styles.wordDisplay}>
                    <h1 className={`${styles.secretWord} ${styles.techGlow}`}>
                      {player.word}
                    </h1>
                  </div>
                </>
              )}
            </div>

            {(data.whoStart === player.name ||
              (isOnline && data.whoStart === "VOCÊ")) && (
              <div className={styles.starterAlert}>
                ⚠️ VOCÊ INICIA A PARTIDA!
              </div>
            )}

            {/* ===================== */}
            {/* BOTÃO PRINCIPAL */}
            {/* ===================== */}
            <button
              className={`${styles.actionBtn} ${styles.nextBtn}`}
              onClick={isOnline ? handleReadyButtonOnline : handleNext}
            >
              {isOnline
                ? data.ready
                  ? "OCULTAR"
                  : "ESTOU PRONTO ✅"
                : "OCULTAR E PASSAR"}
            </button>
          </>
        )}
      </div>

      {isOnline && (
        <div className={styles.readyList}>
          <h3>STATUS DE PRONTOS</h3>
          {data.allPlayers?.map((p: any) => (
            <div key={p.socketId} className={styles.readyRow}>
              <span>{p.name}</span>
              <span className={p.ready ? styles.ready : styles.notReady}>
                {p.ready ? "PRONTO" : "NÃO PRONTO"}
              </span>
            </div>
          ))}
        </div>
      )}

      {isOnline && data.isHost && allReady && (
        <button
          className={`${styles.startBtn}`}
          onClick={() => onNextPhase("discussion")}
        >
          INICIAR DISCUSSÃO
        </button>
      )}
    </div>
  );
}
