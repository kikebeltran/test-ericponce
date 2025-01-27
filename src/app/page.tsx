'use client';

import { useRouter } from 'next/navigation';
import { useRoomRedirect } from "@/hooks/useRoomRedirect";

export default function Home() {
  const { room, isHost } = useRoomRedirect();

  const router = useRouter();

  return (
    <div className="h-screen bg-white pt-16 px-6">
      <main className="w-full max-w-md mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Mini Juegos
          </h1>
          <p className="text-gray-600">
            Juegos divertidos para jugar en grupo
          </p>
        </div>

        {/* Buttons Stack */}
        <div className="flex flex-col gap-4 mb-16">
          <button 
            onClick={() => router.push('/crear-partida')}
            className="w-full py-4 px-6 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            🔧 Crear Partida
          </button>
          <button 
            onClick={() => router.push('/unirse-partida')}
            className="w-full py-4 px-6 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors border border-gray-200"
          >
            📥 Unirse a Partida
          </button>
        </div>
      </main>
    </div>
  );
}
