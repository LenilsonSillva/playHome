import { useEffect, useState } from "react";
import type {
  GameRouteState,
  ImpostorGameState,
} from "../../GameLogistic/types";
type DiscussPhaseProps = {
  data: GameRouteState["data"];
  onNextPhase: (phase: ImpostorGameState["phase"]) => void;
};

export function DiscussPhase({ data, onNextPhase }: DiscussPhaseProps) {
  const [seconds, setSeconds] = useState(0);
  const [nextPhase, setNextPhase] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  useEffect(()=>{
    if (nextPhase === "voting") {
    onNextPhase(nextPhase);
  } else if (nextPhase === "elimination") {
    onNextPhase(nextPhase);
  }
  }),[onNextPhase, nextPhase]

  return (
    <div className="discussion-screen">
      <h1>Discussão</h1>

      <p>⏱️ {formatTime(seconds)} de discussão</p>

      <p>JOGADORES VIVOS: </p>
      <ul>
        {data.players
          .filter((p) => p.isAlive)
          .map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
      </ul>
      <div>
        {data.whoStart === undefined ? null : (
          <p>{data.whoStart} começa o jogo.</p>
        )}
      </div>
      <p>
        {data.howManyImpostors === 1
          ? "Existe 1 impostor"
          : "Existem " + data.howManyImpostors + " impostores"}
        {data.impostorHint ? " com dica." : null}
      </p>

      <button onClick={() => setNextPhase("voting")}>Ir para votação</button>
      <button onClick={() => setNextPhase("elimination")}>Pular Votação</button>
    </div>
  );
}
