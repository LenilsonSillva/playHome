import { useLocation, useNavigate } from "react-router-dom";
import { RevealPhase } from "./revealPhase";
import { DiscussPhase } from "./discussPhase";
import type {
  GameRouteState,
  ImpostorGameState,
  ImpostorPlayer,
} from "../GameLogistic/types";
import { VotingPhase } from "./votingPhase/VotingPhase";
import { EliminationPhase } from "./votingPhase/EliminationPhase";
import { useState, useRef } from "react";
import { ResultPhase } from "./resultPhase";
import { initializeGame } from "../GameLogistic/gameLogistic";

export function OfflineImpostorGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const Initialstate = location.state as GameRouteState;

  const [gameState, setGameState] = useState<GameRouteState>(Initialstate);

  function changePhase(phase: ImpostorGameState["phase"]) {
    setGameState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        phase,
      },
    }));
  }

  // Histórico dos impostores das rodadas anteriores
  const impostorHistoryRef = useRef<string[][]>([]);

  function handleNextRound() {
    setGameState((prevState) => {
      const {
        players,
        howManyImpostors,
        twoWordsMode,
        impostorHint,
        selectedCategories,
        whoStart,
        impostorCanStart,
      } = prevState.data;

      // 1. Cálculo da pontuação da rodada que terminou
      const roundScores: Record<string, number> = {};
      players.forEach((p) => {
        if (p.isImpostor) {
          roundScores[p.id] = p.isAlive ? 2 : -1.5;
        } else {
          roundScores[p.id] = p.isAlive ? 1 : 0;
        }
      });

      // 2. Prepara dados para inicializar a nova rodada
      const playersForNewGame = players.map((p) => ({
        id: p.id,
        name: p.name,
        score: p.score,
        globalScore: p.globalScore,
        emoji: p.emoji,
        color: p.color,
      }));

      const newGame = initializeGame(
        playersForNewGame as any,
        howManyImpostors,
        twoWordsMode,
        impostorHint,
        selectedCategories,
        Boolean(whoStart),
        impostorCanStart,
        impostorHistoryRef.current,
      );

      // 3. Atualização dos jogadores: acumulando score e mantendo globalScore fixo
      const updatedPlayers: ImpostorPlayer[] = newGame.allPlayers.map(
        (newP) => {
          const oldP = players.find((p) => p.id === newP.id);
          const pointsFromMatchJustFinished = roundScores[newP.id] ?? 0;
          const previousTotal = oldP?.score ?? 0;
          const newTotal = previousTotal + pointsFromMatchJustFinished;

          return {
            ...newP,
            score: newTotal, // Acumulado real para cálculos futuros
            globalScore: newTotal, // Atualiza para a discussão da PRÓXIMA palavra
            emoji: oldP?.emoji ?? newP.emoji,
            color: oldP?.color ?? newP.color,
          };
        },
      );

      // 4. Retorno do estado formatado exatamente conforme o tipo GameRouteState
      return {
        data: {
          players: updatedPlayers,
          howManyImpostors: newGame.howManyImpostors,
          impostorCanStart: newGame.impostorCanStart,
          impostorHint: newGame.impostorHasHint, // Mapeamento correto do nome
          selectedCategories: newGame.selectedCategories,
          twoWordsMode: newGame.twoWordsMode,
          whoStart: newGame.whoStart ?? undefined, // Força a existência da chave
          phase: "reveal" as const,
        },
      };
    });
  }

  function goBackLobby() {
    navigate("/games/impostor/lobby");
  }

  switch (gameState.data.phase) {
    case "reveal":
      return (
        <RevealPhase
          data={gameState.data}
          onNextPhase={changePhase}
          onExit={goBackLobby}
        />
      );
    case "discussion":
      return <DiscussPhase data={gameState.data} onNextPhase={changePhase} />;
    case "voting":
      return <VotingPhase data={gameState.data} onNextPhase={changePhase} />;
    case "elimination":
      return (
        <EliminationPhase data={gameState.data} onNextPhase={changePhase} />
      );
    case "result":
      return (
        <ResultPhase
          data={gameState.data}
          onNextPhase={changePhase}
          onNextRound={handleNextRound}
        />
      );
    default:
      return null;
  }
}
