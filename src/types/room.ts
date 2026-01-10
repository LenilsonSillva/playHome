import type { GlobalPlayer } from "./player";

export type Room = {
  id: string;
  players: GlobalPlayer[];
  hostId: string;
};
