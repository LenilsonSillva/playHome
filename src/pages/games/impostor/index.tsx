import LobbyImportor from "./Lobby";
import styles from "./index-impostor.module.css";
import { ImpostorBG } from "../../../components/ImpostorBackground/ImpostorBG";

export function Impostor() {
  return (
    <div className={styles.main}>
      <ImpostorBG />
      <div className={styles.contentWrapper}>
        <LobbyImportor />
      </div>
    </div>
  );
}
