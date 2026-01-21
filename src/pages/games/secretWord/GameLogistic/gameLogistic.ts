import type { GlobalPlayer } from "../../../../types/player";
import type { SecretTeam } from "./types";
import { WORDS } from "../../../../data/words";

const TEAM_NAMES = [
  "Alfa",
  "Bravo",
  "Charlie",
  "Delta",
  "Eco",
  "Foxtrot",
  "Golfe",
  "Hotel",
  "Índia",
  "Julieta",
];
const TEAM_COLORS = [
  "#3b82f6",
  "#ff003c",
  "#10b981",
  "#facc15",
  "#a855f7",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#84cc16",
  "#64748b",
];

export function createTeams(
  players: GlobalPlayer[],
  teamCount: number,
): SecretTeam[] {
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  const teams: SecretTeam[] = [];

  for (let i = 0; i < teamCount; i++) {
    teams.push({
      id: `team-${i}`,
      name: `Esquadrão ${TEAM_NAMES[i]}`,
      playerIds: [],
      score: 0,
      roundScore: 0,
      color: TEAM_COLORS[i],
      wordsGuessed: [] as string[],
    });
  }

  // Distribui os jogadores nos times
  shuffled.forEach((player, index) => {
    teams[index % teamCount].playerIds.push(player.id);
  });

  return teams;
}

export function getNewWord(selectedCategories: string[], usedWords: string[]) {
  // Filtra as 600 palavras pelas categorias selecionadas
  const filtered = WORDS.filter((w) => selectedCategories.includes(w.category));

  // Tenta pegar uma que ainda não foi usada
  const available = filtered.filter((w) => !usedWords.includes(w.word));

  // Se acabarem as palavras, reseta o pool daquela categoria
  const pool =
    available.length > 0 ? available : filtered.length > 0 ? filtered : WORDS;

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex].word;
}
