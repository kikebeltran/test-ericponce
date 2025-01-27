import { useMemo } from 'react';
import { Player } from "@/models/player";

export function useSortedPlayersByScore(players: Player[] | undefined) {
    return useMemo(() => {
        if (!players) {
            return [];
        }

        return Object.values(players).sort((a, b) => b.score - a.score);
    }, [players]);
}
