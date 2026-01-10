import { Link } from "react-router-dom";
import type { Game } from "../../types/game";
import styles from "./styles.module.css";

type Props = {
  game: Game;
};

export function GameCard({ game }: Props) {
  return (
    <div className={styles.gameCard}>
      <h2>{game.name}</h2>
      <p>{game.description}</p>

      <small>
        Jogadores: {game.minPlayers} – {game.maxPlayers}
      </small>

      <Link to={game.route}>
        <button>Jogar</button>
      </Link>
    </div>
  );
}
