'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import RoomService from "@/services/roomService";
import {Player} from "@/models/player";
import { useRoomRedirect } from "@/hooks/useRoomRedirect";
import { useSortedPlayersByScore } from "@/hooks/useSortedPlayersByScore";

const roomService = new RoomService();

const getPositionEmoji = (position: number) => {
  switch (position) {
    case 0: return "🥇";
    case 1: return "🥈";
    case 2: return "🥉";
    default: return "";
  }
};

export default function Resultados() {
  const { room, isHost } = useRoomRedirect();

  const sortedPlayersByScore = useSortedPlayersByScore(room?.players);

  const [playerResults, setPlayerResults] = useState<Record<string, number>>();

  const router = useRouter();

  useEffect(() => {
    setPlayerResults(room?.game?.results);

    return () => {};
  }, [room]);

  function exitRoom() {
    sessionStorage.removeItem('roomCode');
    sessionStorage.removeItem('playerUuid');
    sessionStorage.removeItem('host');
    router.push('/');
  }

  return (
    <div className="h-screen bg-white pt-16 px-6">
      <main className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          {room?.status === 'ranking' && (
              <h1 className="text-2xl font-bold mb-2 text-gray-900">Resultados</h1>
          )}
          {room?.status === 'ended' && (
              <div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900">¡Partida finalizada!</h1>
                <h2 className="text-xl font-bold mb-2 text-gray-900">Resultados</h2>
              </div>
          )}
          <p className="text-gray-600">
            Último juego: {room?.game?.name}
          </p>
        </div>

        <div className="space-y-3 mb-8 max-h-72 overflow-y-auto">
          {sortedPlayersByScore.map((player: Player, index) => (
              <div
                  key={player.uuid}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{player.emoji}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{player.name}</span>
                      <span className="text-lg">{getPositionEmoji(index)}</span>
                      {playerResults?.[player.uuid] && (
                          <span className="text-lg text-gray-900">({playerResults?.[player.uuid].toFixed(2)}s)</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
                  <span className="font-bold text-gray-900">{player.score}</span>
                  <span className="text-gray-600 text-sm"> puntos</span>
                </div>
              </div>
          ))}
        </div>

        {isHost && room?.status === 'ranking' && (
            <button
                onClick={() => roomService.startGame(room?.code as string)}
                className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              🚀 Siguiente juego
            </button>
        )}

        {isHost && room?.status === 'ended' && (
            <button
                onClick={() => roomService.startGame(room?.code as string, true)}
                className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              🚀 Iniciar nueva partida
            </button>
        )}

        <button
            onClick={() => exitRoom()}
            className="w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors mt-4"
        >
          👋 Salir de la partida
        </button>
      </main>
    </div>
  );
} 
