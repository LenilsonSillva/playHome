import { useContext } from "react";
import { PlayersContext } from "./playersContext";
import type { PlayersContextType } from "./playersContexTypes";

export function usePlayers(): PlayersContextType {
  const context = useContext(PlayersContext);
  if (!context) {
    throw new Error("usePlayers must be used within a PlayersProvider");
  }
  return context;
}
