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
  const impostorHistoryRef = useRef<string[][]>([]);
  const wordHistoryRef = useRef<string[]>([]);

  if (impostorHistoryRef.current.length === 0) {
    const firstRoundImpostors = Initialstate.data.players
      .filter((p) => p.isImpostor)
      .map((p) => p.id);
    impostorHistoryRef.current = [firstRoundImpostors];
  }

  // Inicializa o histórico da primeira palavra (que veio do Lobby)
  if (wordHistoryRef.current.length === 0) {
    // Tenta encontrar a palavra de um tripulante no estado inicial
    const firstWord = Initialstate.data.players.find(
      (p) => !p.isImpostor,
    )?.word;
    if (firstWord) wordHistoryRef.current = [firstWord];
  }

  function handleNextRound() {
    const {
      players,
      howManyImpostors,
      twoWordsMode,
      impostorHint,
      selectedCategories,
      whoStart,
      impostorCanStart,
    } = gameState.data;

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

    //Inicializa o jogo com os dados atuais.

    const newGame = initializeGame(
      playersForNewGame as any,
      howManyImpostors,
      twoWordsMode,
      impostorHint,
      selectedCategories,
      Boolean(whoStart),
      impostorCanStart,
      impostorHistoryRef.current,
      wordHistoryRef.current, // <--- PASSA O HISTÓRICO DE PALAVRAS
    );

    // --- SALVA A NOVA PALAVRA NO HISTÓRICO ---
    const wordsUsedThisRound = newGame.allPlayers
      .map((p) => p.word)
      .filter((w): w is string => w !== null); // Remove nulls dos impostores

    // Removemos duplicatas (ex: se todos tiveram a mesma palavra) e salvamos no Ref
    const uniqueWords = Array.from(new Set(wordsUsedThisRound));
    wordHistoryRef.current = [...wordHistoryRef.current, ...uniqueWords];

    const newImpostorIds = newGame.allPlayers
      .filter((p) => p.isImpostor)
      .map((p) => p.id);

    // Adicionamos ao histórico para a PRÓXIMA vez que handleNextRound for clicado
    impostorHistoryRef.current = [
      ...impostorHistoryRef.current,
      newImpostorIds,
    ];

    // 3. Atualização dos jogadores: acumulando score e mantendo globalScore fixo
    const updatedPlayers: ImpostorPlayer[] = newGame.allPlayers.map((newP) => {
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
    });

    // 4. Retorno do estado formatado exatamente conforme o tipo GameRouteState
    setGameState({
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
    });
  }

  // Função para verificar se a partida acabou
  const checkGameOver = (players: ImpostorPlayer[]) => {
    const alive = players.filter((p) => p.isAlive);
    const impostorsAlive = alive.filter((p) => p.isImpostor).length;
    const crewAlive = alive.length - impostorsAlive;

    // Vitória da Tripulação: 0 impostores
    // Vitória dos Impostores: Impostores >= Tripulantes
    return (
      impostorsAlive === 0 ||
      (impostorsAlive >= crewAlive && impostorsAlive > 0)
    );
  };

  // Função para eliminar jogador e decidir próxima fase
  function handlePlayerElimination(eliminatedId: string | null) {
    setGameState((prev) => {
      const updatedPlayers = prev.data.players.map((p) =>
        p.id === eliminatedId ? { ...p, isAlive: false } : p,
      );

      const isGameOver = checkGameOver(updatedPlayers);

      return {
        ...prev,
        data: {
          ...prev.data,
          players: updatedPlayers,
          // Se a partida acabou, vai para 'result', senão volta para 'discussion'
          phase: isGameOver ? "result" : "discussion",
        },
      };
    });
  }

  function changePhase(phase: ImpostorGameState["phase"]) {
    setGameState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        phase,
      },
    }));
  }

  function handleReroll() {
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

      const newGame = initializeGame(
        players as any,
        howManyImpostors,
        twoWordsMode,
        impostorHint,
        selectedCategories,
        Boolean(whoStart),
        impostorCanStart,
        impostorHistoryRef.current,
        wordHistoryRef.current, // <--- PASSA O HISTÓRICO
      );

      // --- SALVA A NOVA PALAVRA NO HISTÓRICO ---
      const wordsUsedThisRound = newGame.allPlayers
        .map((p) => p.word)
        .filter((w): w is string => w !== null); // Remove nulls dos impostores

      const uniqueWords = Array.from(new Set(wordsUsedThisRound));
      wordHistoryRef.current = [...wordHistoryRef.current, ...uniqueWords];

      return {
        ...prevState,
        data: {
          ...prevState.data,
          players: newGame.allPlayers,
          whoStart: newGame.whoStart ?? undefined,
          phase: "reveal",
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
          onReroll={handleReroll}
        />
      );

    case "discussion":
      return <DiscussPhase data={gameState.data} onNextPhase={changePhase} />;

    case "voting":
      return (
        <VotingPhase
          data={gameState.data}
          onEliminate={handlePlayerElimination} // Passando a função
        />
      );

    case "elimination":
      return (
        <EliminationPhase
          data={gameState.data}
          onEliminate={handlePlayerElimination} // Passando a função
        />
      );

    case "result":
      return (
        <ResultPhase
          data={gameState.data}
          onNextPhase={changePhase}
          onNextRound={handleNextRound}
        />
      );
  }
}
