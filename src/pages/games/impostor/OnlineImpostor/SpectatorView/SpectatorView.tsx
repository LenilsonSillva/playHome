import { PlayerAvatar } from "../../../../../components/PlayerAvatar/PlayerAvatar";
import styles from "./spectatorView.module.css";

export function SpectatorView({ gameData }: { gameData: any }) {
  const rawPlayers = gameData.players ?? gameData.allPlayers ?? [];

  const players = (rawPlayers || []).map((p: any) => ({
    id: p.id ?? p.socketId,
    name: p.name,
    emoji: p.emoji,
    color: p.color,
    isAlive: typeof p.isAlive === "boolean" ? p.isAlive : true,
    voted: !!p.voted,
    ready: !!p.ready,
    score: p.globalScore ?? p.score ?? 0,
  }));

  const phasePortuguese = () => {
    switch (gameData.phase) {
      case "reveal":
        return "REVELAÇÃO";
      case "discussion":
        return "DISCUTINDO";
      case "voting":
        return "VOTAÇÃO";
      case "result":
        return "RESULTADO";
      default:
        return null;
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.scanline} />

      <main className={styles.container}>
        <div className={`glass-panel ${styles.mainCard}`}>
          <header className={styles.header}>
            <div className={styles.liveIndicator}>
              <span className={styles.dot} />
              LIVE FEED
            </div>
            <h1 className={styles.title}>
              OBSERVADOR <span>TÁTICO</span>
            </h1>
            <p className={styles.subtitle}>
              Monitoramento de tripulação em tempo real
            </p>
          </header>

          <div className={styles.statusBox}>
            <div className={styles.phaseBadge}>
              ESTADO DO SISTEMA: <strong>{phasePortuguese()}</strong>
            </div>
          </div>

          <section className={styles.squadSection}>
            <h3 className={styles.label}>ESTADO DOS TRIPULANTES</h3>

            <div className={styles.playerGrid}>
              {players.map((p: any) => (
                <div
                  key={p.id}
                  className={`${styles.playerCard} ${!p.isAlive ? styles.dead : ""}`}
                >
                  <div className={styles.avatarMini}>
                    <PlayerAvatar
                      emoji={p.emoji}
                      color={p.isAlive ? p.color : "#475569"}
                      size={45}
                      hideScan={!p.isAlive}
                    />
                  </div>

                  <div className={styles.playerInfo}>
                    <span className={styles.name}>{p.name}</span>
                    <span className={styles.statusText}>
                      {p.isAlive ? "SINAL ATIVO" : "SINAL PERDIDO"}
                    </span>
                  </div>

                  <div className={styles.playerMeta}>
                    <span className={styles.score}>{p.score} PTS</span>
                    {gameData.phase === "voting" && p.isAlive && (
                      <span
                        className={`${styles.voteIndicator} ${p.voted ? styles.voted : ""}`}
                      >
                        {p.voted ? "VOTOU" : "PENDENTE"}
                      </span>
                    )}
                    {gameData.phase === "reveal" && (
                      <span
                        className={`${styles.readyFlag} ${p.ready ? styles.isReady : ""}`}
                      >
                        {p.ready ? "PRONTO" : "LENDO"}
                      </span>
                    )}
                  </div>

                  {!p.isAlive && <div className={styles.deadOverlay}>KIA</div>}
                </div>
              ))}
            </div>
          </section>

          <footer className={styles.footer}>
            <div className={styles.loadingInfo}>
              <div className={styles.spinner} />
              AGUARDANDO FINALIZAÇÃO DA RODADA...
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
