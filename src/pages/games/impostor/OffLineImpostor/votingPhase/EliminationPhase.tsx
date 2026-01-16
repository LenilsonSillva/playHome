import type {
  GameRouteState,
  ImpostorGameState,
} from "../../GameLogistic/types";
type DiscussPhaseProps = {
  data: GameRouteState["data"];
  onNextPhase: (phase: ImpostorGameState["phase"]) => void;
};

import { useState } from "react";

export function EliminationPhase({ data, onNextPhase }: DiscussPhaseProps) {
  const alivePlayers = data.players.filter((p) => p.isAlive);
  const [eliminatedId, setEliminatedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleEliminate(id: string | null) {
    setEliminatedId(id);
    setConfirmed(true);
  }

  function handleAdvance() {
    if (eliminatedId) {
      const idx = data.players.findIndex((p) => p.id === eliminatedId);
      if (idx !== -1) {
        data.players[idx].isAlive = false;
      }
    }
    onNextPhase("result");
  }

  if (confirmed) {
    const eliminatedPlayer = alivePlayers.find((p) => p.id === eliminatedId);
    return (
      <div>
        <h2>Eliminação Manual</h2>
        {eliminatedPlayer ? (
          <p>
            Eliminado: <strong>{eliminatedPlayer.name}</strong>
          </p>
        ) : (
          <p>Ninguém foi eliminado.</p>
        )}
        <button onClick={handleAdvance}>Avançar</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Eliminação Manual</h2>
      <p>O host deve escolher quem será eliminado nesta rodada:</p>
      <ul>
        {alivePlayers.map((p) => (
          <li key={p.id}>
            {p.name}
            <button
              onClick={() => handleEliminate(p.id)}
              style={{ marginLeft: 8 }}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>
      <button onClick={() => handleEliminate(null)} style={{ marginTop: 16 }}>
        Ninguém será eliminado
      </button>
    </div>
  );
}
