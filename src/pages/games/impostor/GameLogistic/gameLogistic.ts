import type { GlobalPlayer } from "../../../../types/player";
import type { ImpostorPlayer } from "./types";

// Quantidade de impostores baseado na quantidade de jogadores
export function getImpostorCount(playersCount: number): number {
  if (playersCount >= 6) return 3;
  if (playersCount >= 4) return 2;
  return 1;
}

// seleciona os impostores do jogo

export function pickImpostors(
  playerIds: string[],
  impostorCount: number,
): string[] {
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, impostorCount);
}

// cria os jogadores do jogo com base nos jogadores globais e na quantidade de impostores

export function createImpostorPlayers(
  players: GlobalPlayer[],
  impostorNumber: number,
): ImpostorPlayer[] {
  const impostorCount = impostorNumber;

  const impostorIds = pickImpostors(
    players.map((p) => p.id),
    impostorCount,
  );

  return players.map((p) => ({
    ...p,
    isImpostor: impostorIds.includes(p.id),
    isAlive: true,
    word: null,
  }));
}
