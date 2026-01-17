import { useState } from "react";
import type { GameRouteState } from "../../GameLogistic/types";
import "./eliminationPhase.css";
import { PlayerAvatar } from "../PlayerAvatar/PlayerAvatar";

type EliminationProps = {
  data: GameRouteState["data"];
  onEliminate: (id: string | null) => void; // Adicione isso
};

export function EliminationPhase({ data, onEliminate }: EliminationProps) {
  const alivePlayers = data.players.filter((p) => p.isAlive);
  const [eliminatedId, setEliminatedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  function handleEliminate(id: string | null) {
    setEliminatedId(id);
    setConfirmed(true);
  }

  function handleAdvance() {
    if (eliminatedId) {
      const idx = data.players.findIndex((p) => p.id === eliminatedId);
      if (idx !== -1) {
        data.players[idx].isAlive = false;
      }
    }
    onEliminate(eliminatedId);
  }

  if (confirmed) {
    const eliminatedPlayer = alivePlayers.find((p) => p.id === eliminatedId);
    // Dados do card do player
    const playerRole = [
      "Engenheiro de Dobra",
      "Xenobiologista",
      "Piloto de Fuga",
      "Técnico de O2",
      "Cientista de Dados",
    ][(eliminatedPlayer?.name.length || 0) % 5];
    const serialNumber = `SN-${eliminatedId?.slice(0, 4).toUpperCase() || "NULL"}`;

    return (
      <div className="main-bg elimination-screen">
        <div className="glass-panel host-panel confirmation-view">
          <h2 className="tech-title">PROTOCOLO DE EXPULSÃO</h2>

          {eliminatedPlayer ? (
            <div className="id-card">
              <div
                className="id-card-header"
                style={{ backgroundColor: eliminatedPlayer.color }}
              >
                <span>REGISTRO DE SEGURANÇA</span>
                <span>{serialNumber}</span>
              </div>

              <div className="id-card-body">
                <div className="id-avatar-wrapper">
                  <PlayerAvatar
                    emoji={(eliminatedPlayer as any).emoji}
                    color={eliminatedPlayer.color}
                    size={80}
                  />
                </div>

                <div className="id-info">
                  <div className="info-group">
                    <label>NOME</label>
                    <p className="info-value">
                      {eliminatedPlayer.name.toUpperCase()}
                    </p>
                  </div>

                  <div className="info-row">
                    <div className="info-group">
                      <label>FUNÇÃO</label>
                      {eliminatedPlayer.isImpostor ? (
                        <p
                          style={{ color: "var(--danger-neon)" }}
                          className="info-value"
                        >
                          IMPOSTOR
                        </p>
                      ) : (
                        <p className="info-value">{playerRole}</p>
                      )}
                    </div>
                    <div className="info-group">
                      <label>STATUS</label>
                      <p
                        className="info-value"
                        style={{ color: "var(--danger-neon)" }}
                      >
                        TERMINATED
                      </p>
                    </div>
                  </div>

                  <div className="info-group">
                    <label>DATA/HORA DO REGISTRO</label>
                    <p className="info-value">
                      {new Date().toLocaleDateString()} |{" "}
                      {new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Carimbo Visual */}
              <div className="id-stamp">ELIMINADO</div>
            </div>
          ) : (
            <div className="neutral-card">
              <h3 className="no-elimination">NENHUM TRIPULANTE FOI EXPULSO</h3>
              <p>O Protocolo de Segurança permanece intacto.</p>
            </div>
          )}

          <button className="primary-btn pulse" onClick={handleAdvance}>
            CONTINUAR MISSÃO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg elimination-screen">
      <div className="glass-panel host-panel">
        <div className="host-header">
          <div className="host-icon">🛠️</div>
          <div>
            <h2 className="tech-title">CONTROLE DO HOST</h2>
            <p className="instruction">
              Selecione quem a maioria decidiu ejetar da nave:
            </p>
          </div>
        </div>

        <div className="players-grid-manual">
          {alivePlayers.map((p) => (
            <button
              key={p.id}
              className="player-target-card"
              onClick={() => handleEliminate(p.id)}
            >
              <span className="player-emoji">{(p as any).emoji}</span>
              <span className="player-name">{p.name}</span>
              <div className="target-overlay">ELIMINAR</div>
            </button>
          ))}
        </div>

        <button className="skip-btn" onClick={() => handleEliminate(null)}>
          PULAR ELIMINAÇÃO (EMPATE / VOTOS NULOS)
        </button>
      </div>
    </div>
  );
}
