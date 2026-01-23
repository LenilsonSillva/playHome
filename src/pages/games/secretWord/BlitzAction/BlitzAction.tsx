import { useState, useEffect, useCallback } from "react";
import styles from "./blitzAction.module.css";
import { usePlayers } from "../../../../contexts/contextHook";
import type { SecretWordGameState } from "../GameLogistic/types";
import { getNewWord } from "../GameLogistic/gameLogistic";
import successSfx from "../../../../assets/sounds/success.wav";
import skipSfx from "../../../../assets/sounds/skip.mp3";
import alertSfx from "../../../../assets/sounds/alert.wav";
import endSfx from "../../../../assets/sounds/end.wav";
import silentWav from "../../../../assets/sounds/silent.wav";
import { WordRevealBox } from "../components/WordRevealBox";
import { useIOSAudioUnlock } from "../../../../hooks/useIOSAudioUnlock";

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

  // CRONÔMETRO BLINDADO: Único efeito que controla tempo e sons de alerta
  useEffect(() => {
    if (!hasStarted) return;

    const timerId = setInterval(() => {
      setSeconds((prev) => {
        const nextValue = prev - 1;

        if (nextValue === 10) playSound("alert");
        if (nextValue === 0) {
          playSound("end");
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
  const handlePointerDown = useCallback(() => {
    initAudio(); // 🔥 desbloqueia áudio no iOS

    if (!hasStarted) setHasStarted(true);
    if (!hasViewedWord) setHasViewedWord(true);
    if (!isRevealing) setIsRevealing(true);
  }, [hasStarted, hasViewedWord, isRevealing, initAudio]);

  const handlePointerUp = useCallback(() => {
    setIsRevealing(false);
  }, []);

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

      <WordRevealBox
        word={data.currentWord}
        hasStarted={hasStarted}
        isRevealing={isRevealing}
        feedback={feedback}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      />

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
