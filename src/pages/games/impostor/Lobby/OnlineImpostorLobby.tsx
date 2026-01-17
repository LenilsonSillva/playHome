import { useNavigate } from "react-router-dom";
import styles from "./OnlineLobby.module.css";

export function OnlineImpostorLobby() {
  const navigate = useNavigate();

  return (
    <div className={styles.pageWrapper}>
      {/* Elementos de luz ambiente para combinar com a Home */}
      <div className={styles.ambientLight} />

      <main className={styles.container}>
        <div className={`glass-panel ${styles.statusCard}`}>
          <div className={styles.header}>
            <div className={styles.signalIcon}>
              <span className={styles.wave}></span>
              <span className={styles.wave}></span>
              <span className={styles.wave}></span>
              <div className={styles.lockIcon}>📡</div>
            </div>
            <div className={styles.badge}>SISTEMA DE COMUNICAÇÃO</div>
          </div>

          <div className={styles.content}>
            <h1 className={styles.title}>
              MODO <span>ONLINE</span>
            </h1>
            <div className={styles.statusLine}>
              <span className={styles.dot} />
              <p className={styles.statusText}>STATUS: EM DESENVOLVIMENTO</p>
            </div>

            <p className={styles.description}>
              Os protocolos de conexão intergaláctica estão sendo calibrados. Em
              breve você poderá enfrentar impostores de outras galáxias em tempo
              real.
            </p>
          </div>

          <div className={styles.progressBox}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>
            <span className={styles.percentage}>
              CALIBRANDO SINCRONIA... 65%
            </span>
          </div>

          <button className={styles.backButton} onClick={() => navigate("/")}>
            RETORNAR AO COMANDO CENTRAL
          </button>
        </div>
      </main>
    </div>
  );
}
