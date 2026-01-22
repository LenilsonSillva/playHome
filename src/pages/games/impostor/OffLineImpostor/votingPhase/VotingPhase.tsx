import { useState, useEffect, useRef } from "react";
import type { GameRouteState } from "../../GameLogistic/types";
import "./votingPhase.css"; // Certifique-se de criar este arquivo
import { PlayerAvatar } from "../../../../../components/PlayerAvatar/PlayerAvatar";
import impostorSd from "./../../../../../assets/sounds/impostor.mp3";
import votingSd from "./../../../../../assets/sounds/skip.ogg";

type VotingProps = {
  data: GameRouteState["data"];
  onEliminate: (id: string | null) => void; // Adicione isso
};

export function VotingPhase({ data, onEliminate }: VotingProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [votes, setVotes] = useState<{ voter: string; voted: string }[]>([]);
  const alivePlayers = data.players.filter((p) => p.isAlive);
  const [currentVoterIdx, setCurrentVoterIdx] = useState(0);
  const currentVoter = alivePlayers[currentVoterIdx];
  const [seconds, setSeconds] = useState(60);
  const [finished, setFinished] = useState(false);
  const [, setFeedback] = useState<"none" | "isImpostor">("none");
  const impostorSound = useRef(new Audio(impostorSd));
  const votingSound = useRef(new Audio(votingSd));

  const playSound = (audioRef: React.RefObject<HTMLAudioElement>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reinicia o áudio se ele já estiver tocando
      audioRef.current.play().catch(() => {}); // Evita erro de interação do navegador
    }
  };

  const triggerFeedback = (type: "isImpostor") => {
    if (type === "isImpostor") {
      playSound(impostorSound); // Usa a função auxiliar
      if ("vibrate" in navigator) {
        navigator.vibrate(200);
      }
      setTimeout(() => setFeedback("none"), 10);
    }
  };

  useEffect(() => {
    if (finished) {
      const eliminatedId = getEliminatedPlayer();
      const eliminatedPlayer = alivePlayers.find((p) => p.id === eliminatedId);

      if (eliminatedPlayer?.isImpostor) {
        triggerFeedback("isImpostor");
      }

      return;
    }

    if (seconds === 0) {
      handleVote("NULO");
      playSound(votingSound);
      return;
    }

    const interval = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(interval);
  }, [seconds, finished]);

  function handleVote(votedId: string) {
    setVotes((prev) => [...prev, { voter: currentVoter.id, voted: votedId }]);
    playSound(votingSound);
    if (currentVoterIdx < alivePlayers.length - 1) {
      setCurrentVoterIdx(currentVoterIdx + 1);
      setSeconds(60);
    } else {
      setFinished(true);
    }
  }

  function getEliminatedPlayer() {
    const voteCount: Record<string, number> = {};
    votes.forEach((v) => {
      if (v.voted !== "NULO")
        voteCount[v.voted] = (voteCount[v.voted] || 0) + 1;
    });
    let maxVotes = 0;
    let candidates: string[] = [];
    Object.entries(voteCount).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        candidates = [id];
      } else if (count === maxVotes) candidates.push(id);
    });
    return candidates.length !== 1 || maxVotes === 0 ? null : candidates[0];
  }

  if (finished) {
    const eliminatedId = getEliminatedPlayer();
    const eliminatedPlayer = alivePlayers.find((p) => p.id === eliminatedId);

    const voteCount: Record<string, number> = {};
    votes.forEach((v) => {
      if (v.voted !== "NULO")
        voteCount[v.voted] = (voteCount[v.voted] || 0) + 1;
    });

    // Dados para o card (Mantenha a lógica idêntica ao EliminationPhase)
    const playerRole = [
      "Engenheiro de Dobra",
      "Xenobiologista",
      "Piloto de Fuga",
      "Técnico de O2",
      "Cientista de Dados",
    ][(eliminatedPlayer?.name.length || 0) % 5];
    const serialNumber = `SN-${eliminatedId?.slice(0, 4).toUpperCase() || "NULL"}`;

    const handleResult = () => {
      if (eliminatedId) {
        const idx = data.players.findIndex((p) => p.id === eliminatedId);
        if (idx !== -1) data.players[idx].isAlive = false;
      }
      // Aqui chamamos a função que você criou no pai para verificar fim de jogo
      onEliminate(eliminatedId);
    };

    return (
      <div className="main-bg voting-screen">
        <div className="glass-panel result-container">
          <h2 className="tech-title">RELATÓRIO DE VOTAÇÃO</h2>

          {/* INÍCIO DO CARD DE IDENTIDADE REUTILIZADO */}
          {eliminatedPlayer ? (
            <div className="id-card" style={{ marginBottom: "30px" }}>
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

              <div className="id-stamp">ELIMINADO</div>
            </div>
          ) : (
            /* CARD NEUTRO PARA EMPATE */
            <div className="neutral-card">
              <h3 className="no-elimination">
                EMPATE: NENHUM TRIPULANTE FOI EXPULSO
              </h3>
              <p>O Protocolo de Segurança permanece intacto.</p>
            </div>
          )}
          {/* FIM DO CARD DE IDENTIDADE */}

          <div className="vote-summary">
            {alivePlayers.map((p) => (
              <div key={p.id} className="summary-item">
                <span className="player-name-label">{p.name}</span>
                <div className="vote-bar-bg">
                  <div
                    className="vote-bar-fill"
                    style={{
                      width: `${((voteCount[p.id] || 0) / alivePlayers.length) * 100}%`,
                    }}
                  ></div>
                </div>
                <span className="vote-qty">{voteCount[p.id] || 0}</span>
              </div>
            ))}
          </div>

          <div className="actions-gap">
            <button
              className="secondary-btn"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "OCULTAR LOGS" : "VER LOGS DE SISTEMA"}
            </button>

            {showDetails && (
              <div className="logs-area">
                {votes.map((v, idx) => (
                  <p key={idx} className="log-entry">
                    &gt; {alivePlayers.find((p) => p.id === v.voter)?.name}{" "}
                    VOTOU EM{" "}
                    {v.voted === "NULO"
                      ? "NULO"
                      : alivePlayers.find((p) => p.id === v.voted)?.name}
                  </p>
                ))}
              </div>
            )}

            <button className="primary-btn" onClick={handleResult}>
              PROSSEGUIR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-bg voting-screen">
      <div className="glass-panel voting-container">
        <div className="voting-header">
          <div className="timer-circle">
            <span
              key={seconds <= 10 ? "critical" : "normal"}
              className={seconds <= 10 ? "critical" : ""}
            >
              {seconds}s
            </span>
          </div>
          <div className="voter-info">
            <p className="label">VOTANDO AGORA</p>
            <h2 className="current-voter-name">{currentVoter.name}</h2>
          </div>
        </div>

        <p className="instruction">Selecione o suspeito para ejetar da nave:</p>

        <div className="players-grid">
          {alivePlayers
            .filter((p) => p.id !== currentVoter.id)
            .map((p) => (
              <button
                key={p.id}
                className="player-vote-card"
                onClick={() => handleVote(p.id)}
              >
                <span className="player-emoji">{(p as any).emoji}</span>
                <span className="player-name">{p.name}</span>
                <div className="vote-hover-overlay">VOTAR</div>
              </button>
            ))}
        </div>

        <button className="null-btn" onClick={() => handleVote("NULO")}>
          ABSTER-SE / VOTO NULO
        </button>

        <div className="voted-status">
          <p className="status-title">STATUS DA TRIPULAÇÃO</p>
          <div className="status-dots">
            {alivePlayers.map((p) => (
              <div
                key={p.id}
                className={`dot ${votes.some((v) => v.voter === p.id) ? "active" : ""}`}
                title={p.name}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
