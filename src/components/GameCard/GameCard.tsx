import { Link } from "react-router-dom";
import type { Game } from "../../types/game";
import styles from "./GameCard.module.css";

type Props = {
  game: Game & { icon: string; accent: string; btn: string };
};

export function GameCard({ game }: Props) {
  return (
    <div
      className={`glass-panel ${styles.card}`}
      style={
        {
          "--accent": game.accent,
          "--btn-grad": game.btn,
        } as React.CSSProperties
      }
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>{game.icon}</div>
        <div className={styles.playerBadge}>
          {game.minPlayers}-{game.maxPlayers} JOGADORES
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{game.name}</h2>
        <p className={styles.desc}>{game.description}</p>
      </div>

      <Link to={game.route} className={styles.link}>
        <button className={styles.playBtn}>INICIAR PROTOCOLO</button>
      </Link>

      {/* Brilho interno ao passar o mouse */}
      <div className={styles.glow} />
    </div>
  );
}
