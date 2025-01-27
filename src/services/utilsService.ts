export default class UtilsService {
    public getCurrentRoomCode(): string|null {
        return sessionStorage.getItem('roomCode');
    }

    public getCurrentPlayerUuid(): string|null {
        return sessionStorage.getItem('playerUuid');
    }

    public isHost(): boolean {
        return sessionStorage.getItem('host') === "host";
    }

    public getCurrentGameIndex(): number {
        return parseInt(sessionStorage.getItem('currentGameIndex') || '0');
    }

    public setCurrentGameIndex(index: number): void {
        sessionStorage.setItem('currentGameIndex', String(index));
    }

    public getGamesPlayed(): number {
        return parseInt(sessionStorage.getItem('gamesPlayed') || '0');
    }

    public setGamesPlayed(gamesPlayed: number): void {
        sessionStorage.setItem('gamesPlayed', String(gamesPlayed));
    }
}
