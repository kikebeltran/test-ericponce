"use client";

import { useState, useEffect } from "react";
import RoomService from "@/services/roomService";
import GameService from "@/services/gameService";
import { useRoomRedirect } from "@/hooks/useRoomRedirect";
import UtilsService from "@/services/utilsService";

const roomService = new RoomService();
const gameService = new GameService();

export default function PatataCaliente() {
  const gameScore = 2;

  let utilsService = new UtilsService();

  const { room, isHost } = useRoomRedirect();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  const [gameDuration, setGameDuration] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<string>("");
  const [potatoScale, setPotatoScale] = useState(1);
  const [isThrown, setIsThrown] = useState(false);
  const [firstTimePatata, setFirstTimePatata] = useState(true);
  const [firstUser, setFirstUser] = useState(false);
  const [randomMessage, setRandomMessage] = useState("");

  useEffect(() => {
    let timer: NodeJS.Timeout;

    setCurrentPlayer(utilsService.getCurrentPlayerUuid() || "");

    if (!gameStarted && room?.game?.status === "ready") {
      setGameDuration(room?.game?.config?.time);

      if (room?.code && room?.players) {
        // Get first player from players object
        const firstPlayer = Object.values(room.players)[0];

        if (firstPlayer.uuid === currentPlayer) {
          setFirstUser(true);
        }

        if (firstPlayer) {
          roomService.setCurrentPlayer(room.code, firstPlayer.uuid);
        }
      }
    }

    // Start game when room game is loaded
    if (!gameStarted && room?.game?.status === "running") {
      setGameDuration(room?.game?.config?.time);

      setGameStarted(true);
      setPotatoScale(1);

      timer = setInterval(() => {
        setGameDuration((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameFinished(true);
            endGame();
            return 0;
          }

          const newScale = 1 + ((40 - prev) / 40) * 4;
          setPotatoScale(newScale);
          return prev - 1;
        });
      }, 1000);
      return;
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [room]);

  const handleClickPotato = () => {
    setTimeout(() => {
      setFirstTimePatata(false);
      setRandomMessage(getRandomMessage());
    }, 500);

    if (!room?.players || Object.keys(room.players).length < 2) return;
    if (room?.currentPlayer !== currentPlayer) return;

    // Iniciar animación de lanzamiento
    setIsThrown(true);

    // Esperar a que termine la animación antes de cambiar de jugador
    setTimeout(() => {
      const playersArray = Object.values(room.players);
      const currentPlayerIndex = playersArray.findIndex(
        (p) => p.uuid === room.currentPlayer
      );
      const nextPlayerIndex = (currentPlayerIndex + 1) % playersArray.length;
      const nextPlayer = playersArray[nextPlayerIndex];

      if (nextPlayer) {
        roomService.setCurrentPlayer(room.code, nextPlayer.uuid);
      }
      setIsThrown(false);
    }, 300);
  };

  const endGame = () => {
    setGameFinished(true);
  };

  const goToRanking = () => {
    if (!isHost) return;

    roomService.updatePlayerScore(
      room?.code as string,
      currentPlayer,
      gameScore
    );
    roomService.endGame(room?.code as string);
  };

  const getRandomMessage = () => {
    const messages = [
      "Uooo, te ha vuelto la patata, dale!!",
      "Cuidado que esto está que ardeeee 🔥",
      "Dale dale, no te quedes parado",
      "Mmmmm... que rica patata 🤤",
      "Tic tac... tic tac... 🕰️",
      "Toque, toque, toque... ☄️",
      "Uffff, que poco le queda",
      "Sabes que por cada 100 gramos, aportan 88 calorías, 18 gramos de hidratos de carbono, 2,5 gramos de proteínas, 2 gramos de fibra y un sorprendente 77,3 gramos de agua.",
      "China es el mayor productor de patatas del mundo, pero pásala ya",
      "¿Sabes que la patata es un tubérculo? Si, no?",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <div className="h-screen bg-white pt-16 px-4">
      <main className="w-full max-w-md mx-auto">
        {!gameStarted && (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Patata Caliente
            </h1>
            <p className="text-gray-600">
              Pulsa la patata 🥔 y pásala al siguiente jugador antes de que
              explote 💥
            </p>
            <p className="text-sm text-gray-500">
              Si puerdes sumas 0 points amigo.
            </p>
            <p className="text-sm text-gray-500">¡Todos los demás suman 2!</p>
            <p className="text-sm text-gray-500">
              La duración del juego es de {gameDuration} segundos
            </p>
            {isHost && (
              <button
                onClick={() => gameService.startGame()}
                className="w-full max-w-md mx-auto py-3 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                🕹️️ Empezar juego
              </button>
            )}
          </div>
        )}

        {gameStarted && !gameFinished && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-gray-600">
                {room?.currentPlayer === currentPlayer
                  ? firstTimePatata && firstUser
                    ? "Empiezas con la patata, tócala para pasarla al siguiente jugador"
                    : firstTimePatata && !firstUser
                    ? "Epaaa, te llegó el patatazo, tócala para pasarla"
                    : randomMessage
                  : "Espera... la patata la tiene "}
                <span className="font-bold text-gray-900">
                  {room?.currentPlayer != currentPlayer &&
                    room?.players[room?.currentPlayer as any]?.name}
                </span>
              </p>
              {/* <p
                className={`font-mono font-bold text-xl ${
                  gameDuration <= 5 ? "text-red-500" : "text-gray-900"
                }`}
              >
                {gameDuration}s
              </p> */}
            </div>
            <div className="flex justify-center items-center h-64">
              {room?.currentPlayer === currentPlayer ? (
                <div
                  onClick={() => handleClickPotato()}
                  className={`
                    text-8xl cursor-pointer 
                    transition-all duration-100 ease-in
                    ${isThrown ? "translate-x-[100vw]" : ""}
                  `}
                  style={{
                    transform: `scale(${potatoScale}) ${
                      isThrown ? "translateX(100vw)" : ""
                    }`,
                  }}
                >
                  <span className="text-5xl">🥔</span>
                </div>
              ) : (
                <div
                  onClick={() => handleClickPotato()}
                  className="text-8xl cursor-pointer"
                >
                  <span className="text-8xl">✋</span>
                </div>
              )}
            </div>
          </div>
        )}

        {gameFinished && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {room?.currentPlayer === currentPlayer ? (
                  <p>Woww, en toda la cara</p>
                ) : (
                  <p>¡Has sobrevivido!</p>
                )}
              </h2>
            </div>

            <div className="text-8xl">
              {room?.currentPlayer === currentPlayer ? "💥" : "🎉"}
            </div>

            <div className="text-gray-600 space-y-1">
              {room?.currentPlayer === currentPlayer ? (
                <p>Te ha explotado la patata...</p>
              ) : (
                <p>¡Has ganado 2 puntos!</p>
              )}
            </div>

            {isHost && (
              <button
                onClick={() => goToRanking()}
                className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                🏆 Ir al ranking
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
