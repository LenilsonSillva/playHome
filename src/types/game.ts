export type Game = {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  route: string;
  icon: string;   // O emoji do jogo
  accent: string; // A cor neon (ex: var(--danger-neon))
  btn: string;    // O gradiente do botão (ex: var(--button-red))
};