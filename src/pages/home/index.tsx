import { GameCard } from "../../components/GameCard/GameCard";
import { PlayerContextProvider } from "../../contexts/playersProvider";
import type { Game } from "../../types/game";
import styles from "./styles.module.css";

export default function Home() {
  const games: Game[] = [
    {
      id: "impostor",
      name: "Impostor",
      description: "Descubra quem é o impostor antes que seja tarde.",
      minPlayers: 3,
      maxPlayers: 20,
      route: "/games/impostor/lobby",
    },
  ];

  return (
    <PlayerContextProvider>
      <main className={styles.homeContainer}>
        <h1>🎮 Party Games</h1>
        <p>Escolha um jogo para começar</p>

        <div className={styles.gamesGrid}>
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </main>
    </PlayerContextProvider>
  );
}
