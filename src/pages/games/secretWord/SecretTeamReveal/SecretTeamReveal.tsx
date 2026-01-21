import type { SecretWordGameState } from "../GameLogistic/types";
import { usePlayers } from "../../../../contexts/contextHook";
import styles from "./teamReveal.module.css";
import { useEffect } from "react";

type Props = {
  data: SecretWordGameState;
  onUpdateTeams: (teams: any[]) => void;
  onConfirm: () => void;
  onEdit: () => void;
};

export function SecretTeamReveal({
  data,
  onUpdateTeams,
  onConfirm,
  onEdit,
}: Props) {
  const { players } = usePlayers();

  // Sorteia operadores aleatórios para times que ainda não tem um definido
  useEffect(() => {
    const needsUpdate = data.teams.some((t) => !t.operatorId);
    if (needsUpdate) {
      const updatedTeams = data.teams.map((team) => {
        if (!team.operatorId) {
          const randomIdx = Math.floor(Math.random() * team.playerIds.length);
          return { ...team, operatorId: team.playerIds[randomIdx] };
        }
        return team;
      });
      onUpdateTeams(updatedTeams);
    }
  }, []);

  const handleSelectOperator = (teamId: string, playerId: string) => {
    const updatedTeams = data.teams.map((t) =>
      t.id === teamId ? { ...t, operatorId: playerId } : t,
    );
    onUpdateTeams(updatedTeams);
  };

  const handleRandomOperator = (teamId: string) => {
    const team = data.teams.find((t) => t.id === teamId);
    if (!team) return;
    const otherPlayers = team.playerIds;
    const randomPlayerId =
      otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
    handleSelectOperator(teamId, randomPlayerId);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>RECONHECIMENTO DE UNIDADES</div>
        <h2 className={styles.title}>ESQUADRÕES FORMADOS</h2>
      </header>

      <div className={styles.teamsGrid}>
        {data.teams.map((team, idx) => (
          <div
            key={team.id}
            className={`glass-panel ${styles.teamCard}`}
            style={{ "--team-color": team.color } as React.CSSProperties}
          >
            <div className={styles.teamHeader}>
              <span className={styles.teamIndex}>0{idx + 1}</span>
              <h3 className={styles.teamName}>{team.name}</h3>
            </div>

            <div className={styles.membersList}>
              <p className={styles.roleLabel}>
                SELECIONE O OPERADOR (QUEM DÁ AS DICAS):
              </p>
              {team.playerIds.map((id) => {
                const player = players.find((p) => p.id === id);
                const isOperator = team.operatorId === id;
                return (
                  <button
                    key={id}
                    className={`${styles.memberBtn} ${isOperator ? styles.activeOperator : ""}`}
                    onClick={() => handleSelectOperator(team.id, id)}
                  >
                    <div className={styles.memberInfo}>
                      <span className={styles.statusDot} />
                      {player?.name}
                    </div>
                    {isOperator && (
                      <span className={styles.operatorBadge}>OPERADOR</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              className={styles.randomSubBtn}
              onClick={() => handleRandomOperator(team.id)}
            >
              🎲 SORTEAR JOGADOR
            </button>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <p className={styles.instruction}>
          Defina quem será o Operador de cada esquadrão antes de prosseguir.
        </p>

        <div className={styles.buttonGroup}>
          <button className={styles.editBtn} onClick={onEdit}>
            ⚙️ EDITAR TIMES
          </button>
          <button className={styles.confirmBtn} onClick={onConfirm}>
            INICIAR REVELAÇÃO 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
