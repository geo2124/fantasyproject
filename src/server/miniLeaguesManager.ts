import crypto from 'crypto';
import { saveMiniLeague, loadMiniLeagues, deleteMiniLeagueDb } from './db';

export interface H2HMatchup {
  id: string;
  roundId: string; // the gameweek / round / fixture ID
  userA: string;
  userB: string; // 'BYE' instead of null
  scoreA: number;
  scoreB: number;
}

export interface MiniLeague {
  id: string;
  name: string;
  sport: 'football' | 'basketball';
  type?: 'h2h' | 'roto';
  code: string;
  creatorId: string;
  members: Array<{ userId: string; email: string }>;
  createdAt: number;
  matchups?: H2HMatchup[];
}

let miniLeagues = new Map<string, MiniLeague>();

export async function initMiniLeaguesManager() {
  miniLeagues = await loadMiniLeagues() as Map<string, MiniLeague>;
}

export function createMiniLeague(name: string, sport: 'football' | 'basketball', type: 'h2h' | 'roto', creatorId: string, creatorEmail: string): MiniLeague {
  const id = crypto.randomUUID();
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const league: MiniLeague = {
    id,
    name,
    sport,
    type,
    code,
    creatorId,
    members: [{ userId: creatorId, email: creatorEmail }],
    createdAt: Date.now(),
  };
  miniLeagues.set(id, league);
  saveMiniLeague(id, league).catch(console.error);
  return league;
}

export function joinMiniLeague(code: string, userId: string, email: string): MiniLeague | null {
  for (const league of miniLeagues.values()) {
    if (league.code === code) {
      if (!league.members.find(m => m.userId === userId)) {
        league.members.push({ userId, email });
        saveMiniLeague(league.id, league).catch(console.error);
      }
      return league;
    }
  }
  return null;
}

export function getUserMiniLeagues(userId: string, sport: 'football' | 'basketball'): MiniLeague[] {
  return Array.from(miniLeagues.values()).filter(l => l.sport === sport && l.members.some(m => m.userId === userId));
}

export function getLeagueByCode(code: string): MiniLeague | null {
  return Array.from(miniLeagues.values()).find(l => l.code === code) || null;
}

export function deleteMiniLeague(id: string, userId: string): boolean {
  const league = miniLeagues.get(id);
  if (league && league.creatorId === userId) {
    miniLeagues.delete(id);
    deleteMiniLeagueDb(id).catch(console.error);
    return true;
  }
  return false;
}

export function editMiniLeague(id: string, userId: string, newName: string): MiniLeague | null {
  const league = miniLeagues.get(id);
  if (league && league.creatorId === userId) {
    league.name = newName;
    saveMiniLeague(id, league).catch(console.error);
    return league;
  }
  return null;
}

export function leaveMiniLeague(id: string, userId: string): boolean {
  const league = miniLeagues.get(id);
  if (league) {
    if (league.creatorId === userId) {
      // creator cannot leave, they must delete
      return false;
    }
    league.members = league.members.filter(m => m.userId !== userId);
    saveMiniLeague(id, league).catch(console.error);
    return true;
  }
  return false;
}

export function getAllMiniLeaguesAdmin(): MiniLeague[] {
  return Array.from(miniLeagues.values());
}

export function deleteMiniLeagueAdmin(id: string): boolean {
  const res = miniLeagues.delete(id);
  if (res) deleteMiniLeagueDb(id).catch(console.error);
  return res;
}

export function getLeagueById(id: string): MiniLeague | null {
  return miniLeagues.get(id) || null;
}

export function updateH2HScore(leagueId: string, roundId: string, userA: string, userB: string, newScoreA: number, newScoreB: number): boolean {
  const league = miniLeagues.get(leagueId);
  if (!league || league.type !== 'h2h' || !league.matchups) return false;

  const matchup = league.matchups.find(m => m.roundId === roundId && ((m.userA === userA && m.userB === userB) || (m.userA === userB && m.userB === userA)));
  if (matchup) {
    if (matchup.userA === userA) {
      matchup.scoreA = newScoreA;
      matchup.scoreB = newScoreB;
    } else {
      matchup.scoreA = newScoreB;
      matchup.scoreB = newScoreA;
    }
    saveMiniLeague(leagueId, league).catch(console.error);
    return true;
  }
  return false;
}

export function generateH2HSchedule(id: string, roundIds: string[]): MiniLeague | null {
  const league = miniLeagues.get(id);
  if (!league || league.type !== 'h2h') return null;

  // Round robin algorithm using polygon method
  const userIds = league.members.map(m => m.userId);
  if (userIds.length % 2 !== 0) {
    userIds.push('BYE');
  }

  const numTeams = userIds.length;
  const numRounds = numTeams - 1;
  const halfSize = numTeams / 2;
  
  const tempTeams = [...userIds];
  tempTeams.shift(); 
  
  const scheduleRounds = [];
  for (let round = 0; round < numRounds; round++) {
      const matchUps = [];
      const teamIdx = round % tempTeams.length;
      matchUps.push({ home: userIds[0], away: tempTeams[teamIdx] });
      
      for (let idx = 1; idx < halfSize; idx++) {
          const firstTeam = tempTeams[(round + idx) % tempTeams.length];
          const secondTeam = tempTeams[(round + tempTeams.length - idx) % tempTeams.length];
          matchUps.push({ home: firstTeam, away: secondTeam });
      }
      scheduleRounds.push(matchUps);
  }

  const matchups: H2HMatchup[] = [];

  for (let roundIndex = 0; roundIndex < roundIds.length; roundIndex++) {
    const roundId = roundIds[roundIndex];
    const baseRoundMatches = scheduleRounds[roundIndex % scheduleRounds.length];
    
    for (const m of baseRoundMatches) {
        matchups.push({
          id: crypto.randomUUID(),
          roundId,
          userA: m.home,
          userB: m.away,
          scoreA: 0,
          scoreB: 0,
        });
    }
  }

  league.matchups = matchups;
  saveMiniLeague(id, league).catch(console.error);
  return league;
}
