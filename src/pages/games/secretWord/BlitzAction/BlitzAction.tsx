import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./blitzAction.module.css";
import { usePlayers } from "../../../../contexts/contextHook";
import type { SecretWordGameState } from "../GameLogistic/types";
import { getNewWord } from "../GameLogistic/gameLogistic";
import successSfx from "../../../../assets/sounds/success.wav";
import skipSfx from "../../../../assets/sounds/skip.mp3";
import alertSfx from "../../../../assets/sounds/alert.wav";
import endSfx from "../../../../assets/sounds/end.wav";

type Props = {
  data: SecretWordGameState;
  onFinishRound: (teamScore: number, wordsUsedInRound: string[]) => void;
  onUpdateGameState: (data: Partial<SecretWordGameState>) => void;
};

export function BlitzAction({ data, onFinishRound, onUpdateGameState }: Props) {
  const { players } = usePlayers();
  const [seconds, setSeconds] = useState(data.roundTime);
  const [isRevealing, setIsRevealing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [skipsLeft, setSkipsLeft] = useState(3);
  const [hasViewedWord, setHasViewedWord] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [wordsUsedInRound, setWordsUsedInRound] = useState<string[]>([
    data.currentWord!,
  ]);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<"none" | "success" | "skip">("none");

  const currentTeam = data.teams[data.currentTeamIdx];
  const operator = players.find((p) => p.id === currentTeam.operatorId);

  const audioSuccess = useRef(new Audio(successSfx));
  const audioSkip = useRef(new Audio(skipSfx));
  const audioAlert = useRef(new Audio(alertSfx));
  const audioEnd = useRef(new Audio(endSfx));

  const playSound = useCallback(
    (audioRef: React.RefObject<HTMLAudioElement>) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reinicia o áudio se ele já estiver tocando
        audioRef.current.play().catch(() => {}); // Evita erro de interação do navegador
      }
      setTimeout(() => setFeedback("none"), 300);
    },
    [],
  );

  const triggerFeedback = useCallback(
    (type: "success" | "skip") => {
      setFeedback(type);
      if (type === "success") {
        playSound(audioSuccess);
        if ("vibrate" in navigator) navigator.vibrate(200);
      } else {
        playSound(audioSkip);
        if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
      }
      setTimeout(() => setFeedback("none"), 300);
    },
    [playSound],
  );

  // CRONÔMETRO BLINDADO: Único efeito que controla tempo e sons de alerta
  useEffect(() => {
    if (!hasStarted) return;

    const timerId = setInterval(() => {
      setSeconds((prev) => {
        const nextValue = prev - 1;

        // Dispara os sons baseando-se no novo valor de forma isolada
        if (nextValue === 10) playSound(audioAlert);
        if (nextValue === 0) {
          playSound(audioEnd);
          clearInterval(timerId);
        }

        return nextValue > 0 ? nextValue : 0;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [hasStarted, playSound]); // Só reinicia se o jogo começar. O clique no box não afeta mais este efeito.

  const handleNextWord = useCallback(
    (success: boolean) => {
      if (isProcessing) return;
      setIsProcessing(true);

      if (success) {
        setCorrectWords((prev) => [...prev, data.currentWord!]);
        setCurrentScore((prev) => prev + 1);
        triggerFeedback("success");
      }

      const nextWord = getNewWord(data.selectedCategories, [
        ...data.usedWords,
        ...wordsUsedInRound,
      ]);

      setWordsUsedInRound((prev) => [...prev, nextWord]);
      onUpdateGameState({ currentWord: nextWord });
      setHasViewedWord(false);
      setIsRevealing(false);

      // Delay curto para evitar spam de cliques
      setTimeout(() => setIsProcessing(false), 200);
    },
    [data, wordsUsedInRound, onUpdateGameState, triggerFeedback, isProcessing],
  );

  const handleSkip = () => {
    if (skipsLeft > 0 && !isProcessing) {
      setSkipsLeft((prev) => prev - 1);
      handleNextWord(false);
      triggerFeedback("skip");
    }
  };

  // Finalização da Rodada
  useEffect(() => {
    if (seconds === 0 && hasStarted) {
      const timer = setTimeout(() => {
        onFinishRound(currentScore, correctWords);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [seconds, hasStarted, currentScore, correctWords, onFinishRound]);

  // Função de toque otimizada para evitar re-renders repetitivos
  const handlePointerDown = () => {
    if (!hasStarted) setHasStarted(true);
    if (!hasViewedWord) setHasViewedWord(true);
    if (!isRevealing) setIsRevealing(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.gameHeader}>
        <div className={styles.teamInfo}>
          <h2 className={styles.operatorName}>
            OPERADOR:{" "}
            <strong style={{ color: "white", fontSize: "1.5rem" }}>
              {operator?.name || "---"}
            </strong>
          </h2>
          <span
            className={styles.badge}
            style={{ backgroundColor: currentTeam.color }}
          >
            {currentTeam.name}
          </span>
        </div>

        <div
          className={`${styles.timer} ${seconds <= 10 ? styles.critical : ""} ${!hasStarted ? styles.paused : ""}`}
        >
          {seconds}s
        </div>
      </div>

      <div
        className={`
          ${styles.wordDisplay} 
          ${isRevealing ? styles.active : ""} 
          ${!hasStarted ? styles.waiting : ""}
          ${feedback === "success" ? styles.successFlash : ""}
          ${feedback === "skip" ? styles.skipFlash : ""}
        `}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerUp={() => setIsRevealing(false)}
        onPointerLeave={() => setIsRevealing(false)}
      >
        {!isRevealing ? (
          <div className={styles.hiddenContent}>
            <div className={styles.pressIcon}>{hasStarted ? "👆" : "📡"}</div>
            <p>
              {hasStarted ? "PRESSIONE PARA VER" : "PRESSIONE PARA INICIAR"}
            </p>
          </div>
        ) : (
          <div className={styles.revealedContent}>
            <span className={styles.label}>TRANSMISSÃO ATIVA:</span>
            <h1 className={styles.word}>{data.currentWord}</h1>
          </div>
        )}
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <label>ACERTOS</label>
          <span>{currentScore}</span>
        </div>
        <div className={styles.statBox}>
          <label>PULOS RESTANTES</label>
          <span>{skipsLeft} / 3</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.skipBtn}
          onClick={handleSkip}
          disabled={skipsLeft === 0 || !hasStarted || isProcessing}
        >
          PULAR
        </button>
        <button
          className={styles.correctBtn}
          onClick={() => handleNextWord(true)}
          disabled={!hasStarted || !hasViewedWord || isProcessing}
        >
          ACERTOU! 🚀
        </button>
      </div>
    </div>
  );
}
