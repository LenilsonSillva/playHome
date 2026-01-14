import { useEffect, useState } from "react";
import type { ImpostorPlayer } from "../../GameLogistic/types";

export function DiscussPhase(state: any) {
  const [seconds, setSeconds] = useState(0);

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

  return (
    <div className="discussion-screen">
      <h1>Discussão</h1>

      <p>⏱️ {formatTime(seconds)} de discussão</p>

      <p>JOGADORES VIVOS: </p>
      <ul>
        {state.data.players.map((p: ImpostorPlayer) => {
          if (p.isAlive) {
            return <li key={p.id}>{p.name}</li>;
          } else null;
        })}
      </ul>
      <div>
        {state.data.whoStart === undefined ? null : (
          <p>{state.data.whoStart} começa o jogo.</p>
        )}
      </div>
      <p>
        {state.data.howManyImpostors === 1
          ? "Existe 1 impostor"
          : "Existem " + state.data.howManyImpostors + " impostores"}
        {!state.impostorHint ? " com dica." : null}
      </p>

      <button>Ir para votação</button>
      <button>Pular Votação</button>
    </div>
  );
}
