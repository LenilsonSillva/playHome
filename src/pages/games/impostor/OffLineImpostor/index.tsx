import { useLocation } from "react-router-dom";
import { RevealPhase } from "./revealPhase";
import { DiscussPhase } from "./discussPhase";
import type { GameRouteState, ImpostorGameState } from "../GameLogistic/types";
import { VotingPhase } from "./votingPhase/VotingPhase";
import { EliminationPhase } from "./votingPhase/EliminationPhase";
import { useState } from "react";
import { ResultPhase } from "./resultPhase";
import { initializeGame } from "../GameLogistic/gameLogistic";

export function OfflineImpostorGame() {
  const location = useLocation();
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

  function handleNextRound() {
    // Reutiliza as configurações atuais para reiniciar o jogo
    const {
      players,
      howManyImpostors,
      twoWordsMode,
      impostorHint,
      selectedCategories,
      whoStart,
      impostorCanStart,
    } = gameState.data;

    // Calcula os pontos da rodada atual
    const roundScores: Record<string, number> = {};
    players.forEach(p => {
      if (p.isImpostor) {
        if (p.isAlive) {
          roundScores[p.id] = 2;
        } else {
          roundScores[p.id] = -1.5;
        }
      } else {
        if (p.isAlive) {
          roundScores[p.id] = 1;
        } else {
          roundScores[p.id] = 0;
        }
      }
    });

    // initializeGame espera allPlayers (GlobalPlayer[]), mas queremos preservar o score acumulado
    const allPlayers = players.map(({ id, name, score }) => ({ id, name }));
    const newGame = initializeGame(
      allPlayers,
      howManyImpostors,
      twoWordsMode,
      impostorHint,
      selectedCategories,
      Boolean(whoStart),
      impostorCanStart,
    );

    // Junta os scores acumulados
    const updatedPlayers = newGame.allPlayers.map(newP => {
      const oldP = players.find(p => p.id === newP.id);
      const prevScore = oldP && typeof oldP.score === 'number' ? oldP.score : 0;
      const roundScore = roundScores[newP.id] ?? 0;
      return {
        ...newP,
        score: prevScore + roundScore,
      };
    });

    setGameState({
      data: {
        players: updatedPlayers,
        howManyImpostors: newGame.howManyImpostors,
        twoWordsMode: newGame.twoWordsMode,
        impostorHint: newGame.impostorHasHint,
        selectedCategories: newGame.selectedCategories,
        whoStart: newGame.whoStart,
        impostorCanStart: newGame.impostorCanStart,
        phase: "reveal",
      },
    });
  }

  switch (gameState.data.phase) {
    case "reveal":
      return <RevealPhase data={gameState.data} onNextPhase={changePhase} />;
    case "discussion":
      return <DiscussPhase data={gameState.data} onNextPhase={changePhase} />;
    case "voting":
      return <VotingPhase data={gameState.data} onNextPhase={changePhase} />;
    case "elimination":
      return <EliminationPhase data={gameState.data} onNextPhase={changePhase} />;
    case "result":
      return <ResultPhase data={gameState.data} onNextPhase={changePhase} onNextRound={handleNextRound} />;
    default:
      return null;
  }
}
