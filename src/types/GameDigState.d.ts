export interface GameDigState {
  name: string;
  map: string;
  password: boolean;
  numplayers: number;
  maxplayers: number;
  players: Array<{ name: string; raw: any }>;
  bots: Array<{ name: string; raw: any }>;
  connect: string;
  ping: number;
  queryPort: number;
  version: string;
  raw: any;
}
