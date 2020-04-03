import SoccerBettable from "./sports/soccer";
import EsportsBettable from "./sports/esports";
import TableTennisBettable from "./sports/table-tennis";

export type Bettable = SoccerBettable | EsportsBettable | TableTennisBettable;

export type NewBettable = Omit<Bettable, "_id">;
export type NewSoccerBettable = Omit<SoccerBettable, "_id">;
export type NewEsportsBettable = Omit<EsportsBettable, "_id">;
export type NewTableTennisBettable = Omit<TableTennisBettable, "_id">;
