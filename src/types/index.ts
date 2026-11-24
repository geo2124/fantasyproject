export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  teamId?: string;
  sportAccess?: 'football' | 'basketball' | 'all';
}

export type PlayerPosition = 'GKP' | 'DEF' | 'MID' | 'FWD' | 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export type BasketballBasePos = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export interface BasketballPosDetail {
  type: 'fixed' | 'combo';
  primary: BasketballBasePos;
  secondary?: BasketballBasePos;
  label: string; // COMBO GUARD, GUARD, FORWARD, BIG, etc.
}

export interface PlayerStats {
  points?: number;
  assists?: number;
  rebounds?: number;
  steals?: number;
  blocks?: number;
  turnovers?: number;
  fgMade?: number;
  fgAtt?: number;
  ftMade?: number;
  ftAtt?: number;
  threePMade?: number;
  threePAtt?: number;
  minutes?: number;
}

export interface Player {
  id: string;
  name: string;
  team: string;
  position: PlayerPosition;
  price: number;
  totalPoints: number;
  status: 'available' | 'injured' | 'suspended';
  fixtureHistory: PlayerFixture[];
  sport?: 'football' | 'basketball';
  image?: string;
  basketballPosDetail?: BasketballPosDetail;
  statsHistory?: { [fixtureId: string]: PlayerStats };
  fibaId?: string;
  isImport?: boolean;
}

export interface PlayerFixture {
  fixtureId: string;
  opponent: string;
  isHome: boolean;
  points: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
}

export interface Fixture {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  homeScore: number | null;
  awayScore: number | null;
  status: 'upcoming' | 'live' | 'finished';
  sport?: 'football' | 'basketball';
}

export interface SquadPlayer {
  playerId: string;
  isCaptain: boolean;
  isViceCaptain: boolean;
  isStarting: boolean;
  role?: 'starting' | 'bench' | 'roster';
  positionIndex: number; // For layout
}

export interface Squad {
  id: string;
  userId: string;
  name: string;
  bank: number;
  players: SquadPlayer[];
  totalPoints: number;
  overallRank: number;
  sport: 'football' | 'basketball';
  favoriteClub?: string;
  draftLeagueId?: string;
}

export interface DraftLeague {
  id: string;
  creatorId: string;
  name: string;
  sport: 'football' | 'basketball';
  maxTeams: number; // 8-12
  isPublic: boolean;
  password?: string;
  draftDate: string; // ISO date string
  draftTimePerPick: 5 | 10 | 15;
  seasonType: 'full' | 'fixed';
  roundsCount?: number; // if fixed
  members: string[]; // user IDs
  status: 'pending' | 'drafting' | 'completed';
}

export interface DraftBid {
  playerId: string;
  userId: string;
  amount: number;
}

