import { useState } from "react";
import { OfflineImpostorLobby } from "./OfflineImpostorLobby";
import { OnlineImpostorLobby } from "./OnlineImpostorLobby";

export default function LobbyImportor() {
  const [gameMode, setGameMode] = useState<string | null>(null);

  // Renderização do componente principal do lobby

  return (
    <div>
      <div>
        <h1>Selecione o tipo de jogo</h1>
        <div>
          <button onClick={() => setGameMode("local")}>Jogo Local</button>
          <label>
            Jogue com os amigos juntos no mesmo lugar usando apenas um
            dispositivo
          </label>
          <button onClick={() => setGameMode("online")}>Jogo Online</button>
          <label>Crie uma sala online e jogue cada um no seu dispositivo</label>
        </div>
      </div>
      <div>
        {gameMode === "local" ? (
          <OfflineImpostorLobby />
        ) : (
          <OnlineImpostorLobby />
        )}
      </div>
    </div>
  );
}
