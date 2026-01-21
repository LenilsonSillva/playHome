import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./blitzAction.module.css";
import { usePlayers } from "../../../../contexts/contextHook";
import type { SecretWordGameState } from "../GameLogistic/types";
import { getNewWord } from "../GameLogistic/gameLogistic";

// URLs de sons (Substitua pelos seus arquivos locais se preferir)
const SOUNDS = {
  success: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  skip: "https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3",
  alert: "https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3",
  end: "https://assets.mixkit.co/active_storage/sfx/941/941-preview.mp3",
};

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
  const [wordsUsedInRound, setWordsUsedInRound] = useState<string[]>([
    data.currentWord!,
  ]);

  // Estado para controlar o flash visual (verde ou amarelo)
  const [feedback, setFeedback] = useState<"none" | "success" | "skip">("none");

  const currentTeam = data.teams[data.currentTeamIdx];
  const operator = players.find((p) => p.id === currentTeam.operatorId);

  // Refs de áudio para carregar apenas uma vez
  const audioSuccess = useRef(new Audio(SOUNDS.success));
  const audioSkip = useRef(new Audio(SOUNDS.skip));
  const audioAlert = useRef(new Audio(SOUNDS.alert));
  const audioEnd = useRef(new Audio(SOUNDS.end));

  // Função para Feedback Sensorial
  const triggerFeedback = (type: "success" | "skip") => {
    setFeedback(type);

    if (type === "success") {
      audioSuccess.current.play();
      if ("vibrate" in navigator) navigator.vibrate(200); // Vibração curta
    } else {
      audioSkip.current.play();
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]); // Vibração dupla
    }

    // Remove o flash visual após 300ms
    setTimeout(() => setFeedback("none"), 300);
  };

  // Efeito do Cronômetro e Sons de Alerta
  useEffect(() => {
    if (!hasStarted || seconds < 0) return;

    if (seconds === 10) audioAlert.current.play();
    if (seconds === 0) audioEnd.current.play();

    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [hasStarted, seconds]);

  const handleNextWord = useCallback(
    (success: boolean) => {
      if (success) {
        setCurrentScore((prev) => prev + 1);
        triggerFeedback("success");
      }

      const nextWord = getNewWord(data.selectedCategories, [
        ...data.usedWords,
        ...wordsUsedInRound,
      ]);
      setWordsUsedInRound((prev) => [...prev, nextWord]);
      onUpdateGameState({ currentWord: nextWord });
      setIsRevealing(false);
    },
    [data, wordsUsedInRound, onUpdateGameState],
  );

  const handleSkip = () => {
    if (skipsLeft > 0) {
      setSkipsLeft((prev) => prev - 1);
      triggerFeedback("skip");
      handleNextWord(false);
    }
  };

  // Finalização da Rodada
  useEffect(() => {
    if (seconds === 0 && hasStarted) {
      setTimeout(() => onFinishRound(currentScore, wordsUsedInRound), 1000);
    }
  }, [seconds, hasStarted]);

  return (
    <div className={styles.container}>
      {/* ... Header e Timer (Igual anterior) ... */}
      <div className={styles.gameHeader}>
        <div className={styles.teamInfo}>
          <h2 className={styles.operatorName}>
            OPERADOR:{" "}
            <strong style={{ color: "white", fontSize: "1.5rem" }}>
              {operator?.name}
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

      {/* ÁREA DA PALAVRA COM CLASSES DE FEEDBACK */}
      <div
        className={`
          ${styles.wordDisplay} 
          ${isRevealing ? styles.active : ""} 
          ${!hasStarted ? styles.waiting : ""}
          ${feedback === "success" ? styles.successFlash : ""}
          ${feedback === "skip" ? styles.skipFlash : ""}
        `}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={() => {
          if (!hasStarted) setHasStarted(true);
          setIsRevealing(true);
        }}
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

      {/* ... Stats e Ações (Igual anterior) ... */}
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
          disabled={skipsLeft === 0 || !hasStarted}
        >
          PULAR
        </button>
        <button
          className={styles.correctBtn}
          onClick={() => handleNextWord(true)}
          disabled={!hasStarted}
        >
          ACERTOU! 🚀
        </button>
      </div>
    </div>
  );
}
