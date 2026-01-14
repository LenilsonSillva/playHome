import type { GlobalPlayer } from "../../../../types/player";

export type ImpostorPlayer = GlobalPlayer & {
  isImpostor: boolean;
  isAlive: boolean;
  word: string | null;
  vote?: string;
  hint?: string;
};

export type ImpostorGameState = {
  players: ImpostorPlayer[];
  phase: "reveal" | "discussion" | "voting" | "result";
};

export type GameData = {
  allPlayers: ImpostorPlayer[];
  howManyImpostors: number;
  twoWordsMode: boolean;
  impostorHasHint: boolean;
  selectedCategories: string[];
  whoStart?: string;
  impostorCanStart: boolean;
};

export type GameRouteState = {
  players: ImpostorPlayer[];
  howManyImpostors: number;
  impostorCanStart: boolean;
  impostorHint: boolean;
  selectedCategories: string[];
  twoWordsMode: boolean;
  whoStart: string | undefined;
  phase: string;
};
