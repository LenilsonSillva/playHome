import { useState } from "react";
import { OfflineImpostorGame } from "..";

export function RevealPhase(state: any) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const player = state.data.players[index];

  function nextPlayer() {
    setRevealed(false);
    setIndex((prev) => prev + 1);
  }

  if (!player) {
    state.data.phase = "discussion";
    return <OfflineImpostorGame />;
  }

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
          {state.data.whoStart == player.name && (
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
