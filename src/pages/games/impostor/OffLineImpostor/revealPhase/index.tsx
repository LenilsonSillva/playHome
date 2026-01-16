import { useEffect, useState } from "react";
import styles from "./revelPhase.module.css";
import type {
  GameRouteState,
  ImpostorGameState,
} from "../../GameLogistic/types";
import { PlayerAvatar } from "../PlayerAvatar/PlayerAvatar";

type DiscussPhaseProps = {
  data: GameRouteState["data"];
  onNextPhase: (phase: ImpostorGameState["phase"]) => void;
  onExit: () => void;
};

export function RevealPhase({ data, onNextPhase, onExit }: DiscussPhaseProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const player = data.players[index];

  function nextPlayer() {
    setRevealed(false);
    setIndex((prev) => prev + 1);
  }

  useEffect(() => {
    if (!player) {
      onNextPhase("discussion");
    }
  }, [onNextPhase, player]);

  if (!player) return null;

  return (
    <div className={styles.container}>
      {/* Botão de Sair discreto no topo esquerdo */}
      <button
        className={styles.exitBtn}
        onClick={onExit}
        title="Voltar ao Início"
      >
        ← SAIR
      </button>

      <div className={styles.revealCard}>
        {!revealed ? (
          <>
            <p className={styles.instruction}>PASSE O CELULAR PARA</p>
            <PlayerAvatar
              emoji={player.emoji}
              color={player.color}
              size={100}
              hideScan={false}
            />
            <h1 className={styles.playerName}>{player.name}</h1>
            <button
              className={`${styles.actionBtn} ${styles.revealBtn}`}
              onClick={() => setRevealed(true)}
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

            {data.whoStart === player.name && (
              <div className={styles.starterAlert}>
                ⚠️ VOCÊ INICIA A PARTIDA!
              </div>
            )}

            <button
              className={`${styles.actionBtn} ${styles.nextBtn}`}
              onClick={nextPlayer}
            >
              OCULTAR E PASSAR
            </button>
          </>
        )}
      </div>
    </div>
  );
}
