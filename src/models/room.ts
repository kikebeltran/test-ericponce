import { Player } from "@/models/player";
import { Game } from "@/models/game";

export interface Room {
  code: string;
  players: Player[];
  status: "created" | "waiting" | "playing" | "ranking" | "ended";
  game: Game | null;
  currentPlayer?: string;
  createdAt: string;
}
