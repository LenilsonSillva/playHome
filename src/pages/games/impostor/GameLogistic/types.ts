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

export type GameOptions = {
  impostorCount: number;
  twoWordsMode: boolean;
  impostorHasHint: boolean;
  selectedCategories: string[];
};
