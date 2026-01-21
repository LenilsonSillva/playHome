import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index-secret.module.css";
import type { SecretTeam, SecretWordGameState } from "./GameLogistic/types";
import { SecretTeamReveal } from "./SecretTeamReveal/SecretTeamReveal";
import { getNewWord } from "./GameLogistic/gameLogistic";
import { BlitzAction } from "./BlitzAction/BlitzAction";
import { DuelAction } from "./DualAction/DuelAction";
import { ResultPhase } from "./ResultPhase/ResultPhase";

export function SecretWordGame() {
  const location = useLocation();
  const navigate = useNavigate();

  // Inicializa o estado. Se não houver dados no location, o useEffect redirecionará.
  const [gameState, setGameState] = useState<SecretWordGameState | null>(
    location.state?.data || null,
  );

  // Redireciona se não houver dados (proteção contra F5)
  useEffect(() => {
    if (!gameState) {
      navigate("/games/secretWord/lobby");
    }
  }, [gameState, navigate]);

  // FUNÇÃO: Atualiza os times (usada na tela de seleção de operadores)
  const updateTeams = (updatedTeams: SecretTeam[]) => {
    setGameState((prev) => (prev ? { ...prev, teams: updatedTeams } : null));
  };

  // NOVA RODADA AO FIM DA ANTERIOR

  const handleNextRound = () => {
    setGameState((prev) => {
      if (!prev) return null;

      // 1. Sorteia a primeira palavra da nova rodada
      const firstWord = getNewWord(prev.selectedCategories, prev.usedWords);

      // 2. Reseta os índices para começar do Time 1
      return {
        ...prev,
        currentTeamIdx: 0,
        currentMatchIdx: 0, // Reseta contador do Duelo
        currentWord: firstWord,
        phase: "team-reveal", // Volta para a revelação para eles se organizarem
        teams: prev.teams.map((t) => ({ ...t, roundScore: 0 })),
      };
    });
  };

  // FUNÇÃO: Finaliza o turno de um time
  const handleFinishRound = (teamScore: number, wordsUsedInRound: string[]) => {
    setGameState((prev) => {
      if (!prev) return null;

      // 1. Atualiza o score do time que acabou de jogar
      const updatedTeams = prev.teams.map((team, idx) => {
        if (idx === prev.currentTeamIdx) {
          return {
            ...team,
            score: team.score + teamScore,
            roundScore: (team.roundScore || 0) + teamScore,
            wordsGuessed: [...(team.wordsGuessed || []), ...wordsUsedInRound],
          };
        }
        return team;
      });

      // 2. Adiciona as palavras usadas ao histórico global para não repetirem
      const newUsedWords = [...prev.usedWords, ...wordsUsedInRound];

      // 3. Verifica se todos os times já jogaram esta rodada
      const nextTeamIdx = prev.currentTeamIdx + 1;
      const isLastTeam = nextTeamIdx >= prev.teams.length;

      if (isLastTeam) {
        // Se todos jogaram, vai para o pódio
        return {
          ...prev,
          teams: updatedTeams,
          usedWords: newUsedWords,
          phase: "result",
        };
      } else {
        // Se ainda faltam times, sorteia nova palavra para o PRÓXIMO time e continua na ação
        const nextWord = getNewWord(prev.selectedCategories, newUsedWords);
        return {
          ...prev,
          teams: updatedTeams,
          usedWords: newUsedWords,
          currentTeamIdx: nextTeamIdx,
          currentWord: nextWord,
          phase: "action", // Mantém na ação, o componente BlitzAction resetará os estados internos
        };
      }
    });
  };

  // FUNÇÃO: Auxiliar para atualizar campos específicos do game de forma segura
  const updateGameState = (newData: Partial<SecretWordGameState>) => {
    setGameState((prev) => (prev ? { ...prev, ...newData } : null));
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
              // Ao confirmar times, sorteia a primeira palavra e vai direto para o jogo
              const firstWord = getNewWord(
                gameState.selectedCategories,
                gameState.usedWords,
              );
              updateGameState({
                currentWord: firstWord,
                phase: "action",
              });
            }}
            onEdit={() => navigate("/games/secretWord/lobby")}
          />
        );

      // Dentro do switch do renderPhase:
      case "action":
        if (gameState.mode === "blitz") {
          return (
            <BlitzAction
              key={gameState.currentTeamIdx}
              data={gameState}
              onFinishRound={handleFinishRound}
              onUpdateGameState={updateGameState}
            />
          );
        } else {
          return (
            <DuelAction
              // A KEY é essencial aqui! Quando mudamos a rodada (currentMatchIdx),
              // o componente reseta o cronômetro e o estado interno.
              key={`duel-round-${gameState.currentMatchIdx}`}
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

                  // 1. Soma ponto ao time vencedor
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
                    // 2. Sorteia próxima palavra para a próxima rodada do duelo
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
                      currentTeamIdx: winnerIdx, // AQUI: Define que o vencedor começa a próxima
                      // Mantém na fase 'action', a KEY acima cuidará do reset visual
                    };
                  }
                });
              }}
            />
          );
        }

      case "result":
        return <ResultPhase data={gameState} onNextRound={handleNextRound} />;

      default:
        return <div>Iniciando sistemas...</div>;
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.ambientLight} />
      <div className={styles.contentWrapper}>{renderPhase()}</div>
    </div>
  );
}
