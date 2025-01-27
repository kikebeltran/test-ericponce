'use client';

import {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import RoomService from "@/services/roomService";
import {Player} from "@/models/player";
import { useRoomRedirect } from "@/hooks/useRoomRedirect";

const roomService = new RoomService();

export default function SalaEspera() {

    const { room, isHost } = useRoomRedirect();

    const [dots, setDots] = useState('');
    const router = useRouter();

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        return () => {
            clearInterval(interval);
        };
    }, []);

    async function startGame() {
        await roomService.startGame(room?.code as string, true);
    }

    function exitRoom() {
        sessionStorage.removeItem('roomCode');
        sessionStorage.removeItem('playerUuid');
        sessionStorage.removeItem('host');
        router.push('/');
    }

    return (
        <div className="h-screen bg-white pt-8 px-6">
            <main className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold mb-2 text-gray-900">Sala de Espera (<span className="font-mono font-bold text-blue-500 tracking-wider">{room?.code}</span>)</h1>
                    {room && room.players && (
                        <p className="text-gray-600">
                            Se han unido {Object.values(room.players).length} jugadores
                        </p>
                    )}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-8 max-h-72 overflow-y-auto">
                    <ul className="space-y-3">
                        {room?.players && Object.values(room.players).map((player: Player, index) => (
                            <li key={index}
                                className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                <span className="text-2xl">{player.emoji}</span>
                                <span className="text-gray-900 font-medium">{player.name}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {!isHost && (
                    <div className="text-center mb-8">
                        <p className="text-gray-600 font-medium">
                            La partida empezará en breve{dots}
                        </p>
                    </div>
                )}

                {isHost && (
                    <button
                        onClick={startGame}
                        className="mb-4 w-full py-3 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">
                        🚀 Iniciar partida
                    </button>
                )}

                <button
                    onClick={() => exitRoom()}
                    className="mb-8 w-full py-3 px-6 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
                        👋 Salir de la partida
                </button>
            </main>
        </div>
    );
}
