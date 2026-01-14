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

export function pickImpostors(
  playerIds: string[],
  impostorCount: number,
): string[] {
  const shuffled = [...playerIds].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, impostorCount);
}

// cria os jogadores do jogo com base nos jogadores globais e na quantidade de impostores

function createImpostorPlayers(
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
): GameData {
  const impostorTrueOrFalse = createImpostorPlayers(
    allPlayers,
    howManyImpostors,
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
