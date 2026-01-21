import { useState, useEffect, useCallback, useRef } from "react";
import type { SecretWordGameState } from "../GameLogistic/types";
import styles from "./duelAction.module.css";
import { usePlayers } from "../../../../contexts/contextHook";

const SOUNDS = {
  success: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  fail: "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
  alert: "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3",
  end: "https://assets.mixkit.co/active_storage/sfx/941/941-preview.mp3",
};

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
  const [feedback, setFeedback] = useState<"none" | "success" | "fail">("none");

  // Refs para Áudio (evita recriação do objeto a cada render)
  const audioSuccess = useRef(new Audio(SOUNDS.success));
  const audioFail = useRef(new Audio(SOUNDS.fail));
  const audioAlert = useRef(new Audio(SOUNDS.alert));
  const audioEnd = useRef(new Audio(SOUNDS.end));

  const currentTeam = data.teams[localTeamIdx];
  const currentOperator = players.find((p) => p.id === currentTeam.operatorId);

  // Função centralizadora de Feedback Sensorial
  const triggerFeedback = useCallback((type: "success" | "fail") => {
    setFeedback(type);
    if (type === "success") {
      audioSuccess.current.play().catch(() => {});
      if ("vibrate" in navigator) navigator.vibrate(200);
    } else {
      audioFail.current.play().catch(() => {});
      if ("vibrate" in navigator) navigator.vibrate([100, 50]);
    }
    setTimeout(() => setFeedback("none"), 300);
  }, []);

  // Lógica de passar o turno
  const nextTurn = useCallback(() => {
    triggerFeedback("fail");
    setLocalTeamIdx((prev) => (prev + 1) % data.teams.length);
    setSeconds(data.roundTime);
    setTimerActive(false);
    setIsRevealing(false);
  }, [data.teams.length, data.roundTime, triggerFeedback]);

  // Efeito do Cronômetro
  useEffect(() => {
    if (!timerActive || seconds < 0) return;

    if (seconds === 3) audioAlert.current.play().catch(() => {});

    if (seconds === 0) {
      audioEnd.current.play().catch(() => {});
      nextTurn();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, seconds, nextTurn]);

  const handleWin = () => {
    triggerFeedback("success");
    // Pequeno delay para o jogador ver o feedback verde antes de mudar de tela/palavra
    setTimeout(() => {
      onFinishMatch(localTeamIdx, [data.currentWord!]);
    }, 400);
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
      <div
        className={`
          ${styles.wordDisplay} 
          ${isRevealing ? styles.active : ""} 
          ${feedback === "success" ? styles.successFlash : ""} 
          ${feedback === "fail" ? styles.failFlash : ""}
        `}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={() => setIsRevealing(true)}
        onPointerUp={() => setIsRevealing(false)}
        onPointerLeave={() => setIsRevealing(false)}
      >
        {!isRevealing ? (
          <div className={styles.hiddenContent}>
            <div className={styles.pressIcon}>{timerActive ? "👆" : "📡"}</div>
            <p>SEGURE PARA VER A PALAVRA</p>
          </div>
        ) : (
          <div className={styles.revealedContent}>
            <span className={styles.label}>TRANSMISSÃO PRIVADA:</span>
            <h1 className={styles.word}>{data.currentWord}</h1>
          </div>
        )}
      </div>

      {/* CONTROLES DE FLUXO */}
      <div className={styles.actionsWrapper}>
        {!timerActive ? (
          <div className={styles.setupActions}>
            <button
              className={styles.startTimerBtn}
              onClick={() => setTimerActive(true)}
            >
              DICA DADA! INICIAR RESPOSTA ⏱️
            </button>
            {/* NOVO BOTÃO DE TROCAR PALAVRA */}
            <button className={styles.rerollBtn} onClick={onReroll}>
              🔄 TROCAR PALAVRA
            </button>
          </div>
        ) : (
          <div className={styles.gameActions}>
            <button className={styles.failBtn} onClick={nextTurn}>
              ERROU / PASSAR ⏭️
            </button>
            <button className={styles.winBtn} onClick={handleWin}>
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
