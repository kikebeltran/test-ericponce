'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import RoomService from "@/services/roomService";
import {Player} from "@/models/player";
import {Room} from "@/models/room";

const roomService = new RoomService();

const EMOJIS = ["😀", "😎", "🤠", "🤖", "👻", "🐱", "🦊", "🦁", "🐯", "🐸", "🐷", "🦄"];

export default function CrearPartida() {
    const [room, setRoom] = useState<Room | null>(null);
    const [playerName, setPlayerName] = useState('');
    const [selectedEmoji, setSelectedEmoji] = useState('😀');

    let roomCreated = false;

    useEffect(() => {
        if (!roomCreated) {
            roomCreated = true;
            setRoom(roomService.newRoom());
        }
    }, []);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const player: Player = {
            uuid: Math.random().toString(36).substring(7),
            name: playerName,
            emoji: selectedEmoji,
            score: 0,
            isHost: true,
            createdAt: new Date().toISOString(),
        }

        await roomService.joinRoom(room?.code as string, player);
        await roomService.changeRoomStatus(room as Room, 'waiting');
        router.push('/sala-espera');
    };

    return (
        <div className="h-screen bg-white pt-16 px-6">
            <main className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2 text-gray-900">Crear Partida</h1>
                    {room && (
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Código de la partida:</p>
                            <p className="text-3xl font-mono font-bold text-gray-900 tracking-wider">{room.code}</p>
                        </div>
                    )}
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
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
                        Crear Partida
                    </button>
                </form>
            </main>
        </div>
    );
}
