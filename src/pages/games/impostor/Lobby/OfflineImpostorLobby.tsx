import { useEffect, useState } from "react";
import { usePlayers } from "../../../../contexts/contextHook";
import { getImpostorCount, initializeGame } from "../GameLogistic/gameLogistic";
import { useNavigate } from "react-router-dom";

export function OfflineImpostorLobby() {
  const navigate = useNavigate();
  const { players, addPlayer, removePlayer } = usePlayers();
  const [name, setName] = useState("");
  const maxImpostors = getImpostorCount(players.length);
  const [selectImpostorNumbers, setSelectImpostorNumbers] = useState(1);
  const [twoGroups, setTwoGroups] = useState<boolean>(false);
  const [impostorHint, setImpostorHint] = useState<boolean>(false);

  // Função para adicionar um jogador à lista

  function handleAddNamePlayer() {
    if (!name.trim()) return;
    addPlayer(name.trim());
    setName("");
  }

  // Função para lidar com a mudança do checkbox de dois grupos

  function handleTwoGroupsChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTwoGroups(event.target.checked);
  }

  // Função para lidar com a mudança do checkbox de dica do impostor

  function handleImpostorHintChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setImpostorHint(event.target.checked);
  }

  // Atualiza o número máximo de impostores quando a lista de jogadores muda

  useEffect(() => {
    setSelectImpostorNumbers(Math.min(selectImpostorNumbers, maxImpostors));
  }, [players.length, maxImpostors]);

  // Função para iniciar o jogo

  function startGame() {
    const allPlayers = initializeGame(
      players,
      selectImpostorNumbers,
      twoGroups,
      impostorHint,
      [
        "Animais",
        "Frutas",
        "Plantas",
        "Natureza",
        "Objetos",
        "Comida",
        "Filmes e Séries",
        "Esportes",
        "Famosos",
        "Emoções",
        "Lugares",
        "Países e Cidades",
        "Video Games",
        "Marcas",
        "Personagens",
        "Músicas",
        "Jogos",
      ],
    );

    navigate("/games/impostor/offline", {
      state: {
        players: allPlayers,
        phase: "reveal",
      },
    });
  }

  return (
    <div>
      <h1>Lobby do Jogo Local</h1>
      <div>
        <label>Adicione jogadores para o jogo local (Mínimo 3):</label>
        <input
          type="text"
          placeholder="Nome do Jogador"
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleAddNamePlayer}>Adicionar Jogador</button>
        <div>
          <h2>
            Jogadores Adicionados:
            {players.map((player) => (
              <div key={player.id}>
                <span>{player.name}</span>
                <button onClick={() => removePlayer(player.id)}>X</button>
                <span>, </span>
              </div>
            ))}
          </h2>
        </div>
      </div>
      <div>
        <label>Adicione a quantidade de impostores:</label>
        <button
          onClick={() =>
            setSelectImpostorNumbers((prev) => Math.min(prev + 1, maxImpostors))
          }
        >
          +
        </button>
        <p>{selectImpostorNumbers}</p>
        <button
          onClick={() =>
            setSelectImpostorNumbers((prev) => Math.max(prev - 1, 1))
          }
        >
          -
        </button>
      </div>
      <div>
        <label>Dois grupos cada um com uma palavra similar a outra:</label>
        <label>
          <input
            type="checkbox"
            checked={twoGroups}
            onChange={handleTwoGroupsChange}
          />
          Ativar
        </label>
        <label>Impostor tem dica:</label>
        <label>
          <input
            type="checkbox"
            checked={impostorHint}
            onChange={handleImpostorHintChange}
          />
          Ativar
        </label>
      </div>
      <div>
        <button onClick={startGame} disabled={players.length < 3}>
          Start Game
        </button>
      </div>
    </div>
  );
}
