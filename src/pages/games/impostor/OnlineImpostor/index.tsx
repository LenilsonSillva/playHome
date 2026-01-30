import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { RevealPhase } from "../components/revealPhase";
import { useSocket } from "../../../../contexts/socketContext";
import { DiscussPhase } from "../components/discussPhase";
import { VotingPhase } from "../components/votingPhase/VotingPhase";
import { ResultPhase } from "../components/resultPhase";

export function OnlineImpostorGame() {
  const socket = useSocket();
  const location = useLocation();
  const [gameData, setGameData] = useState<any>(
    location.state?.data || location.state || null,
  );

  useEffect(() => {
    socket.on("game-update", (data) => {
      setGameData(data);
    });

    return () => {
      socket.off("game-update");
    };
  }, [socket]);

  if (!gameData) return <div>Carregando...</div>;

  function handleExit() {
    // Você pode voltar pro lobby
    window.location.href = "/games/impostor/lobby";
  }

  function handleNextPhase(nextPhase: string) {
    // quando o RevealPhase chama onNextPhase("discussion")
    // o servidor deve trocar a fase e emitir game-update pra todo mundo
    socket.emit("next-phase", {
      roomCode: gameData.roomCode,
      phase: nextPhase,
    });
  }

  function handleReroll() {
    // Host só
    socket.emit("reroll-game", { roomCode: gameData.roomCode });
  }

  function handleToggleReady() {
    socket.emit("toggle-ready", { roomCode: gameData.roomCode });
  }

  function handleCastVote(votedId: string | null) {
    // Se a votação já terminou no servidor, o clique no botão (via onEliminate) confirma a ejetagem
    if (gameData.votingFinished) {
      socket.emit("confirm-elimination", { roomCode: gameData.roomCode });
    } else {
      // Caso contrário, é um voto normal
      socket.emit("cast-vote", {
        roomCode: gameData.roomCode,
        votedId: votedId,
      });
    }
  }

  function handleNextRound() {
    socket.emit("reroll-game", { roomCode: gameData.roomCode });
  }

  // FASES
  if (gameData.phase === "reveal") {
    return (
      <RevealPhase
        data={gameData}
        isOnline={true}
        onNextPhase={handleNextPhase}
        onExit={handleExit}
        onReroll={handleReroll}
        onToggleReadyOnline={handleToggleReady}
      />
    );
  }

  if (gameData.phase === "discussion") {
    return (
      <DiscussPhase
        data={gameData}
        isOnline={true}
        onNextPhase={handleNextPhase}
      />
    );
  }

  if (gameData.phase === "voting") {
    return (
      <VotingPhase
        data={gameData}
        onEliminate={handleCastVote}
        isOnline={true}
      />
    );
  }

  if (gameData.phase === "result") {
    return (
      <ResultPhase
        data={gameData}
        isOnline={true}
        onNextPhase={handleNextPhase}
        onNextRound={handleNextRound}
      />
    );
  }

  return <div>Fase inválida</div>;
}
