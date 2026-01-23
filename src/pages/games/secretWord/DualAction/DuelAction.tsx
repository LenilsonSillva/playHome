import { useState, useEffect, useCallback } from "react";
import type { SecretWordGameState } from "../GameLogistic/types";
import styles from "./duelAction.module.css";
import { usePlayers } from "../../../../contexts/contextHook";
import successSfx from "../../../../assets/sounds/success.wav";
import skipSfx from "../../../../assets/sounds/skip.mp3";
import alertSfx from "../../../../assets/sounds/alert.wav";
import endSfx from "../../../../assets/sounds/end.wav";
import silentWav from "../../../../assets/sounds/silent.wav";
import { WordRevealBox } from "../components/WordRevealBox";
import { useIOSAudioUnlock } from "../../../../hooks/useIOSAudioUnlock";

type Props = {
  data: SecretWordGameState;
  onFinishMatch: (winnerTeamIdx: number, usedWords: string[]) => void;
  onReroll: () => void; // Adicionada prop de troca
};

export function DuelAction({ data, onFinishMatch, onReroll }: Props) {
  const { players } = usePlayers();
  const [seconds, setSeconds] = useState(data.roundTime);
  const [isRevealing, setIsRevealing] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [localTeamIdx, setLocalTeamIdx] = useState(data.currentTeamIdx);
  const [feedback, setFeedback] = useState<"none" | "success" | "skip">("none");
  const [hasViewedWord, setHasViewedWord] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const currentTeam = data.teams[localTeamIdx];
  const currentOperator = players.find((p) => p.id === currentTeam.operatorId);
  const { initAudio, playSound } = useIOSAudioUnlock(
    {
      success: successSfx,
      skip: skipSfx,
      alert: alertSfx,
      end: endSfx,
    },
    silentWav,
  );

  const triggerFeedback = useCallback(
    (type: "success" | "skip") => {
      setFeedback(type);

      if (type === "success") {
        playSound("success");
        if ("vibrate" in navigator) navigator.vibrate(200);
      } else {
        playSound("skip");
        if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      }

      setTimeout(() => setFeedback("none"), 300);
    },
    [playSound],
  );

  // Lógica de passar o turno
  const nextTurn = useCallback(() => {
    if (isProcessing) return;
    setIsProcessing(true);

    triggerFeedback("skip");
    setLocalTeamIdx((prev) => (prev + 1) % data.teams.length);
    setSeconds(data.roundTime);
    setTimerActive(false);
    setIsRevealing(false); // Reset visualização para o próximo time

    setTimeout(() => setIsProcessing(false), 200);
  }, [data.teams.length, data.roundTime, triggerFeedback, isProcessing]);

  // Efeito do Cronômetro
  useEffect(() => {
    if (!timerActive || seconds < 0) return;

    if (seconds === 3) playSound("alert");

    if (seconds === 0) {
      playSound("end");
      nextTurn();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, seconds, nextTurn]);

  const handleWin = () => {
    if (isProcessing || !hasViewedWord) return;
    setIsProcessing(true);
    triggerFeedback("success");
    // Pequeno delay para o jogador ver o feedback verde antes de mudar de tela/palavra
    setTimeout(() => {
      onFinishMatch(localTeamIdx, [data.currentWord!]);
    }, 400);
  };

  const handlePointerDown = useCallback(() => {
    initAudio(); // 🔥 desbloqueia áudio no iOS

    if (!hasViewedWord) setHasViewedWord(true);
    if (!isRevealing) setIsRevealing(true);
  }, [hasViewedWord, isRevealing, initAudio]);

  const handlePointerUp = useCallback(() => {
    setIsRevealing(false);
  }, []);

  const allowRerollBtn = () => {
    setHasViewedWord(false);
    return onReroll();
  };

  return (
    <div className={styles.container}>
      <div className={styles.progressIndicator}>
        PALAVRA {data.currentMatchIdx + 1} DE {data.matchLimit}
      </div>

      <div className={styles.header}>
        <div className={styles.turnIndicator}>
          <p className={styles.operatorName}>
            OPERADOR:{" "}
            <strong style={{ color: "white", fontSize: "1.7rem" }}>
              {currentOperator?.name}
            </strong>
          </p>
          <h2
            className={styles.teamName}
            style={{ backgroundColor: currentTeam.color }}
          >
            {currentTeam.name}
          </h2>
        </div>
        <div
          className={`${styles.timer} ${seconds <= 5 && timerActive ? styles.critical : ""} ${!timerActive ? styles.paused : ""}`}
        >
          {seconds}s
        </div>
      </div>

      {/* ÁREA DE CONSULTA (SEGURAR PARA VER) */}

      <WordRevealBox
        word={data.currentWord}
        feedback={feedback}
        isRevealing={isRevealing}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        hasStarted={hasViewedWord}
      />

      {/* CONTROLES DE FLUXO */}
      <div className={styles.actionsWrapper}>
        {!timerActive ? (
          <div className={styles.setupActions}>
            <button
              className={styles.startTimerBtn}
              onClick={() => setTimerActive(true)}
              disabled={!hasViewedWord}
            >
              DICA DADA! INICIAR RESPOSTA ⏱️
            </button>
            {/* NOVO BOTÃO DE TROCAR PALAVRA */}
            <button className={styles.rerollBtn} onClick={allowRerollBtn}>
              🔄 TROCAR PALAVRA
            </button>
          </div>
        ) : (
          <div className={styles.gameActions}>
            <button className={styles.failBtn} onClick={nextTurn}>
              ERROU / PASSAR ⏭️
            </button>
            <button
              className={styles.winBtn}
              onClick={handleWin}
              disabled={!hasViewedWord || isProcessing}
            >
              ACERTOU! 🏆
            </button>
          </div>
        )}
      </div>

      {/* STATUS DOS TIMES NO RODAPÉ */}
      <div className={styles.teamsStatus}>
        {data.teams.map((t, idx) => (
          <div
            key={t.id}
            className={`${styles.teamDot} ${idx === localTeamIdx ? styles.activeDot : ""}`}
            style={{ backgroundColor: t.color } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
