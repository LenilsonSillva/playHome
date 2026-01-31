import styles from "./newHostModal.module.css";

export function NewHostModal({ onConfirm }: { onConfirm: () => void }) {
  return (
    <div className={styles.overlay}>
      <div className={`glass-panel ${styles.modal}`}>
        {/* Luz pulsante de autorização */}
        <div className={styles.scanEffect} />

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <span className={styles.mainIcon}>👨‍✈️</span>
            <div className={styles.ring} />
          </div>

          <header className={styles.header}>
            <div className={styles.alertBadge}>SISTEMA ATUALIZADO</div>
            <h2 className={styles.title}>
              COMANDO <span>TRANSFERIDO</span>
            </h2>
          </header>

          <div className={styles.infoBox}>
            <p className={styles.mainText}>
              O comandante anterior perdeu a conexão com a base.
            </p>
            <div className={styles.promotionBadge}>
              VOCÊ FOI PROMOVIDO A LÍDER DA MISSÃO
            </div>
          </div>

          <button className={styles.confirmBtn} onClick={onConfirm}>
            ASSUMIR CONTROLE 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
