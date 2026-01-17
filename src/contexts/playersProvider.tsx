import { useState } from "react";
import { initialState, PlayersContext } from "./playersContext";

type PlayerContextProviderProps = {
  children: React.ReactNode;
};

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

export function PlayerContextProvider({
  children,
}: PlayerContextProviderProps) {
  const [players, setPlayers] = useState(initialState.players);

  function addPlayer(name: string) {
    const normalized = normalizeName(name);

    if (!normalized) return;

    const alreadyExists = players.some(
      (p) => normalizeName(p.name) === normalized,
    );

    if (alreadyExists) {
      alert("Este nome já foi adicionado. Por favor, escolha outro nome.");
      return;
    }

    // GERADOR DE ID ROBUSTO (Funciona em todos os celulares)
    const generateId = () => {
      return (
        Math.random().toString(36).substring(2, 9) +
        new Date().getTime().toString(36)
      );
    };

    try {
      const newPlayer = {
        id: generateId(),
        name: name.trim(),
      };

      setPlayers((prev) => [...prev, newPlayer]);
    } catch (error) {
      console.error("Erro ao adicionar jogador:", error);
    }
  }

  function removePlayer(id: string) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  }

  function clearPlayers() {
    setPlayers([]);
  }

  return (
    <PlayersContext.Provider
      value={{
        players,
        setPlayer: setPlayers,
        addPlayer,
        removePlayer,
        clearPlayers,
      }}
    >
      {children}
    </PlayersContext.Provider>
  );
}
