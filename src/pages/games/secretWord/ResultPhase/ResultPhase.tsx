import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SecretWordGameState } from "../GameLogistic/types";
import { usePlayers } from "../../../../contexts/contextHook";
import styles from "./resultPhase.module.css";

type Props = {
  data: SecretWordGameState;
  onNextRound: () => void;
};

export function ResultPhase({ data, onNextRound }: Props) {
  const navigate = useNavigate();
  const { players } = usePlayers();
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>(
    {},
  );

  const sortedTeams = [...data.teams].sort((a, b) => b.score - a.score);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.badge}>DADOS DESCRIPTOGRAFADOS</div>
        <h1 className={styles.title}>
          RANKING DE <span>MISSÃO</span>
        </h1>
      </header>

      <div className={styles.podium}>
        {sortedTeams.map((team, index) => (
          <div
            key={team.id}
            className={`${styles.teamCard} ${index === 0 ? styles.winner : ""}`}
            style={{ "--team-color": team.color } as React.CSSProperties}
          >
            <div className={styles.rankBadge}>{index + 1}º</div>

            <div className={styles.teamMainInfo}>
              <div>
                <h2 className={styles.teamName}>{team.name}</h2>
                {/* NOMES DOS INTEGRANTES (DISCRETO) */}
                <p className={styles.membersList}>
                  {team.playerIds
                    .map((id) => players.find((p) => p.id === id)?.name)
                    .join(", ")}
                </p>
              </div>
              <div className={styles.scoreDisplay}>
                <div className={styles.scoreRow}>
                  {/* Só mostra o ganho se o time fez pontos E se não for a primeira rodada 
                        (identificamos isso se o score total for maior que o ganho da rodada) */}
                  {team.roundScore > 0 && team.score > team.roundScore && (
                    <span className={styles.roundPointsGain}>
                      +{team.roundScore}
                    </span>
                  )}
                  <span className={styles.scoreValue}>{team.score}</span>
                </div>
                <span className={styles.scoreLabel}>PONTOS</span>
              </div>
            </div>

            <button
              className={styles.logBtn}
              onClick={() =>
                setExpandedTeams((prev) => ({
                  ...prev,
                  [team.id]: !prev[team.id],
                }))
              }
            >
              {expandedTeams[team.id]
                ? "OCULTAR ACERTOS"
                : `VER ${team.wordsGuessed.length} ACERTOS`}
            </button>

            {expandedTeams[team.id] && (
              <div className={styles.wordsLog}>
                <div className={styles.wordsGrid}>
                  {team.wordsGuessed.length > 0 ? (
                    team.wordsGuessed.map((word, i) => (
                      <span key={i} className={styles.wordTag}>
                        {word}
                      </span>
                    ))
                  ) : (
                    <span className={styles.noWords}>
                      Nenhum sinal interceptado.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.nextBtn} onClick={onNextRound}>
          NOVA RODADA 🚀
        </button>
        <button
          className={styles.lobbyBtn}
          onClick={() => navigate("/games/secretWord/lobby")}
        >
          LOBBY ⚙️
        </button>
      </div>
    </div>
  );
}
