'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoomService from "@/services/roomService";
import {Player} from "@/models/player";

const EMOJIS = ["😀", "😎", "🤠", "🤖", "👻", "🐱", "🦊", "🦁", "🐯", "🐸", "🐷", "🦄"];

const roomService = new RoomService();

export default function UnirsePartida() {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😀');

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (roomCode && playerName) {
      const player: Player = {
        uuid: Math.random().toString(36).substring(7),
        name: playerName,
        emoji: selectedEmoji,
        score: 0,
        isHost: false,
        createdAt: new Date().toISOString(),
      }

      roomService.joinRoom(roomCode, player).then((room) => {
        router.push('/sala-espera');
      });
    }
  };

  return (
    <div className="h-screen bg-white pt-16 px-6">
      <main className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Unirse a Partida</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="gameCode" className="block text-sm font-medium text-gray-700 mb-2">
              Código de la partida
            </label>
            <input
              type="text"
              id="gameCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={7}
              className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors font-mono text-xl text-center tracking-wider"
              placeholder="Escribe el código..."
            />
          </div>

          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Escribe tu nombre..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona tu avatar
            </label>
            <div className="grid grid-cols-6 gap-2">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`text-2xl p-2 rounded-lg hover:bg-gray-100 ${
                    selectedEmoji === emoji ? 'bg-gray-200' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Unirse a Partida
          </button>
        </form>
      </main>
    </div>
  );
} 
