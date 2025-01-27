import { Room } from "@/models/room";
import FirebaseService from "@/services/firebaseService";
import { Player } from "@/models/player";
import GameService from "@/services/gameService";
import { Game } from "@/models/game";
import UtilsService from "@/services/utilsService";

export default class RoomService {
  private static ROOM_AVAILABLE_CHARS_LETTERS: string =
    "ABCDEFGHJKLMNPQRSTUVWXYZ";
  private static ROOM_AVAILABLE_CHARS_NUMBERS: string = "23456789";

  private firebaseService: FirebaseService;
  private gameService: GameService;
  private utilsService: UtilsService;

  constructor() {
    this.firebaseService = new FirebaseService();
    this.gameService = new GameService();
    this.utilsService = new UtilsService();
  }

  public newRoom(): Room {
    const room: Room = {
      code: this.getRandomCode(),
      players: [],
      status: "created",
      game: null,
      createdAt: new Date().toISOString(),
    };

    this.firebaseService.write(`rooms/${room.code}`, room);

    return room;
  }

  public async joinRoom(roomCode: string, player: Player): Promise<void> {
    await this.addPlayerToRoom(roomCode, player);

    if (player.isHost) {
      sessionStorage.setItem("host", "host");
    }

    sessionStorage.setItem("roomCode", roomCode);
    sessionStorage.setItem("playerUuid", player.uuid);
  }

  public subscribeToRoom(
    roomCode: string,
    callback: (room: Room | null) => void
  ): () => void {
    return this.firebaseService.subscribe<Room>(`rooms/${roomCode}`, callback);
  }

  public async changeRoomStatus(room: Room, status: string): Promise<void> {
    await this.firebaseService.update(`rooms/${room.code}`, { status });
  }

  private async addPlayerToRoom(
    roomCode: string,
    player: Player
  ): Promise<void> {
    return await this.firebaseService.write(
      `rooms/${roomCode}/players/${player.uuid}`,
      player
    );
  }

  public async startGame(
    roomCode: string,
    firstGame: boolean = false
  ): Promise<void> {
    if (firstGame) {
      await this.gameService.resetPlayerScores(roomCode);
      this.utilsService.setGamesPlayed(0);
      this.utilsService.setCurrentGameIndex(
        Math.floor(Math.random() * GameService.GAMES.length)
      );
    }

    const nextGame = this.gameService.getNextGame();
    if (!nextGame) {
      await this.endRoom(roomCode);
      return;
    }

    const data = {
      status: "playing",
      game: nextGame,
    };

    await this.firebaseService.update(`rooms/${roomCode}`, data);
  }

  public async endGame(roomCode: string): Promise<void> {
    const totalGames = GameService.GAMES.length;
    const gamesPlayed = this.utilsService.getGamesPlayed();

    // If all games have been played, stop the round
    if (gamesPlayed >= totalGames) {
      await this.endRoom(roomCode);
      return;
    }

    const status = "ranking";

    await this.firebaseService.update(`rooms/${roomCode}`, { status });
  }

  private async endRoom(roomCode: string): Promise<void> {
    const status = "ended";

    await this.firebaseService.update(`rooms/${roomCode}`, { status });
  }

  public async updateScores(roomCode: string): Promise<void> {
    const game: Game = await this.firebaseService.read<Game>(
      `rooms/${roomCode}/game`
    );
    if (!game) {
      return;
    }

    if (!game.results) {
      return;
    }

    // Sort scores
    const sortedResults = Object.entries(game.results)
      .sort(([, a], [, b]) => a - b) // Sort by value
      .map(([uuid, value]) => ({ uuid, value }));

    // Update player scores
    for (let i = 0; i < sortedResults.length; i++) {
      const { uuid } = sortedResults[i];
      const points = sortedResults.length - i;

      const currentScore = await this.firebaseService.read(
        `rooms/${roomCode}/players/${uuid}/score`
      );
      await this.firebaseService.update(`rooms/${roomCode}/players/${uuid}`, {
        score: currentScore + points,
      });
    }
  }

  public async updatePlayerScore(
    roomCode: string,
    playerUuid: string,
    points: number
  ): Promise<void> {
    const currentScore = await this.firebaseService.read<number>(
      `rooms/${roomCode}/players/${playerUuid}/score`
    );
    await this.firebaseService.update(
      `rooms/${roomCode}/players/${playerUuid}`,
      {
        score: currentScore + points,
      }
    );
  }

  public async setCurrentPlayer(
    roomCode: string,
    playerUuid: string
  ): Promise<void> {
    await this.firebaseService.write(
      `rooms/${roomCode}/currentPlayer`,
      playerUuid
    );
  }

  public async getCurrentPlayer(roomCode: string): Promise<Player | null> {
    const playerUuid = this.utilsService.getCurrentPlayerUuid();
    return await this.firebaseService.read<Player>(
      `rooms/${roomCode}/players/${playerUuid}`
    );
  }

  private getRandomCode(): string {
    const getRandomChars = (chars: string, length: number) => {
      return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    };

    const a = getRandomChars(RoomService.ROOM_AVAILABLE_CHARS_LETTERS, 2);
    const b = getRandomChars(RoomService.ROOM_AVAILABLE_CHARS_NUMBERS, 2);

    return `${a}${b}`;
  }
}
