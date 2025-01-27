'use client';

import { useState, useEffect } from 'react';
import RoomService from "@/services/roomService";
import GameService from "@/services/gameService";
import { useRoomRedirect } from "@/hooks/useRoomRedirect";

const roomService = new RoomService();
const gameService = new GameService();

export default function NumerosOrden() {
  const { room, isHost } = useRoomRedirect();
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  const [gameDuration, setGameDuration] = useState(30);
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [penalties, setPenalties] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    setNumbers(room?.game?.config.numbers);

    // Start game when room game is loaded
    if (!gameStarted && room?.game?.status === 'running') {
      setGameStarted(true);
      setCurrentIndex(0);
      setPenalties(0);
      setStartTime(Date.now());

      timer = setInterval(() => {
        setGameDuration((prev) => {
          if (prev <= 1) {
            // Tiempo agotado
            clearInterval(timer);
            setTimeElapsed(gameDuration + penalties);
            setGameFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return;
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [room, penalties]);

  const endGame = () => {
    const endTime = Date.now();
    const baseTime = (endTime - (startTime || 0)) / 1000;
    const elapsed = baseTime + penalties;
    setTimeElapsed(elapsed); // Añadir penalizaciones al tiempo final
    setGameFinished(true);

    // Report results
    gameService.reportPlayerResult(elapsed);
  }

  const handleNumberClick = (clickedNumber: number) => {
    const sortedNumbers = [...numbers].sort((a, b) => b - a);
    const expectedNumber = sortedNumbers[currentIndex];

    if (clickedNumber === expectedNumber) {
      // Correcto - avanzar al siguiente número
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);

      if (newIndex >= numbers.length) {
        endGame();
      }
    } else {
      // Incorrecto - añadir penalización
      setPenalties(prev => prev + 1);
    }
  };

  const goToRanking = () => {
    if (!isHost) return;

    roomService.updateScores(room?.code as string);
    roomService.endGame(room?.code as string)
  }

  return (
    <div className="h-screen bg-white pt-16 px-4">
      <main className="w-full max-w-md mx-auto">
        {!gameStarted && (
          <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Números en Orden</h1>
            <p className="text-gray-600">
              Pulsa los números en orden descendente (del mayor al menor)
            </p>
            <p className="text-sm text-gray-500">
              Cada error añade 1 segundo de penalización
            </p>
            <p className="text-sm text-gray-500">
              Tienes {gameDuration} segundos para completar el juego
            </p>
            {isHost && (
                <button
                    onClick={ () => gameService.startGame()}
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
                Penalizaciones: <span className="text-red-500 font-bold">+{penalties}s</span>
              </p>
              <p className={`font-mono font-bold text-xl ${
                gameDuration <= 5 ? 'text-red-500' : 'text-gray-900'
              }`}>
                {gameDuration}s
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {numbers.map((number, index) => {
                const sortedNumbers = [...numbers].sort((a, b) => b - a);
                const isCompleted = sortedNumbers.indexOf(number) < currentIndex;

                return (
                  <button
                    key={index}
                    onClick={() => handleNumberClick(number)}
                    disabled={isCompleted}
                    className={`
                      aspect-square flex items-center justify-center text-2xl font-mono font-bold rounded-lg
                      transition-all duration-200
                      ${isCompleted 
                        ? 'bg-gray-100 text-gray-300 cursor-default' 
                        : 'bg-white border-2 border-gray-200 text-gray-900 hover:border-blue-500 active:bg-gray-50'
                      }
                    `}
                  >
                    {isCompleted ? '✓' : number}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameFinished && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentIndex === numbers.length ? '¡Completado!' : 'Tiempo agotado'}
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg inline-block">
                <p className="text-4xl font-mono font-bold text-gray-900">
                  {timeElapsed.toFixed(2)}s
                </p>
              </div>
            </div>
            <div className="text-gray-600 space-y-1">
              <p>Penalizaciones: {penalties}</p>
              <p>Números completados: {currentIndex} de {numbers.length}</p>
            </div>

            {isHost && (
                <button
                    onClick={() => goToRanking()}
                    className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                  🏆 Ir al ranking
                </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
} 
