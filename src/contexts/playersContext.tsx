import { createContext } from "react";
import type {
  PlayersContextProps,
  PlayersContextType,
} from "./playersContexTypes";

export const initialState: PlayersContextType = {
  players: [],
  addPlayer: () => {},
  removePlayer: () => {},
  clearPlayers: () => {},
};

const initialContextValue: PlayersContextProps = {
  players: initialState.players,
  setPlayer: () => {},
  addPlayer: initialState.addPlayer,
  removePlayer: initialState.removePlayer,
  clearPlayers: initialState.clearPlayers,
};

export const PlayersContext =
  createContext<PlayersContextProps>(initialContextValue);
