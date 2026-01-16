import type { GlobalPlayer } from "../../../../types/player";
import type { GameData, ImpostorPlayer } from "./types";
import { WORDS, type WordData } from "./words";

// Quantidade de impostores baseado na quantidade de jogadores
export function getImpostorCount(playersCount: number): number {
  if (playersCount >= 6) return 3;
  if (playersCount >= 4) return 2;
  return 1;
}

// seleciona os impostores do jogo

// const com os icones e cores dos jogadores

const PLAYER_ICONS = [
  "🤫",
  "😁",
  "👾",
  "👨‍🚀",
  "👩‍🚀",
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
  "#10b981",
  "#6d28d9",
  "#00f2ff",
  "#ff7b00",
  "#ff00fb",
  "#00ff40",
  "#ffffff",
  "#7f1d1d",
  "#075985",
  "#a16207",
  "#065f46",
  "#4c1d95",
  "#0891b2",
  "#b91c1c",
  "#1d4ed8",
  "#eab308",
  "#22c55e",
];

// Função auxiliar para embaralhar arrays
function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

// impostorHistory: array das duas últimas rodadas, cada elemento é array de ids dos impostores daquela rodada
export function pickImpostors(
  playerIds: string[],
  impostorCount: number,
  impostorHistory: string[][] = [],
): string[] {
  // Junta os ids das duas últimas rodadas
  const lastTwo = impostorHistory.slice(-2).flat();
  // Conta quantas vezes cada id apareceu nas duas últimas rodadas
  const count: Record<string, number> = {};
  lastTwo.forEach((id) => {
    count[id] = (count[id] || 0) + 1;
  });
  // Filtra ids que foram impostor nas duas últimas rodadas
  const blocked = Object.entries(count)
    .filter(([_, c]) => c >= 2)
    .map(([id]) => id);
  // Tenta evitar esses ids
  const candidates = playerIds.filter((id) => !blocked.includes(id));
  let pool = candidates.length >= impostorCount ? candidates : playerIds;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, impostorCount);
}

// cria os jogadores do jogo com base nos jogadores globais e na quantidade de impostores

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

    // IMPORTANTE: Se pAny.score for 0, o JS trata como 'false'.
    // Usamos typeof para garantir que o 0 seja preservado.
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
  const getWhoStart = pickRandom(playersData);

  if (whoStartButton) {
    if (getWhoStart.isImpostor && !impostorCanStart) {
      const data = selectWhoStart(
        playersData,
        whoStartButton,
        impostorCanStart,
      );
      return data;
    } else return getWhoStart.name;
  }
}

// Seleciona as palavras para os jogadores e escolhe as dicas do impostor

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Distribui as palavras entre os jogadores

function distributeWords(
  players: ImpostorPlayer[],
  twoWordsMode: boolean,
  selectedCategories: string[],
  wordBank: WordData[],
  impostorHasHint: boolean,
  howManyImpostors: number,
): ImpostorPlayer[] {
  const filteredWords = wordBank.filter((word) =>
    selectedCategories.includes(word.category),
  );
  const word = pickRandom(filteredWords);

  //Separa o grupo em dois e seleciona a palavra para cada grupo
  const getGroupASize = Math.floor((players.length - howManyImpostors) / 2);

  const randomUniqueNumbers = (
    quantity: number,
    min: number,
    max: number,
  ): number[] => {
    if (max - min + 1 < quantity) {
      throw new Error("Intervalo pequeno demais para a quantidade solicitada");
    }

    const numbers = new Set<number>();

    while (numbers.size < quantity) {
      const random = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!players[random].isImpostor) {
        numbers.add(random);
      }
    }
    return [...numbers];
  };

  const includePlayer = randomUniqueNumbers(
    getGroupASize,
    0,
    players.length - 1,
  );

  return players.map((player, index) => {
    if (player.isImpostor) {
      return {
        ...player,
        word: null,
        hint: impostorHasHint ? word.hint : undefined,
      };
    } else {
      const assignedWord = twoWordsMode
        ? includePlayer.includes(index) && word.related
          ? word.related?.toString()
          : word.word
        : word.word;

      return {
        ...player,
        word: assignedWord,
      };
    }
  });
}

// inicializa as palavras do jogo para os jogadores

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
    impostorHistory,
  );

  const setWordAndData = distributeWords(
    impostorTrueOrFalse,
    twoWordsMode,
    selectedCategories,
    WORDS,
    impostorHasHint,
    howManyImpostors,
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
