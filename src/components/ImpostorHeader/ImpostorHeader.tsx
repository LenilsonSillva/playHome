import styles from "./impostorHeader.module.css";
import "../../styles/theme.css";
type ChildProps = {
  mode: (value: string) => void;
  currentMode: string | null;
};

export function ImpostorHeader({ mode, currentMode }: ChildProps) {
  return (
    <div className={styles["lobby-container"]}>
      <div className={styles["title-header"]}>
        <a className={styles["header-title"]} href="/">
          PlayHome
        </a>
      </div>
      <div className={styles["lobby-container"]}>
        <h1 className={styles.gameTitle}>
          IMPOSTOR <span className={styles.shhEmoji}>🤫</span>
        </h1>
        <div className={styles["select-btn-container"]}>
          <button
            className={`${styles["select-btn-base"]} ${styles["btn-left"]} ${currentMode === "local" ? styles.active : ""}`}
            onClick={() => mode("local")}
          >
            Jogo Local 🏠
          </button>
          <button
            className={`${styles["select-btn-base"]} ${styles["btn-right"]} ${currentMode === "online" ? styles.active : ""}`}
            onClick={() => mode("online")}
          >
            Jogo Online 🌏
          </button>
        </div>
      </div>
    </div>
  );
}
