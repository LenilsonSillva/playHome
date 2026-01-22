import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./blitzAction.module.css";
import { usePlayers } from "../../../../contexts/contextHook";
import type { SecretWordGameState } from "../GameLogistic/types";
import { getNewWord } from "../GameLogistic/gameLogistic";
import successSfx from "../../../../assets/sounds/success.wav";
import skipSfx from "../../../../assets/sounds/skip.ogg";
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

  // wordsUsedInRound: controla as palavras que já passaram (para não repetir no sorteio interno)
  const [wordsUsedInRound, setWordsUsedInRound] = useState<string[]>([
    data.currentWord!,
  ]);

  // correctWords: armazena apenas as palavras que o time acertou de fato
  const [correctWords, setCorrectWords] = useState<string[]>([]);

  const [feedback, setFeedback] = useState<"none" | "success" | "skip">("none");

  const currentTeam = data.teams[data.currentTeamIdx];
  const operator = players.find((p) => p.id === currentTeam.operatorId);

  const audioSuccess = useRef(new Audio(successSfx));
  const audioSkip = useRef(new Audio(skipSfx));
  const audioAlert = useRef(new Audio(alertSfx));
  const audioEnd = useRef(new Audio(endSfx));

  const playSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reinicia o áudio se ele já estiver tocando
      audioRef.current.play().catch(() => {}); // Evita erro de interação do navegador
    }
  };

  const triggerFeedback = (type: "success" | "skip") => {
    setFeedback(type);
    if (type === "success") {
      playSound(audioSuccess); // Usa a função auxiliar
      if ("vibrate" in navigator) navigator.vibrate(200);
    } else {
      playSound(audioSkip);
      if ("vibrate" in navigator) navigator.vibrate([100, 50, 100]);
    }
    setTimeout(() => setFeedback("none"), 300);
  };

  useEffect(() => {
    if (!hasStarted || seconds < 0) return;
    if (seconds === 10) audioAlert.current.play().catch(() => {});
    if (seconds === 0) audioEnd.current.play().catch(() => {});

    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [hasStarted, seconds]);

  const handleNextWord = useCallback(
    (success: boolean) => {
      if (success) {
        // Salva a palavra atual na lista de acertos antes de trocar
        setCorrectWords((prev) => [...prev, data.currentWord!]);
        setCurrentScore((prev) => prev + 1);
        triggerFeedback("success");
      }

      // Sorteia a próxima considerando o histórico global + o desta rodada específica
      const nextWord = getNewWord(data.selectedCategories, [
        ...data.usedWords,
        ...wordsUsedInRound,
      ]);

      setWordsUsedInRound((prev) => [...prev, nextWord]);
      onUpdateGameState({ currentWord: nextWord });
      setIsRevealing(false);
    },
    [data, wordsUsedInRound, onUpdateGameState, triggerFeedback],
  );

  const handleSkip = () => {
    if (skipsLeft > 0) {
      setSkipsLeft((prev) => prev - 1);
      handleNextWord(false);
      triggerFeedback("skip");
    }
  };

  useEffect(() => {
    if (seconds === 0 && hasStarted) {
      // IMPORTANTE: Passamos 'correctWords' para o parâmetro 'wordsUsedInRound' do pai
      // assim o relatório final exibe apenas o que foi acertado.
      setTimeout(() => onFinishRound(currentScore, correctWords), 1000);
    }
  }, [seconds, hasStarted, currentScore, correctWords, onFinishRound]);

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
