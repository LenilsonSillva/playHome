import { useEffect, useState } from "react";
import type {
  GameRouteState,
  ImpostorGameState,
} from "../../GameLogistic/types";
type DiscussPhaseProps = {
  data: GameRouteState["data"];
  onNextPhase: (phase: ImpostorGameState["phase"]) => void;
};

export function RevealPhase({ data, onNextPhase }: DiscussPhaseProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const player = data.players[index];

  function nextPlayer() {
    setRevealed(false);
    setIndex((prev) => prev + 1);
  }

    useEffect(() => {
    if (!player) {
      onNextPhase("discussion");
    }
  }, [onNextPhase, player]);
  

  return (
    <div className="reveal-screen">
      {!revealed ? (
        <>
          <h2>Passe o celular para</h2>
          <h1>{player?.name}</h1>
          <button onClick={() => setRevealed(true)}>Revelar</button>
        </>
      ) : (
        <>
          {player?.isImpostor ? (
            <>
              <h1>Você é o IMPOSTOR</h1>
              {player?.hint && <p>Dica: {player?.hint}</p>}
            </>
          ) : (
            <h1>{player?.word}</h1>
          )}
          {data.whoStart == player.name && (
            <>
              <p>Prepare-se, você inicia a partida.</p>
            </>
          )}
          <button onClick={nextPlayer}>Ocultar e passar</button>
        </>
      )}
    </div>
  );
}
