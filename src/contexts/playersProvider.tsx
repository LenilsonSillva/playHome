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

    setPlayers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim() },
    ]);
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
