import { useState } from "react";
import { OfflineImpostorLobby } from "./OfflineImpostorLobby";
import { OnlineImpostorLobby } from "./OnlineImpostorLobby";
import { ImpostorHeader } from "../../../../components/ImpostorHeader/ImpostorHeader";
import styles from "./index-Lobby.module.css";

export default function LobbyImportor() {
  const [gameMode, setGameMode] = useState<string | null>("local");

  function handleChildValue(value: string) {
    setGameMode(value);
  }

  return (
    <div className={styles["game-content"]}>
      <ImpostorHeader mode={handleChildValue} currentMode={gameMode} />
      <div>
        {gameMode === "local" ? (
          <OfflineImpostorLobby />
        ) : gameMode === "online" ? (
          <OnlineImpostorLobby />
        ) : null}
      </div>
    </div>
  );
}
