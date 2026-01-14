import { useEffect, useState } from "react";
import { usePlayers } from "../../../../contexts/contextHook";
import { getImpostorCount, initializeGame } from "../GameLogistic/gameLogistic";
import { useNavigate } from "react-router-dom";
import { categories } from "../GameLogistic/words";
import type { GameRouteState } from "../GameLogistic/types";

export function OfflineImpostorLobby() {
  const navigate = useNavigate();
  const { players, addPlayer, removePlayer } = usePlayers();
  const [name, setName] = useState("");
  const maxImpostors = getImpostorCount(players.length);
  const [selectImpostorNumbers, setSelectImpostorNumbers] = useState(1);
  const [twoGroups, setTwoGroups] = useState<boolean>(false);
  const [categorie, setCategorie] = useState<string[]>(categories);
  const [impostorHint, setImpostorHint] = useState<boolean>(false);
  const [whoStart, setWhoStart] = useState<boolean>(false);
  const [impostorCanStart, setImpostorCanStart] = useState<boolean>(false);

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

  function handleWhoStart(event: React.ChangeEvent<HTMLInputElement>) {
    setWhoStart(event.target.checked);
  }

  function handleImpostorCanStart(event: React.ChangeEvent<HTMLInputElement>) {
    setImpostorCanStart(event.target.checked);
  }

  function handleCategorie(cat: string) {
    categorie.includes(cat)
      ? setCategorie((prev) => prev.filter((item) => item !== cat))
      : setCategorie((prev) => [...prev, cat]);
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
    const allData = initializeGame(
      players,
      selectImpostorNumbers,
      twoGroups,
      impostorHint,
      categorie,
      whoStart,
      impostorCanStart,
    );

    if (allData !== undefined) {
      navigate("/games/impostor/offline", {
        state: {
          players: allData.allPlayers,
          howManyImpostors: allData.howManyImpostors,
          impostorCanStart: allData.impostorCanStart,
          impostorHint: allData.impostorHasHint,
          selectedCategories: allData.selectedCategories,
          twoWordsMode: allData.twoWordsMode,
          whoStart: allData.whoStart,
          phase: "reveal",
        } satisfies GameRouteState,
      });
    }
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
        <label>Dois grupos cada um com uma palavra similar a outra: </label>
        <label>
          <input
            type="checkbox"
            checked={twoGroups}
            onChange={handleTwoGroupsChange}
          />
          Ativar -
        </label>
        <label>Impostor tem dica: </label>
        <label>
          <input
            type="checkbox"
            checked={impostorHint}
            onChange={handleImpostorHintChange}
          />
          Ativar -
        </label>
        <label>Selecionar aleatoriamente quem inicia: </label>
        <label>
          <input type="checkbox" checked={whoStart} onChange={handleWhoStart} />
          Ativar -
        </label>
        <label>Impostor pode iniciar a rodada: </label>
        <label>
          <input
            type="checkbox"
            checked={impostorCanStart}
            onChange={handleImpostorCanStart}
          />
          Ativar -
        </label>
      </div>
      <div>
        {categories.map((cat, index) => {
          return (
            <div key={index}>
              <p>{cat}</p>
              <input
                type="checkbox"
                checked={categorie.includes(cat) ? true : false}
                value={cat}
                onChange={() => handleCategorie(cat)}
              />
            </div>
          );
        })}
      </div>
      <div>
        <button onClick={startGame} disabled={players.length < 3}>
          Start Game
        </button>
      </div>
    </div>
  );
}
