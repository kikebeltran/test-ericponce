import {Game} from "@/models/game";
import FirebaseService from "@/services/firebaseService";
import UtilsService from "@/services/utilsService";
import {Player} from "@/models/player";
import {QuizQuestion} from "@/models/quiz-question";

const GAMES: Game[] = [
    {
        id: 'numeros-orden',
        name: 'Números en Orden',
        emoji: '🔢',
        description: 'Ordena los números de mayor a menor',
        status: 'ready',
        config: {},
        results: {},
    },
];

export default class GameService {
    public static GAMES: Game[] = GAMES;

    private utilsService: UtilsService;
    private firebaseService: FirebaseService;

    constructor() {
        this.utilsService = new UtilsService();
        this.firebaseService = new FirebaseService();
    }

    public getNextGame(): Game | null {
        const totalGames = GameService.GAMES.length;
        const currentGameIndex = this.utilsService.getCurrentGameIndex();
        const gamesPlayed = this.utilsService.getGamesPlayed();

        // If all games have been played, stop the round
        if (gamesPlayed >= totalGames) {
            return null;
        }

        // Determine the next game index (wrap around using modulo)
        const nextGameIndex = (currentGameIndex + 1) % totalGames;

        // Update session storage
        this.utilsService.setCurrentGameIndex(nextGameIndex);
        this.utilsService.setGamesPlayed(gamesPlayed + 1);

        // Return the next game
        return this.configuredGame(GameService.GAMES[nextGameIndex]);
    }

    private configuredGame(game: Game): Game {
        switch (game.id) {
            case 'numeros-orden':
                game.config = {
                    numbers: (() => {
                        // Generate 9 unique random numbers between 1 and 100
                        const nums = new Set<number>();
                        while (nums.size < 9) {
                            nums.add(Math.floor(Math.random() * 100) + 1);
                        }
                        return Array.from(nums);
                    })(),
                };
                break;
            default:
                break;
        }

        return game;
    }

    public async startGame(): Promise<void> {
        const roomCode = this.utilsService.getCurrentRoomCode();

        const status = 'running';

        await this.firebaseService.update(`rooms/${roomCode}/game`, {status});
    }

    public async reportPlayerResult(result: number): Promise<void> {
        const roomCode = this.utilsService.getCurrentRoomCode();
        const playerUuid = this.utilsService.getCurrentPlayerUuid();

        await this.firebaseService.write(`rooms/${roomCode}/game/results/${playerUuid}`, result);
    }

    public async resetPlayerScores(roomCode: string): Promise<void> {
        const players: Record<string, Player> = await this.firebaseService.read<Record<string, Player>>(`rooms/${roomCode}/players`);
        for (const [uuid, player] of Object.entries(players)) {
            await this.firebaseService.update(`rooms/${roomCode}/players/${uuid}`, {
                score: 0,
            });
        }
    }

    // Métodos auxiliares para Quiz Años
    private getRandomQuestions(questions: QuizQuestion[], count: number) {
        // 1. Shuffle the entire question list
        const shuffledQuestions = [...questions];
        for (let i = shuffledQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
        }

        // 2. Slice the first `count` questions
        const selectedQuestions = shuffledQuestions.slice(0, count);

        // 3. For each question, shuffle its options similarly
        const result = selectedQuestions.map(question => {
            const shuffledOptions = [...question.options];
            const correctOption = shuffledOptions[question.correctAnswer];

            // Shuffle these options
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }

            return {
                ...question,
                options: shuffledOptions,
                correctAnswer: shuffledOptions.indexOf(correctOption),
            };
        });

        return result;
    }
}
