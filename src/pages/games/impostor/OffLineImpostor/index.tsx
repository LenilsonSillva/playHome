import { useLocation, useNavigate } from "react-router-dom";
import type { ImpostorGameState } from "../GameLogistic/types";

export function OfflineImpostorGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as ImpostorGameState | undefined;

  if (!state) {
    return (
      <div>
        <h1>Erro: Estado do jogo não encontrado.</h1>
        <button onClick={() => navigate("/games/impostor/lobby")}>
          Voltar ao Lobby
        </button>
      </div>
    );
  }

  console.log("Estado do jogo recebido:", state);

  return <div>Offline Impostor Game</div>;
}
