import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index-secret.module.css";
import type { SecretTeam, SecretWordGameState } from "./GameLogistic/types";
import { SecretTeamReveal } from "./SecretTeamReveal/SecretTeamReveal";
import { getNewWord } from "./GameLogistic/gameLogistic";
import { BlitzAction } from "./BlitzAction/BlitzAction";
import { ResultPhase } from "./ResultPhase/ResultPhase";
import { DuelAction } from "./DualAction/DuelAction";
import resultSd from "./../../../assets/sounds/win.mp3";

export function SecretWordGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const resultSound = useRef(new Audio(resultSd));

  const playSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reinicia o áudio se ele já estiver tocando
      audioRef.current.play().catch(() => {}); // Evita erro de interação do navegador
    }
  };

  const [gameState, setGameState] = useState<SecretWordGameState | null>(
    location.state?.data || null,
  );

  useEffect(() => {
    if (!gameState) {
      navigate("/games/secretWord/lobby");
    }
  }, [gameState, navigate]);

  const updateTeams = (updatedTeams: SecretTeam[]) => {
    setGameState((prev) => (prev ? { ...prev, teams: updatedTeams } : null));
  };

  const updateGameState = (newData: Partial<SecretWordGameState>) => {
    setGameState((prev) => (prev ? { ...prev, ...newData } : null));
  };

  // --- LOGICA: PRÓXIMA RODADA (Botão no ResultPhase) ---
  const handleNextRound = () => {
    setGameState((prev) => {
      if (!prev) return null;

      const firstWord = getNewWord(prev.selectedCategories, prev.usedWords);

      return {
        ...prev,
        currentTeamIdx: 0,
        currentMatchIdx: 0,
        currentWord: firstWord,
        phase: "team-reveal",
        // Reseta o roundScore (ganho da rodada) mas mantém o score total e wordsGuessed
        teams: prev.teams.map((t) => ({ ...t, roundScore: 0 })),
      };
    });
  };

  // --- LOGICA: FINALIZAR TURNO BLITZ ---
  const handleFinishRound = (teamScore: number, correctlyGuessed: string[]) => {
    setGameState((prev) => {
      if (!prev) return null;

      // 1. Atualiza o time que acabou de jogar
      const updatedTeams = prev.teams.map((team, idx) => {
        if (idx === prev.currentTeamIdx) {
          return {
            ...team,
            score: team.score + teamScore,
            roundScore: teamScore, // O quanto ele fez agora
            // Salva apenas as palavras que ele acertou de fato
            wordsGuessed: [...(team.wordsGuessed || []), ...correctlyGuessed],
          };
        }
        return team;
      });

      // 2. Alimenta o banco de palavras usadas (para não repetir nunca na sessão)
      const newUsedWords = [...prev.usedWords, ...correctlyGuessed];

      const nextTeamIdx = prev.currentTeamIdx + 1;
      const isLastTeam = nextTeamIdx >= prev.teams.length;

      if (isLastTeam) {
        return {
          ...prev,
          teams: updatedTeams,
          usedWords: newUsedWords,
          phase: "result",
        };
      } else {
        // Sorteia palavra para o próximo time
        const nextWord = getNewWord(prev.selectedCategories, newUsedWords);
        return {
          ...prev,
          teams: updatedTeams,
          usedWords: newUsedWords,
          currentTeamIdx: nextTeamIdx,
          currentWord: nextWord,
          phase: "action",
        };
      }
    });
  };

  const renderPhase = () => {
    if (!gameState) return null;

    switch (gameState.phase) {
      case "team-reveal":
        return (
          <SecretTeamReveal
            data={gameState}
            onUpdateTeams={updateTeams}
            onConfirm={() => {
              const firstWord = getNewWord(
                gameState.selectedCategories,
                gameState.usedWords,
              );
              updateGameState({ currentWord: firstWord, phase: "action" });
            }}
            onEdit={() => navigate("/games/secretWord/lobby")}
          />
        );

      case "action":
        if (gameState.mode === "blitz") {
          return (
            <BlitzAction
              key={`blitz-${gameState.currentTeamIdx}`} // Reseta ao mudar de time
              data={gameState}
              onFinishRound={handleFinishRound}
              onUpdateGameState={updateGameState}
            />
          );
        } else {
          return (
            <DuelAction
              key={`duel-round-${gameState.currentMatchIdx}`} // Reseta ao mudar de palavra
              data={gameState}
              onReroll={() => {
                const nextWord = getNewWord(
                  gameState.selectedCategories,
                  gameState.usedWords,
                );
                updateGameState({ currentWord: nextWord });
              }}
              onFinishMatch={(winnerIdx, wordsUsed) => {
                setGameState((prev) => {
                  if (!prev) return null;

                  // Atualiza o time vencedor do duelo
                  const updatedTeams = prev.teams.map((t, idx) =>
                    idx === winnerIdx
                      ? {
                          ...t,
                          score: t.score + 1,
                          roundScore: (t.roundScore || 0) + 1,
                          wordsGuessed: [
                            ...(t.wordsGuessed || []),
                            ...wordsUsed,
                          ],
                        }
                      : t,
                  );

                  const nextMatchIdx = prev.currentMatchIdx + 1;
                  const isGameOver = nextMatchIdx >= prev.matchLimit;

                  if (isGameOver) {
                    return { ...prev, teams: updatedTeams, phase: "result" };
                  } else {
                    const nextWord = getNewWord(prev.selectedCategories, [
                      ...prev.usedWords,
                      ...wordsUsed,
                    ]);
                    return {
                      ...prev,
                      teams: updatedTeams,
                      usedWords: [...prev.usedWords, ...wordsUsed],
                      currentMatchIdx: nextMatchIdx,
                      currentWord: nextWord,
                      currentTeamIdx: winnerIdx, // Vencedor começa a próxima
                    };
                  }
                });
              }}
            />
          );
        }

      case "result":
        playSound(resultSound);
        return <ResultPhase data={gameState} onNextRound={handleNextRound} />;

      default:
        return <div>Carregando sistemas...</div>;
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.ambientLight} />
      <div className={styles.contentWrapper}>{renderPhase()}</div>
    </div>
  );
}
