import styles from "./secretWordHeader.module.css";
import "../../../src/styles/theme.css";

type ChildProps = {
  mode: (value: "blitz" | "duel") => void;
  currentMode: string | null;
};

export function SecretWordHeader({ mode, currentMode }: ChildProps) {
  return (
    <div className={styles.wrapper}>
      {/* Luz ambiente azul para combinar com o tema Tech/Ciano do jogo */}
      <div className={styles.ambientLight} />

      <header className={styles.topHeader}>
        <a className={styles.logoLink} href="/">
          <h1 className={styles.mainTitle}>
            PLAY<span>HOME</span>
          </h1>
        </a>
        <div className={styles.systemBadge}>PROTOCOLO CRIPTOGRAFIA</div>
      </header>

      <div className={styles.gameSection}>
        <h1 className={styles.gameTitle}>
          CRIPTOGRAFIA<span className={styles.shhEmoji}>🔑</span>
        </h1>

        <p className={styles.instruction}>SELECIONE O MODO DE OPERAÇÃO</p>

        <div className={styles.modeSelector}>
          <button
            className={`${styles.modeBtn} ${currentMode === "blitz" ? styles.active : ""}`}
            onClick={() => mode("blitz")}
          >
            <span className={styles.btnIcon}>👨🏽‍👩🏻‍👧🏽‍👦🏻</span>
            <span className={styles.btnText}>Infiltração</span>
          </button>

          <button
            className={`${styles.modeBtn} ${currentMode === "duel" ? styles.active : ""}`}
            onClick={() => mode("duel")}
          >
            <span className={styles.btnIcon}>👫🏻</span>
            <span className={styles.btnText}>INTERCEPTAÇÃO</span>
          </button>

          {/* O slider aqui usa a cor Ciano/Azul por padrão do jogo */}
          <div
            className={`${styles.slider} ${currentMode === "duel" ? styles.slideRight : ""}`}
          />
        </div>
      </div>
    </div>
  );
}
