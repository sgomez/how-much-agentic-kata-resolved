export interface GamePlayerInfo {
  id: string;
  nickname: string;
}

export interface GameInfo {
  players: GamePlayerInfo[];
  impostorMode: boolean;
}

export interface GamesPort {
  readonly getGame: (code: string) => Promise<GameInfo>;
}
