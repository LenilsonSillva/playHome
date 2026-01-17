import type { GlobalPlayer } from "../../../../types/player";
import type { GameData, ImpostorPlayer } from "./types";
import { WORDS, type WordData } from "./words";

export function getImpostorCount(playersCount: number): number {
  if (playersCount >= 7) return 3;
  if (playersCount >= 5) return 2;
  return 1;
}

const PLAYER_ICONS = [
  "🤫",
  "😁",
  "👾",
  "🧑🏻‍🚀",
  "👩🏽‍🚀",
  "👽",
  "🤖",
  "😎",
  "🫥",
  "🤔",
  "🤐",
  "😶‍🌫️",
  "😶",
  "🫠",
  "🥸",
  "🤥",
  "🫣",
  "🧐",
  "👹",
  "🫢",
  "🤓",
  "😈",
  "👿",
  "💀",
  "👻",
  "👺",
  "🧞‍♀️",
  "🧞‍♂️",
  "🧟",
  "🧌",
  "👨🏻",
  "👨🏽",
  "👩🏽",
  "👩🏻",
  "🤴🏻",
  "👸🏻",
  "🧑🏻‍🎄",
  "🕵🏻‍♀️",
  "🦹🏻",
  "🦸🏻",
  "🧙🏻",
  "🧛🏻",
];

const ICON_COLORS = [
  "#ff003c",
  "#3b82f6",
  "#facc15",
  "#51890c",
  "#6d28d9",
  "#19a5ac",
  "#ff7b00",
  "#ff00fb",
  "#00ff40",
  "#69166b",
  "#7f1d1d",
  "#075985",
  "#a16207",
  "#065f46",
  "#4c1d95",
  "#13697f",
  "#b91c1c",
  "#1d4ed8",
  "#ba8d07",
  "#777777",
];

// 1. Melhoria no Shuffle (Fisher-Yates) para garantir aleatoriedade real
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// LOGICA DE HISTÓRICO: Bloqueia quem foi impostor 2 vezes seguidas
export function pickImpostors(
  playerIds: string[],
  impostorCount: number,
  impostorHistory: string[][] = [], // Ex: [['id1', 'id2'], ['id1', 'id3']]
): string[] {
  // Pegamos as duas últimas rodadas separadamente
  const lastRound = impostorHistory[impostorHistory.length - 1] || [];
  const secondLastRound = impostorHistory[impostorHistory.length - 2] || [];

  // Um jogador é bloqueado se ele foi impostor na ÚLTIMA E na PENÚLTIMA rodada
  const blocked = playerIds.filter(
    (id) => lastRound.includes(id) && secondLastRound.includes(id),
  );

  // Candidatos são aqueles que não estão bloqueados
  let candidates = playerIds.filter((id) => !blocked.includes(id));

  // Segurança: Se o número de candidatos for menor que a quantidade de impostores necessária
  // (ex: grupo muito pequeno onde todos já foram impostores), liberamos os bloqueados
  if (candidates.length < impostorCount) {
    candidates = playerIds;
  }

  const shuffled = shuffleArray(candidates);
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
    const currentGlobal =
      typeof pAny.globalScore === "number" ? pAny.globalScore : currentScore;

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
  usedWords: string[] = [],
): { updatedPlayers: ImpostorPlayer[]; chosenWord: string[] } {
  // 1. Filtra por categorias selecionadas
  let filteredWords = wordBank.filter((word) =>
    selectedCategories.includes(word.category),
  );

  // 2. Filtra removendo as palavras que já foram usadas nesta sessão
  let availableWords = filteredWords.filter((w) => {
    const isMainWordUsed = usedWords.includes(w.word);
    const isAnyRelatedWordUsed = w.related?.some((r) => usedWords.includes(r));
    return !isMainWordUsed && !isAnyRelatedWordUsed;
  });

  // 3. Fallback: Se todas as palavras da categoria acabarem, reseta o pool daquela categoria
  if (availableWords.length === 0) {
    availableWords = filteredWords.length > 0 ? filteredWords : wordBank;
  }

  const word = pickRandom(availableWords);

  // Identificar quais strings serão usadas nesta rodada para salvar no histórico
  const wordA = word.word;
  const wordB =
    twoWordsMode && word.related && word.related.length > 0
      ? word.related[0]
      : wordA;

  const nonImpostors = players.filter((p) => !p.isImpostor);
  const getGroupASize = Math.floor(nonImpostors.length / 2);
  const shuffledCivils = shuffleArray(nonImpostors.map((p) => p.id));
  const groupAIds = shuffledCivils.slice(0, getGroupASize);

  const updatedPlayers = players.map((player) => {
    if (player.isImpostor) {
      return {
        ...player,
        word: null,
        hint: impostorHasHint ? word.hint : undefined,
      };
    } else {
      const finalWord =
        twoWordsMode && groupAIds.includes(player.id) ? wordB : wordA;
      return { ...player, word: finalWord };
    }
  });

  return { updatedPlayers, chosenWord: [wordA, wordB] }; // Retornamos a palavra para salvar no histórico
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
  usedWords: string[] = [], // <--- NOVO PARÂMETRO
): GameData & { chosenWord: string[] } {
  const impostorTrueOrFalse = createImpostorPlayers(
    allPlayers,
    howManyImpostors,
    impostorHistory,
  );

  const { updatedPlayers, chosenWord } = distributeWords(
    impostorTrueOrFalse,
    twoWordsMode,
    selectedCategories,
    WORDS,
    impostorHasHint,
    usedWords, // <--- PASSA PARA O DISTRIBUTE
  );

  const setWhoStart = selectWhoStart(
    updatedPlayers,
    whoStartButton,
    impostorCanStart,
  );

  return {
    allPlayers: updatedPlayers,
    howManyImpostors,
    twoWordsMode,
    impostorHasHint,
    selectedCategories,
    whoStart: setWhoStart,
    impostorCanStart,
    chosenWord, // <--- RETORNA A PALAVRA SORTEADA
  };
}
