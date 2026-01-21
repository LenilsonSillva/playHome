import type { GlobalPlayer } from "../../../../types/player";

export type SecretWordMode = "blitz" | "duel";

export interface SecretTeam {
  id: string;
  name: string;
  playerIds: string[];
  score: number;
  roundScore: number;
  color: string;
  operatorId?: string; // ID do jogador que dará as dicas
  wordsGuessed: string[];
}

export interface SecretWordPlayer extends GlobalPlayer {
  teamId: string;
}

export interface SecretWordGameState {
  mode: SecretWordMode;
  teams: SecretTeam[];
  currentTeamIdx: number;
  currentOperatorId: string | null;
  roundTime: number;
  selectedCategories: string[];
  phase: "team-reveal" | "action" | "result";
  currentWord: string | null;
  usedWords: string[];
  matchLimit: number; // Quantas palavras no modo Duelo
  currentMatchIdx: number; // Índice da palavra atual no Duelo
}

// Para o State do React Router
export interface SecretWordRouteState {
  data: SecretWordGameState;
}
