import type {
  GameRouteState,
  ImpostorGameState,
} from "../../GameLogistic/types";
type DiscussPhaseProps = {
  data: GameRouteState["data"];
  onNextPhase: (phase: ImpostorGameState["phase"]) => void;
};

import { useState, useEffect } from "react";

export function VotingPhase({ data, onNextPhase }: DiscussPhaseProps) {
  // Estado para mostrar detalhes dos votos no resultado
  const [showDetails, setShowDetails] = useState(false);
  // Estado local para votos: array de {votante, voto}
  const [votes, setVotes] = useState<{ voter: string; voted: string }[]>([]);
  // Jogadores vivos
  const alivePlayers = data.players.filter((p) => p.isAlive);
  // Jogador atual (quem está votando agora)
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const currentVoter = alivePlayers[currentVoterIdx];

  // Timer de votação (60 segundos)
  const [seconds, setSeconds] = useState(60);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (finished) return;
    if (seconds === 0) {
      // Voto nulo se tempo acabar
      setVotes((prev) => [...prev, { voter: currentVoter.id, voted: "NULO" }]);
      if (currentVoterIdx < alivePlayers.length - 1) {
        setCurrentVoterIdx(currentVoterIdx + 1);
        setSeconds(60);
      } else {
        setFinished(true);
      }
      return;
    }
    if (currentVoterIdx >= alivePlayers.length) {
      setFinished(true);
      return;
    }
    const interval = setInterval(() => {
      setSeconds((s) => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, currentVoterIdx, alivePlayers.length, finished]);

  // Função para votar
  function handleVote(votedId: string) {
    setVotes((prev) => [...prev, { voter: currentVoter.id, voted: votedId }]);
    if (currentVoterIdx < alivePlayers.length - 1) {
      setCurrentVoterIdx(currentVoterIdx + 1);
      setSeconds(60);
    } else {
      setFinished(true);
    }
  }

  // Feedback visual de voto realizado
  const hasVoted = votes.some((v) => v.voter === currentVoter.id);

  // Contabilizar votos e mostrar resultado
  function getEliminatedPlayer() {
    const voteCount: Record<string, number> = {};
    votes.forEach((v) => {
      if (v.voted !== "NULO") {
        voteCount[v.voted] = (voteCount[v.voted] || 0) + 1;
      }
    });
    // Descobrir o(s) jogador(es) com mais votos
    let maxVotes = 0;
    let candidates: string[] = [];
    Object.entries(voteCount).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        candidates = [id];
      } else if (count === maxVotes) {
        candidates.push(id);
      }
    });
    // Se houver empate ou ninguém recebeu votos, retorna null
    if (candidates.length !== 1 || maxVotes === 0) {
      return null;
    }
    return candidates[0];
  }

  if (finished) {
    const eliminatedId = getEliminatedPlayer();
    const eliminatedPlayer = alivePlayers.find((p) => p.id === eliminatedId);

    // Contar votos por jogador
    const voteCount: Record<string, number> = {};
    votes.forEach((v) => {
      if (v.voted !== "NULO") {
        voteCount[v.voted] = (voteCount[v.voted] || 0) + 1;
      }
    });

    function handleResult() {
      if (eliminatedId) {
        const idx = data.players.findIndex((p) => p.id === eliminatedId);
        if (idx !== -1) {
          data.players[idx].isAlive = false;
        }
      }
      onNextPhase("result");
    }
    // eliminatedId já está definido acima, não precisa redeclarar
    return (
      <div>
        <h2>Resultado da Votação</h2>
        <ul>
          {alivePlayers.map((p) => (
            <li key={p.id}>
              {p.name}: {voteCount[p.id] || 0} voto
              {(voteCount[p.id] || 0) === 1 ? "" : "s"}
            </li>
          ))}
          <li key="nulo">
            Nulos: {votes.filter((v) => v.voted === "NULO").length}
          </li>
        </ul>
        {eliminatedPlayer ? (
          <p>
            Eliminado: <strong>{eliminatedPlayer.name}</strong>
          </p>
        ) : (
          <p>Ninguém foi eliminado (empate ou votos nulos).</p>
        )}
        <button onClick={() => setShowDetails((s) => !s)}>
          {showDetails ? "Ocultar detalhes" : "Mostrar detalhes"}
        </button>
        {showDetails && (
          <ul>
            {votes.map((v, idx) => {
              const voter = alivePlayers.find((p) => p.id === v.voter);
              const voted = alivePlayers.find((p) => p.id === v.voted);
              return (
                <li key={idx}>
                  {voter ? voter.name : v.voter} votou em{" "}
                  {v.voted === "NULO" ? "NULO" : voted ? voted.name : v.voted}
                </li>
              );
            })}
          </ul>
        )}
        <button onClick={handleResult}>Resultado</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Votação</h2>
      <p>
        Tempo restante: <strong>{seconds}s</strong>
      </p>
      <p>
        Jogador votando agora: <strong>{currentVoter.name}</strong>
      </p>
      <ul>
        {alivePlayers
          .filter((p) => p.id !== currentVoter.id)
          .map((p) => (
            <li key={p.id}>
              {p.name}
              <button onClick={() => handleVote(p.id)} disabled={hasVoted}>
                Votar
              </button>
            </li>
          ))}
      </ul>
      <button
        onClick={() => handleVote("NULO")}
        disabled={hasVoted}
        style={{ marginTop: 8 }}
      >
        Votar Nulo
      </button>
      {hasVoted && <p>Voto realizado! Aguarde o próximo jogador.</p>}
      <p>Votos já realizados:</p>
      <ul>
        {[...new Set(votes.map((v) => v.voter))].map((voterId, idx) => {
          const voter = alivePlayers.find((p) => p.id === voterId);
          return <li key={idx}>{voter ? voter.name : voterId} já votou</li>;
        })}
      </ul>
    </div>
  );
}
