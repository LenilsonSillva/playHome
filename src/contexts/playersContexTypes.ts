import type { GlobalPlayer } from "../types/player";

export type PlayersContextType = {
  players: GlobalPlayer[];
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  clearPlayers: () => void;
};

export type PlayersContextProps = {
  players: PlayersContextType["players"];
  setPlayer: React.Dispatch<
    React.SetStateAction<PlayersContextType["players"]>
  >;
  addPlayer: PlayersContextType["addPlayer"];
  removePlayer: PlayersContextType["removePlayer"];
  clearPlayers: PlayersContextType["clearPlayers"];
};
