import { apiFetch } from '../lib/apiFetch';
import { Player, Fixture, Squad, User } from '../types';
import { mockPlayers, mockUsers, mockFixtures, mockSquads } from '../data/mockData';

export interface IDataProvider {
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  getFixtures(): Promise<Fixture[]>;
  getSquad(userId: string, sport: string, draftLeagueId?: string): Promise<Squad | null>;
  getAllSquads(): Promise<Squad[]>;
  updateSquad(squadId: string, updates: Partial<Squad>): Promise<Squad>;
  login(username: string, password?: string): Promise<User | null>;
  getUsers(): Promise<User[]>;
  updateUser(id: string, updates: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;
}

export class DemoDataProvider implements IDataProvider {
  private players = [...mockPlayers];
  private users = [...mockUsers];
  private fixtures = [...mockFixtures];
  private squads = [...mockSquads];

  async getPlayers(): Promise<Player[]> {
    return Promise.resolve(this.players);
  }

  async getPlayer(id: string): Promise<Player | null> {
    return Promise.resolve(this.players.find(p => p.id === id) || null);
  }

  async getFixtures(): Promise<Fixture[]> {
    return Promise.resolve(this.fixtures);
  }

  async getSquad(userId: string, sport: string, draftLeagueId?: string): Promise<Squad | null> {
    const s = this.squads.find(s => s.userId === userId && s.sport === sport && s.draftLeagueId === draftLeagueId);
    if (s) return Promise.resolve(s);
    
    if (draftLeagueId) {
      try {
        const res = await apiFetch(`/api/drafts/${draftLeagueId}`);
        if (!res.ok) return Promise.resolve(null);
        const room = await res.json();
        const member = room.members.find((m: { userId: string, budget: number, roster: Player[] }) => m.userId === userId);
        if (!member) return Promise.resolve(null);

        // Map draft roster to a Squad object
        const draftSquad: Squad = {
          id: `draft_${draftLeagueId}_${userId}`,
          userId,
          name: `${room.name} Squad`,
          bank: member.budget,
          totalPoints: 0,
          overallRank: 0,
          sport: room.sport,
          draftLeagueId,
          players: member.roster.map((p: Player, idx: number) => ({
            playerId: p.id,
            isStarting: idx < (room.sport === 'football' ? 11 : 5),
            isCaptain: false,
            isViceCaptain: false,
            role: (idx < (room.sport === 'football' ? 11 : 5) ? 'starting' : 'bench') as 'starting' | 'bench',
            positionIndex: idx
          }))
        };
        // Optionally save to this.squads so updates work locally
        this.squads.push(draftSquad);
        return Promise.resolve(draftSquad);
      } catch (e) {
        console.error("Failed to fetch draft squad", e);
        return Promise.resolve(null);
      }
    }

    // Auto-initialize a new global squad for demo purposes if not found
    const newSquad: Squad = {
      id: `sq-${userId}-${sport}`,
      userId: userId,
      name: `${sport.toUpperCase()} TEAM`,
      bank: sport === 'football' ? 100.0 : 100.0,
      totalPoints: 0,
      overallRank: 0,
      sport: sport as 'football' | 'basketball',
      players: []
    };
    // Don't persist to this.squads yet or do? Let's persist for demo stability
    this.squads.push(newSquad);
    return Promise.resolve(newSquad);
  }

  async getAllSquads(): Promise<Squad[]> {
    return Promise.resolve(this.squads);
  }

  async updateSquad(squadId: string, updates: Partial<Squad>): Promise<Squad> {
    const idx = this.squads.findIndex(s => s.id === squadId);
    if (idx === -1) throw new Error('Squad not found');
    this.squads[idx] = { ...this.squads[idx], ...updates };
    
    const s = this.squads[idx];
    if (s.draftLeagueId) {
       try {
         await apiFetch(`/api/drafts/${s.draftLeagueId}/waivers`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userId: s.userId, players: s.players })
         });
       } catch (e) {
         console.error(e);
       }
    }
    
    return Promise.resolve(this.squads[idx]);
  }

  async getUsers(): Promise<User[]> {
    return Promise.resolve(this.users);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return Promise.resolve(null);
    this.users[idx] = { ...this.users[idx], ...updates };
    return Promise.resolve(this.users[idx]);
  }

  async deleteUser(id: string): Promise<boolean> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return Promise.resolve(false);
    this.users.splice(idx, 1);
    return Promise.resolve(true);
  }

  async login(username: string, password?: string): Promise<User | null> {
    // Fake login logic
    if (username === 'test' && password === 'test123') {
      return Promise.resolve({
        id: 'u1',
        username: 'test',
        email: 'test@example.com',
        role: 'user',
        sportAccess: 'all'
      });
    }
    if (username === 'admin_foot' && password === 'admin123') {
      return Promise.resolve({
        id: 'admin-f',
        username: 'admin_foot',
        email: 'admin.foot@prodraft.com',
        role: 'admin',
        sportAccess: 'football'
      });
    }
    if (username === 'admin_bask' && password === 'admin123') {
      return Promise.resolve({
        id: 'admin-b',
        username: 'admin_bask',
        email: 'admin.bask@prodraft.com',
        role: 'admin',
        sportAccess: 'basketball'
      });
    }
    // Global admin for convenience
    if (username === 'admin' && password === 'admin123') {
      return Promise.resolve({
        id: 'admin-global',
        username: 'admin',
        email: 'admin@prodraft.com',
        role: 'admin',
        sportAccess: 'all'
      });
    }
    return Promise.resolve(null);
  }
}

// Global active provider (would be Dependency Injected in full app)
export const db = new DemoDataProvider();
