
import type { GameRouteState, ImpostorGameState } from "../../GameLogistic/types";
import { useNavigate } from "react-router-dom";
type DiscussPhaseProps = {
    data: GameRouteState["data"];
    onNextPhase: (phase: ImpostorGameState["phase"]) => void;
    onNextRound?: () => void;
}

export function ResultPhase({ data, onNextPhase, onNextRound }: DiscussPhaseProps) {
    const navigate = useNavigate();
    // Jogadores eliminados nesta rodada
    const eliminatedPlayers = data.players.filter(p => !p.isAlive);
    const impostors = data.players.filter(p => p.isImpostor);
    const aliveImpostors = impostors.filter(p => p.isAlive);
    const eliminatedImpostors = impostors.filter(p => !p.isAlive);
    const alivePlayers = data.players.filter(p => p.isAlive);
    const survivors = alivePlayers.filter(p => !p.isImpostor);

    // Pontuação
    const scores: Record<string, number> = {};
    data.players.forEach(p => {
        if (p.isImpostor) {
            if (p.isAlive) {
                scores[p.name] = 2;
            } else {
                scores[p.name] = -1.5;
            }
        } else {
            if (p.isAlive) {
                scores[p.name] = 1;
            } else {
                scores[p.name] = 0;
            }
        }
    });

    // Mensagem de resultado
    let resultMsg = "";
    if (eliminatedImpostors.length > 0) {
        resultMsg = `Impostor${eliminatedImpostors.length > 1 ? 'es' : ''} eliminado${eliminatedImpostors.length > 1 ? 's' : ''}!`;
    } else {
        resultMsg = "Nenhum impostor foi eliminado nesta rodada.";
    }

    // Lógica de fim de jogo
    const impostorsLeft = aliveImpostors.length;
    const totalAlive = alivePlayers.length;
    const onlyImpostorsAlive = impostorsLeft === totalAlive && totalAlive > 0;
    const twoPlayersLeftWithImpostor = totalAlive === 2 && aliveImpostors.length >= 1;
    const gameOver = impostorsLeft === 0 || onlyImpostorsAlive || twoPlayersLeftWithImpostor;

    return (
        <div>
            <h2>Resultado da Rodada</h2>
            <p>{resultMsg}</p>
            <p>Total de jogadores vivos: <strong>{totalAlive}</strong></p>
            {impostors.length > 1 && (
                <p>Impostores restantes: <strong>{impostorsLeft}</strong></p>
            )}
            {gameOver && (
                <>
                    <h3>Pontuação da Rodada</h3>
                    <ul>
                        {data.players.map(p => (
                            <li key={p.id}>
                                {p.name}: {scores[p.name]} ponto{Math.abs(scores[p.name]) === 1 ? '' : 's'}
                                {p.isImpostor ? ' (Impostor)' : ''}
                            </li>
                        ))}
                    </ul>
                    <h3>Pontuação Acumulada</h3>
                    <ul>
                        {data.players.map(p => {
                            const roundScore = scores[p.name] ?? 0;
                            const prevScore = typeof p.score === 'number' ? p.score : 0;
                            const totalScore = prevScore + roundScore;
                            return (
                                <li key={p.id}>
                                    {p.name}: {totalScore} ponto{Math.abs(totalScore) === 1 ? '' : 's'}
                                    {p.isImpostor ? ' (Impostor)' : ''}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}
            {gameOver ? (
                <>
                    <button onClick={() => navigate("/games/impostor/lobby")}>Voltar ao Lobby</button>
                    {onNextRound && (
                        <button style={{ marginLeft: 8 }} onClick={onNextRound}>Próxima Rodada</button>
                    )}
                </>
            ) : (
                <button onClick={() => onNextPhase("discussion")}>Continuar Rodada</button>
            )}
        </div>
    );
}