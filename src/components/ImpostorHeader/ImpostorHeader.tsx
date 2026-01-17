import styles from "./impostorHeader.module.css";
import "../../styles/theme.css";

type ChildProps = {
  mode: (value: string) => void;
  currentMode: string | null;
};

export function ImpostorHeader({ mode, currentMode }: ChildProps) {
  return (
    <div className={styles.wrapper}>
      {/* Luz ambiente de fundo (opcional, para combinar com a home) */}
      <div className={styles.ambientLight} />

      <header className={styles.topHeader}>
        <a className={styles.logoLink} href="/">
          <h1 className={styles.mainTitle}>
            PLAY<span>HOME</span>
          </h1>
        </a>
        <div className={styles.systemBadge}>SISTEMA DE JOGOS</div>
      </header>

      <div className={styles.gameSection}>
        <h1 className={styles.gameTitle}>
          IMPOSTOR <span className={styles.shhEmoji}>🤫</span>
        </h1>

        <p className={styles.instruction}>SELECIONE O PROTOCOLO DE CONEXÃO</p>

        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${currentMode === "local" ? styles.active : ""}`}
            onClick={() => mode("local")}
          >
            <span className={styles.btnIcon}>🏠</span>
            <span className={styles.btnText}>Jogo Local</span>
          </button>

          <button
            className={`${styles.modeBtn} ${currentMode === "online" ? styles.active : ""}`}
            onClick={() => mode("online")}
          >
            <span className={styles.btnIcon}>🌏</span>
            <span className={styles.btnText}>Jogo Online</span>
          </button>

          {/* Slider de fundo para o efeito de seleção */}
          <div
            className={`${styles.slider} ${currentMode === "online" ? styles.slideRight : ""}`}
          />
        </div>
      </div>
    </div>
  );
}
