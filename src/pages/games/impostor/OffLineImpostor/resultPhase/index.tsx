import { useNavigate } from "react-router-dom";
import type {
  GameRouteState,
  ImpostorGameState,
} from "../../GameLogistic/types";
import { PlayerAvatar } from "../PlayerAvatar/PlayerAvatar";
import "./resultPhase.css";

type DiscussPhaseProps = {
  data: GameRouteState["data"];
  onNextPhase: (phase: ImpostorGameState["phase"]) => void;
  onNextRound?: () => void;
};

export function ResultPhase({
  data,
  onNextPhase,
  onNextRound,
}: DiscussPhaseProps) {
  const navigate = useNavigate();

  // 1. Cálculos de sobreviventes
  const alivePlayers = data.players.filter((p) => p.isAlive);
  const aliveImpostors = alivePlayers.filter((p) => p.isImpostor).length;
  const aliveCrew = alivePlayers.length - aliveImpostors;

  // 2. Lógica de Vitória (Refinada)
  const crewWon = aliveImpostors === 0;
  // Impostores vencem se o número deles for >= ao da tripulação (Ex: 1x1, 2x2, 2x1)
  const impostorsWon = aliveImpostors >= aliveCrew && aliveImpostors > 0;
  const gameOver = crewWon || impostorsWon;

  // 3. Cálculo de Pontos (Mesma lógica do handleNextRound no pai)
  const getRoundPoints = (p: any) => {
    if (p.isImpostor) return p.isAlive ? 2 : -1.5;
    return p.isAlive ? 1 : 0;
  };

  // Mapeia jogadores com pontos da rodada e total acumulado para o pódio
  const playersWithTotalScore = data.players
    .map((p) => ({
      ...p,
      roundPoints: getRoundPoints(p),
      totalScore: (p.score || 0) + getRoundPoints(p),
    }))
    .sort((a, b) => b.totalScore - a.totalScore); // Do maior para o menor

  const podium = playersWithTotalScore.slice(0, 3);
  const others = playersWithTotalScore.slice(3);

  return (
    <div className="main-bg result-screen">
      <div className="glass-panel result-container">
        {/* BANNER DE VITÓRIA */}
        {gameOver ? (
          <div
            className={`victory-banner ${crewWon ? "crew-bg" : "impostor-bg"}`}
          >
            <h1 className="victory-title">
              {crewWon ? "VITÓRIA DA TRIPULAÇÃO" : "VITÓRIA DOS IMPOSTORES"}
            </h1>
            <p className="victory-subtitle">
              {crewWon
                ? "Todos os impostores foram ejetados da nave."
                : `A tripulação não tem mais votos suficientes. Restaram ${aliveCrew} tripulante(s).`}
            </p>
          </div>
        ) : (
          /* Caso o jogo ainda não tenha acabado (fluxo de segurança) */
          <div className="round-report-header">
            <h2 className="tech-title">RELATÓRIO DE STATUS</h2>
            <p className="status-text">
              A missão continua. Tripulantes: {aliveCrew} | Impostores:{" "}
              {aliveImpostors}
            </p>
          </div>
        )}

        {/* PÓDIO - TOP 3 */}
        <div className="podium-section">
          <h3 className="section-label">LÍDERES DA MISSÃO</h3>
          <div className="podium-grid">
            {podium.map((p, index) => (
              <div key={p.id} className={`podium-item rank-${index + 1}`}>
                <div className="rank-badge">{index + 1}º</div>
                {/* Avatar com tamanho maior para o 1º lugar */}
                <PlayerAvatar
                  emoji={(p as any).emoji}
                  color={p.color}
                  size={index === 0 ? 85 : 65}
                />
                <span className="p-name">{p.name}</span>
                <span className="p-score">{p.totalScore} pts</span>
                {/* Revela quem era impostor apenas no pódio final */}
                {p.isImpostor && <span className="p-role">IMPOSTOR</span>}
              </div>
            ))}
          </div>
        </div>

        {/* LISTA GERAL (RESTO DOS JOGADORES) */}
        {others.length > 0 && (
          <div className="others-section">
            <h3 className="section-label">REGISTROS ADICIONAIS</h3>
            <div className="others-list">
              {others.map((p) => (
                <div key={p.id} className="other-item">
                  <span className="other-emoji">{(p as any).emoji}</span>
                  <span className="other-name">{p.name}</span>
                  <div className="other-info-main">
                    {p.isImpostor && (
                      <span className="p-role-small">IMPOSTOR</span>
                    )}
                  </div>
                  <div className="other-stats">
                    <span
                      className="round-pts"
                      style={{
                        color:
                          p.roundPoints > 0
                            ? "var(--success)"
                            : "var(--danger-neon)",
                      }}
                    >
                      {p.roundPoints > 0 ? `+${p.roundPoints}` : p.roundPoints}
                    </span>
                    <span className="total-pts">{p.totalScore} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AÇÕES FINAIS */}
        <div className="result-actions">
          {gameOver ? (
            <>
              <button className="primary-btn pulse" onClick={onNextRound}>
                PRÓXIMA PALAVRA
              </button>
              <button
                className="secondary-btn"
                onClick={() => navigate("/games/impostor/lobby")}
              >
                VOLTAR AO LOBBY
              </button>
            </>
          ) : (
            <button
              className="primary-btn"
              onClick={() => onNextPhase("discussion")}
            >
              RETORNAR À DISCUSSÃO
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
