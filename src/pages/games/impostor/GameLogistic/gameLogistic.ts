import type { GlobalPlayer } from "../../../../types/player";
import type { GameData, ImpostorPlayer } from "./types";
import { WORDS, type WordData } from "./words";

export function getImpostorCount(playersCount: number): number {
  if (playersCount >= 6) return 3;
  if (playersCount >= 4) return 2;
  return 1;
}

const PLAYER_ICONS = [
  "🤫", "😁", "👾", "👨‍🚀", "👩‍🚀", "👽", "🤖", "😎", "🫥", "🤔", 
  "🤐", "😶‍🌫️", "😶", "🫠", "🥸", "🤥", "🫣", "🧐", "👹", "🫢",
  "🤓", "😈", "👿", "💀", "👻", "👺", "🧞‍♀️", "🧞‍♂️", "🧟", "🧌",
  "👨🏻", "👨🏽", "👩🏽", "👩🏻", "🤴🏻", "👸🏻", "🧑🏻‍🎄", "🕵🏻‍♀️", "🦹🏻", "🦸🏻", 
  "🧙🏻", "🧛🏻"
];

const ICON_COLORS = [
  "#ff003c", "#3b82f6", "#facc15", "#10b981", "#6d28d9", 
  "#00f2ff", "#ff7b00", "#ff00fb", "#00ff40", "#ffffff",
  "#7f1d1d", "#075985", "#a16207", "#065f46", "#4c1d95",
  "#0891b2", "#b91c1c", "#1d4ed8", "#eab308", "#22c55e"
];

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

// LOGICA DE HISTÓRICO: Bloqueia quem foi impostor 2 vezes seguidas
export function pickImpostors(
  playerIds: string[],
  impostorCount: number,
  impostorHistory: string[][] = [],
): string[] {
  const lastTwo = impostorHistory.slice(-2).flat();
  const count: Record<string, number> = {};
  
  lastTwo.forEach((id) => {
    count[id] = (count[id] || 0) + 1;
  });

  // Se o ID aparece 2 vezes nas últimas 2 rodadas, ele é bloqueado
  const blocked = Object.entries(count)
    .filter(([_, c]) => c >= 2)
    .map(([id]) => id);

  const candidates = playerIds.filter((id) => !blocked.includes(id));
  
  // Se houver candidatos suficientes, usa apenas eles. 
  // Caso contrário (em grupos muito pequenos), libera geral para não travar o sorteio.
  let pool = candidates.length >= impostorCount ? candidates : playerIds;
  
  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, impostorCount);
}

function createImpostorPlayers(
  players: GlobalPlayer[],
  impostorNumber: number,
  impostorHistory: string[][] = [],
): ImpostorPlayer[] {
  const impostorIds = pickImpostors(
    players.map((p) => p.id),
    impostorNumber,
    impostorHistory,
  );

  const shuffledIcons = shuffleArray(PLAYER_ICONS);
  const shuffledColors = shuffleArray(ICON_COLORS);

  return players.map((p, index) => {
    const pAny = p as any;

    // Preservação de Score e GlobalScore
    const currentScore = typeof pAny.score === "number" ? pAny.score : 0;
    const currentGlobal = typeof pAny.globalScore === "number" ? pAny.globalScore : currentScore;

    return {
      ...p,
      isImpostor: impostorIds.includes(p.id),
      isAlive: true,
      word: null,
      score: currentScore,
      globalScore: currentGlobal,
      // Preserva emoji e cor se já existirem (para não mudar entre rodadas)
      emoji: pAny.emoji ?? shuffledIcons[index % shuffledIcons.length],
      color: pAny.color ?? shuffledColors[index % shuffledColors.length],
    };
  });
}

function selectWhoStart(
  playersData: ImpostorPlayer[],
  whoStartButton: boolean,
  impostorCanStart: boolean,
): string | undefined {
  if (!whoStartButton) return undefined;
  
  const candidate = pickRandom(playersData);

  if (candidate.isImpostor && !impostorCanStart) {
    return selectWhoStart(playersData, whoStartButton, impostorCanStart);
  } 
  
  return candidate.name;
}

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function distributeWords(
  players: ImpostorPlayer[],
  twoWordsMode: boolean,
  selectedCategories: string[],
  wordBank: WordData[],
  impostorHasHint: boolean,
): ImpostorPlayer[] {
  const filteredWords = wordBank.filter((word) =>
    selectedCategories.includes(word.category),
  );
  const word = pickRandom(filteredWords.length > 0 ? filteredWords : wordBank);

  const nonImpostors = players.filter(p => !p.isImpostor);
  const getGroupASize = Math.floor(nonImpostors.length / 2);

  // Sorteia quem do grupo civil recebe a palavra relacionada (se houver)
  const shuffledCivils = shuffleArray(nonImpostors.map(p => p.id));
  const groupAIds = shuffledCivils.slice(0, getGroupASize);

  return players.map((player) => {
    if (player.isImpostor) {
      return {
        ...player,
        word: null,
        hint: impostorHasHint ? word.hint : undefined,
      };
    } else {
      const assignedWord = twoWordsMode && groupAIds.includes(player.id) && word.related
          ? word.related.toString()
          : word.word;

      return {
        ...player,
        word: assignedWord,
      };
    }
  });
}

export function initializeGame(
  allPlayers: GlobalPlayer[],
  howManyImpostors: number,
  twoWordsMode: boolean,
  impostorHasHint: boolean,
  selectedCategories: string[],
  whoStartButton: boolean,
  impostorCanStart: boolean,
  impostorHistory: string[][] = [],
): GameData {
  const impostorTrueOrFalse = createImpostorPlayers(
    allPlayers,
    howManyImpostors,
    impostorHistory, // HISTÓRICO PASSADO AQUI
  );

  const setWordAndData = distributeWords(
    impostorTrueOrFalse,
    twoWordsMode,
    selectedCategories,
    WORDS,
    impostorHasHint,
  );

  const setWhoStart = selectWhoStart(
    setWordAndData,
    whoStartButton,
    impostorCanStart,
  );

  return {
    allPlayers: setWordAndData,
    howManyImpostors,
    twoWordsMode,
    impostorHasHint,
    selectedCategories,
    whoStart: setWhoStart,
    impostorCanStart,
  };
}