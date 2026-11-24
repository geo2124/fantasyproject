import { Server, Socket } from 'socket.io';
import { Player } from '../types';
import { saveDraftRoom, loadDraftRooms, deleteDraftRoomDb } from './db';

let ioInstance: Server;

interface DraftRoom {
  leagueId: string;
  creatorId: string;
  name: string;
  sport: 'football' | 'basketball';
  draftType: 'auction' | 'snake';
  scoringSystem: 'h2h' | 'rotisserie'; // New Field
  rosterConfig: 'open' | 'consistent'; // New Field
  isPublic: boolean;
  password?: string;
  maxTeams: number;
  budget: number;
  draftTimePerPick: number;
  idleTime: number;
  status: 'pending' | 'drafting' | 'completed';
  members: Array<{ userId: string; email: string, budget: number, isConnected: boolean, roster: Player[], isBot?: boolean, isAutoBid?: boolean, shortlist?: string[], tradeBalance?: number }>;
  playerPool: Array<{ id: string, name: string, price: number, position: string, image?: string, team?: string, isImport?: boolean, status?: string, fixtureHistory?: unknown[] }>;
  currentTurnIndex: number;
  currentSnakeRoute?: Array<{ userId: string, reverse: boolean }>; // array of userIds indicating the order
  currentSnakeIndex?: number;
  currentPlayerOut?: Player;
  highestBid?: { userId: string, amount: number };
  outUsers: string[];
  timerActive?: boolean;
  timeLeft: number;
  createdAt: Date;
  // Trade system
  trades?: Array<{ id: string, initiatorId: string, targetId: string, offer: Player[], receive: Player[], status: 'pending' | 'voting' | 'accepted' | 'rejected', votes?: Record<string, boolean> }>; 
  h2hSchedule?: Array<Array<{home: string, away: string}>>;
}

let draftRooms = new Map<string, DraftRoom>();

let globalTimer: NodeJS.Timeout | null = null;

export async function initDraftManager() {
  draftRooms = await loadDraftRooms() as Map<string, DraftRoom>;
  if (!globalTimer) {
     globalTimer = setInterval(tickAllDraftRooms, 1000);
  }
}

function tickAllDraftRooms() {
   for (const [draftId, room] of draftRooms.entries()) {
      if (room.status === 'drafting' && room.timerActive) {
         if (room.draftType === 'snake') {
            tickSnakeTurn(room, draftId);
         } else {
            tickAuctionTurn(room, draftId);
         }
      }
   }
}

export function getMaxRosterSize(sport: string) {
  return sport === 'football' ? 15 : 10;
}

export const ROSTER_LIMITS = {
  football: {
    GKP: 2,
    DEF: 5,
    MID: 5,
    FWD: 3
  },
  basketball: {
    PG: 2,
    SG: 2,
    SF: 2,
    PF: 2,
    C: 2
  }
};

export function canAddPlayerToConsistentRoster(sport: 'football' | 'basketball', roster: Player[], playerPosition: string) {
  const currentCount = roster.filter(p => p.position === playerPosition).length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const maxAllowed = (ROSTER_LIMITS as any)[sport][playerPosition] || 0;
  return currentCount < maxAllowed;
}

export function setupDraftManager(io: Server) {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    
    socket.on('join_draft', ({ draftId, userId }) => {
      const room = draftRooms.get(draftId);
      if (!room) {
        socket.emit('draft_error', { message: 'Draft not found' });
        return;
      }
      
      socket.join(draftId);
      socket.data = { ...socket.data, userId, draftId };
      
      // Update member status
      const member = room.members.find(m => m.userId === userId);
      if (member) {
        member.isConnected = true;
      }
      
      io.to(draftId).emit('draft_state_update', getRoomState(draftId));
    });
    
    socket.on('disconnect', () => {
      const { draftId, userId } = socket.data;
      if (draftId && userId) {
         const room = draftRooms.get(draftId);
         if (room) {
            const member = room.members.find(m => m.userId === userId);
            if (member) {
               member.isConnected = false;
               member.isAutoBid = true; // Auto fallback for disconnect
               io.to(draftId).emit('draft_state_update', getRoomState(draftId));
            }
         }
      }
    });
    
    socket.on('place_bid', ({ draftId, userId, amount }) => {
      const room = draftRooms.get(draftId);
      if (!room || room.status !== 'drafting') return;
      if (room.outUsers.includes(userId)) return;
      
      const member = room.members.find(m => m.userId === userId);
      if (!member) return;
      
      // Amount validation
      if (amount <= (room.highestBid?.amount || 0)) return;
      
      // Member budget validation
      const maxRosterSize = getMaxRosterSize(room.sport);
      const maxPossibleBid = member.budget - (maxRosterSize - member.roster.length - 1); // 1 USD reserved per empty spot up to maxRosterSize
      if (amount > maxPossibleBid) return;

      // Imports validation
      const currentImports = member.roster.filter((p: Player) => p && p.isImport).length;
      if (room.currentPlayerOut?.isImport && currentImports >= 3) return;

      // Position constraints
      if (room.rosterConfig === 'consistent' && room.currentPlayerOut) {
        if (!canAddPlayerToConsistentRoster(room.sport, member.roster, room.currentPlayerOut.position)) {
          return; // Skip place_bid if limit reached
        }
      }
      
      room.highestBid = { userId, amount };
      
      // Reset timer
      room.timeLeft = room.draftTimePerPick;
      
      saveDraftRoom(draftId, room).catch(console.error);
      
      io.to(draftId).emit('draft_state_update', getRoomState(draftId));
    });
    
    socket.on('fold_bid', ({ draftId, userId }) => {
      const room = draftRooms.get(draftId);
      if (!room || room.status !== 'drafting') return;
      if (!room.outUsers.includes(userId)) {
        room.outUsers.push(userId);
        
        const activeUsers = room.members.filter(m => !room.outUsers.includes(m.userId) && m.roster.length < getMaxRosterSize(room.sport));
        if (activeUsers.length <= 1) {
          if (room.timerActive) room.timeLeft = 1;
        }
        
        io.to(draftId).emit('draft_state_update', getRoomState(draftId));
      }
    });

    socket.on('toggle_auto_bid', ({ draftId, userId, isAutoBid }) => {
      const room = draftRooms.get(draftId);
      if (!room) return;
      const member = room.members.find(m => m.userId === userId);
      if (member) {
        member.isAutoBid = isAutoBid;
        io.to(draftId).emit('draft_state_update', getRoomState(draftId));
      }
    });

    socket.on('update_shortlist', ({ draftId, userId, shortlist }) => {
      const room = draftRooms.get(draftId);
      if (!room) return;
      const member = room.members.find(m => m.userId === userId);
      if (member) {
        member.shortlist = shortlist;
        io.to(draftId).emit('draft_state_update', getRoomState(draftId));
      }
    });

    socket.on('snake_pick', ({ draftId, userId, playerId }) => {
      const room = draftRooms.get(draftId);
      if (!room || room.status !== 'drafting' || room.draftType !== 'snake') return;
      
      const current = room.currentSnakeRoute?.[room.currentSnakeIndex || 0];
      if (!current || current.userId !== userId) return;

      const member = room.members.find(m => m.userId === userId);
      if (!member) return;

      const playerIdx = room.playerPool.findIndex((p: Player) => p.id === playerId);
      if (playerIdx === -1) return;

      const player = room.playerPool[playerIdx];

      // Position constraint
      if (room.rosterConfig === 'consistent') {
        if (!canAddPlayerToConsistentRoster(room.sport, member.roster, player.position)) {
          return;
        }
      }

      room.playerPool.splice(playerIdx, 1);
      member.roster.push(player as Player);

      room.currentSnakeIndex! += 1;
      
      saveDraftRoom(draftId, room).catch(console.error);
      
      // Stop timer and jump to next
      room.timerActive = false;
      startSnakeTurn(draftId);
    });
  });
}

export function getRoomState(draftId: string) {
  const room = draftRooms.get(draftId);
  if (!room) return null;
  
  return {
    ...room,
    bidTimer: undefined // strip out timer object
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDraftRoom(data: any) {
  // Enforce max 3 draft leagues per user
  let activeCount = 0;
  draftRooms.forEach(v => {
    if (v.creatorId === data.creatorId && v.sport === data.sport) {
       activeCount++;
    }
  });
  
  if (activeCount >= 3) {
    throw new Error("You can maximum start 3 draft fantasy leagues.");
  }

  const budget = data.budget ? parseInt(data.budget) : (data.maxTeams >= 11 ? 35 : 30);
  const draftId = `draft_${Date.now()}`;
  
  const members: DraftRoom['members'] = [{ userId: data.creatorId, email: data.creatorEmail, budget, isConnected: false, roster: [] }];
  if (data.botsCount) {
    const botsToAdd = Math.min(data.botsCount, data.maxTeams - 1);
    for (let i = 0; i < botsToAdd; i++) {
      members.push({
        userId: `bot_${i}_${Date.now()}`,
        email: `Bot_${i + 1}@ai.pro`,
        budget,
        isConnected: true,
        roster: [],
        isBot: true
      });
    }
  }

  const roomData: DraftRoom = {
    leagueId: draftId,
    creatorId: data.creatorId,
    name: data.name,
    sport: data.sport,
    draftType: data.draftType || 'auction',
    scoringSystem: data.scoringSystem || 'h2h',
    rosterConfig: data.rosterConfig || 'consistent',
    isPublic: data.isPublic !== undefined ? data.isPublic : true,
    password: data.password || undefined,
    maxTeams: data.maxTeams,
    budget,
    draftTimePerPick: data.draftTimePerPick,
    idleTime: data.idleTime || 30,
    status: 'pending',
    members,
    playerPool: data.players.sort((a: Player, b: Player) => b.price - a.price),
    currentTurnIndex: 0,
    outUsers: [],
    timeLeft: 0,
    trades: [],
    createdAt: new Date(),
  };
  
  draftRooms.set(draftId, roomData);
  saveDraftRoom(draftId, roomData).catch(console.error);
  
  return draftId;
}

export function joinDraftRoomAPI(draftId: string, userId: string, email: string, password?: string) {
  const room = draftRooms.get(draftId);
  if (!room) throw new Error("Draft not found");
  
  if (!room.isPublic) {
    if (room.password && room.password !== password) {
      throw new Error("Invalid password");
    }
  }

  const existing = room.members.find(m => m.userId === userId);
  if (existing) return true; // already joined
  
  if (room.status !== 'pending') throw new Error("Cannot join a draft that has already started or ended.");
  if (room.members.length >= room.maxTeams) throw new Error("Draft is full");

  room.members.push({ userId, email, budget: room.budget, isConnected: false, roster: [] });
  
  if (ioInstance) {
    ioInstance.to(draftId).emit('draft_state_update', getRoomState(draftId));
  }
  
  saveDraftRoom(draftId, room).catch(console.error);
  
  return true;
}

export function getPublicDrafts() {
  const active: string[] = [];
  draftRooms.forEach(v => {
    if (v.isPublic) {
      const lobj = {
        id: v.leagueId,
        name: v.name,
        sport: v.sport,
        draftType: v.draftType,
        isPublic: v.isPublic,
        hasPassword: !!v.password,
        membersCount: v.members.length,
        maxTeams: v.maxTeams,
        status: v.status
      };
      active.push(lobj as unknown as string);
    }
  });
  return active;
}

export function getAllDrafts() {
  const active: string[] = [];
  draftRooms.forEach(v => {
    const lobj = {
      id: v.leagueId,
      name: v.name,
      sport: v.sport,
      draftType: v.draftType,
      isPublic: v.isPublic,
      hasPassword: !!v.password,
      membersCount: v.members.length,
      maxTeams: v.maxTeams,
      status: v.status
    };
    active.push(lobj as unknown as string);
  });
  return active;
}

export function proposeTrade(draftId: string, initiatorId: string, targetId: string, offerPlayerIds: string[], receivePlayerIds: string[]) {
  const room = draftRooms.get(draftId);
  if (!room) throw new Error("Draft not found");
  if (room.status !== 'completed') throw new Error("Draft not completed");

  const initiator = room.members.find(m => m.userId === initiatorId);
  const target = room.members.find(m => m.userId === targetId);

  if (!initiator || !target) throw new Error("Member not found");

  const offerPlayers = initiator.roster.filter(p => offerPlayerIds.includes(p.id));
  const receivePlayers = target.roster.filter(p => receivePlayerIds.includes(p.id));

  if (offerPlayers.length === 0 || receivePlayers.length === 0) throw new Error("Invalid players");

  const offerValue = offerPlayers.reduce((sum, p) => sum + (p.price || 0), 0);
  const receiveValue = receivePlayers.reduce((sum, p) => sum + (p.price || 0), 0);

  // "Set a narrow range of difference in market value"
  const diffPercent = Math.abs(offerValue - receiveValue) / Math.max(offerValue, receiveValue, 1);
  if (diffPercent > 0.3) {
    throw new Error("Trade rejected: Value difference exceeds 30%");
  }

  // Prevent multiple unfavorable trades from bleeding a roster dry
  const initProjectedBalance = (initiator.tradeBalance || 0) + receiveValue - offerValue;
  const targProjectedBalance = (target.tradeBalance || 0) + offerValue - receiveValue;

  if (initProjectedBalance < -25) {
     throw new Error("Trade rejected: You have exceeded the maximum allowed trade deficit season-wide.");
  }
  if (targProjectedBalance < -25) {
     throw new Error("Trade rejected: Target manager has exceeded their maximum allowed trade deficit.");
  }

  const needsVote = diffPercent > 0.05; // "almost exact" = within 5%

  const tradeId = `trade_${Date.now()}`;
  if (!room.trades) room.trades = [];
  
  room.trades.push({
    id: tradeId,
    initiatorId,
    targetId,
    offer: offerPlayers,
    receive: receivePlayers,
    status: needsVote ? 'voting' : 'pending',
    votes: {} // userId -> boolean
  });

  saveDraftRoom(draftId, room).catch(console.error);
  return { tradeId, needsVote };
}

export function voteTrade(draftId: string, tradeId: string, userId: string, isFair: boolean) {
  const room = draftRooms.get(draftId);
  if (!room) throw new Error("Draft not found");

  const trade = room.trades?.find(t => t.id === tradeId);
  if (!trade || trade.status !== 'voting') throw new Error("Trade not available for voting");

  const member = room.members.find(m => m.userId === userId);
  if (!member) throw new Error("Member not found");

  if (!trade.votes) trade.votes = {};
  trade.votes[userId] = isFair;

  // Process votes
  const eligibleVoters = room.members.filter(m => m.userId !== trade.initiatorId && m.userId !== trade.targetId).length;
  
  const totalVotes = Object.keys(trade.votes).length;
  const agreeVotes = Object.values(trade.votes).filter(v => v).length;

  if (totalVotes === eligibleVoters) {
    const approvalRate = agreeVotes / eligibleVoters;
    if (approvalRate >= 0.75) {   // 75% majority
      trade.status = 'pending'; // Now target can accept it
    } else {
      trade.status = 'rejected';
    }
  }

  saveDraftRoom(draftId, room).catch(console.error);
  return trade;
}

export function respondTrade(draftId: string, tradeId: string, userId: string, action: 'accept' | 'reject') {
  const room = draftRooms.get(draftId);
  if (!room) throw new Error("Draft not found");

  const trade = room.trades?.find(t => t.id === tradeId);
  if (!trade) throw new Error("Trade not found");
  if (trade.status !== 'pending') throw new Error("Trade not in pending state");
  if (trade.targetId !== userId) throw new Error("Unauthorized");

  if (action === 'reject') {
      trade.status = 'rejected';
      saveDraftRoom(draftId, room).catch(console.error);
      return trade;
  }

  const initiator = room.members.find(m => m.userId === trade.initiatorId);
  const target = room.members.find(m => m.userId === trade.targetId);
  
  if (initiator && target) {
      if (room.rosterConfig === 'consistent') {
          // Pre-validate roster constraints
          const testInitRoster = initiator.roster.filter(p => !trade.offer.find(o => o.id === p.id));
          const testTargRoster = target.roster.filter(p => !trade.receive.find(r => r.id === p.id));
          
          for (const rp of trade.receive) {
              if (!canAddPlayerToConsistentRoster(room.sport, testInitRoster, rp.position)) {
                 throw new Error("Trade violates positional limits for initiator.");
              }
              testInitRoster.push(rp);
          }
          
          for (const op of trade.offer) {
              if (!canAddPlayerToConsistentRoster(room.sport, testTargRoster, op.position)) {
                 throw new Error("Trade violates positional limits for you.");
              }
              testTargRoster.push(op);
          }
      }

      // Swap players
      initiator.roster = initiator.roster.filter(p => !trade.offer.find(o => o.id === p.id));
      target.roster = target.roster.filter(p => !trade.receive.find(r => r.id === p.id));

      initiator.roster.push(...trade.receive);
      target.roster.push(...trade.offer);

      const offerVal = trade.offer.reduce((s: number, p: Player) => s + (p.price || 0), 0);
      const recVal = trade.receive.reduce((s: number, p: Player) => s + (p.price || 0), 0);
      initiator.tradeBalance = (initiator.tradeBalance || 0) + recVal - offerVal;
      target.tradeBalance = (target.tradeBalance || 0) + offerVal - recVal;

      trade.status = 'accepted';
  }

  saveDraftRoom(draftId, room).catch(console.error);
  return trade;
}

export function deleteDraftRoom(draftId: string) {
  const room = draftRooms.get(draftId);
  if (room) {
     room.timerActive = false;
  }
  draftRooms.delete(draftId);
  deleteDraftRoomDb(draftId).catch(console.error);
}

export function startDraftExecution(draftId: string, initiatorId?: string) {
  const room = draftRooms.get(draftId);
  if (!room || room.status !== 'pending') return;
  if (initiatorId && room.creatorId !== initiatorId) {
     throw new Error("Only the creator can start the draft.");
  }
  if (room.members.length < 2) {
     throw new Error("Need at least 2 members to start the draft.");
  }
  
  room.status = 'drafting';
  
  if (room.draftType === 'snake') {
    const userIds = room.members.map(m => m.userId);
    // shuffle
    for (let i = userIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [userIds[i], userIds[j]] = [userIds[j], userIds[i]];
    }
    const route = [];
    const maxRosterSize = getMaxRosterSize(room.sport);
    for (let round = 0; round < maxRosterSize; round++) {
        const roundOrder = round % 2 === 0 ? [...userIds] : [...userIds].reverse();
        for (const u of roundOrder) {
            route.push({ userId: u, reverse: round % 2 !== 0 });
        }
    }
    room.currentSnakeRoute = route;
    room.currentSnakeIndex = 0;
    
    startSnakeTurn(draftId);
  } else {
    nextPlayer(draftId);
  }
  saveDraftRoom(draftId, room).catch(console.error);
}

function findValidHighestPricedPlayer(room: DraftRoom, member: DraftRoom['members'][0]) {
  if (room.rosterConfig !== 'consistent') {
    return room.playerPool.length > 0 ? 0 : -1;
  }
  for (let i = 0; i < room.playerPool.length; i++) {
    const p = room.playerPool[i];
    if (canAddPlayerToConsistentRoster(room.sport, member.roster, p.position)) {
      return i;
    }
  }
  return -1; // Fallback or draft failure
}

function startSnakeTurn(draftId: string) {
    const room = draftRooms.get(draftId);
    if (!room) return;
    
    if (room.currentSnakeIndex! >= room.currentSnakeRoute!.length || room.playerPool.length === 0) {
       finalizeDraft(draftId);
       return;
    }
    
    room.timeLeft = room.draftTimePerPick;
    ioInstance.to(draftId).emit('draft_state_update', getRoomState(draftId));
    
    room.timerActive = true;
}

export function tickSnakeTurn(room: DraftRoom, draftId: string) {
    if (!room.timerActive) return;
    room.timeLeft -= 1;
    
    if (room.timeLeft > 0) {
        const currentUserId = room.currentSnakeRoute![room.currentSnakeIndex!].userId;
        const member = room.members.find((m: DraftRoom['members'][0]) => m.userId === currentUserId);
        
        if (member && (member.isBot || member.isAutoBid)) {
            // simple bot logic for snake: pick highest priced available player
            const pIdx = findValidHighestPricedPlayer(room, member);
            if (pIdx !== -1) {
              const topPlayer = room.playerPool.splice(pIdx, 1)[0];
              member.roster.push(topPlayer as Player);
            }
            room.currentSnakeIndex! += 1;
            room.timerActive = false;
            setTimeout(() => startSnakeTurn(draftId), 1000); // 1s pause between auto picks
            return;
        }
    }
    
    if (room.timeLeft <= 0) {
        // time up, auto draft highest priced available
        const currentUserId = room.currentSnakeRoute![room.currentSnakeIndex!].userId;
        const member = room.members.find((m: DraftRoom['members'][0]) => m.userId === currentUserId);
        if (member) {
           const pIdx = findValidHighestPricedPlayer(room, member);
           if (pIdx !== -1) {
             const topPlayer = room.playerPool.splice(pIdx, 1)[0];
             member.roster.push(topPlayer as Player);
           }
        }
        
        room.currentSnakeIndex! += 1;
        room.timerActive = false;
        startSnakeTurn(draftId);
        return;
    }
    
    ioInstance.to(draftId).emit('draft_timer_sync', { timeLeft: room.timeLeft });
}

function generateH2HSchedule(memberIds: string[]) {
  const teams = [...memberIds];
  if (teams.length % 2 !== 0) {
    teams.push('BYE');
  }
  
  const numRounds = teams.length - 1;
  const halfSize = teams.length / 2;
  const schedule = [];
  
  const tempTeams = [...teams];
  tempTeams.shift(); 
  
  for (let round = 0; round < numRounds; round++) {
      const matchUps = [];
      const teamIdx = round % tempTeams.length;
      matchUps.push({ home: teams[0], away: tempTeams[teamIdx] });
      
      for (let idx = 1; idx < halfSize; idx++) {
          const firstTeam = tempTeams[(round + idx) % tempTeams.length];
          const secondTeam = tempTeams[(round + tempTeams.length - idx) % tempTeams.length];
          matchUps.push({ home: firstTeam, away: secondTeam });
      }
      schedule.push({ round: round + 1, matches: matchUps });
  }
  
  const fullSchedule = [];
  for (let i = 0; i < 38; i++) {
     const baseRoundMatches = schedule[i % schedule.length].matches;
     const validMatches = baseRoundMatches;
     fullSchedule.push({ gameweek: i + 1, matches: validMatches.map(m => ({ homeId: m.home, awayId: m.away, homeScore: 0, awayScore: 0 })) });
  }
  return fullSchedule;
}

function finalizeDraft(draftId: string) {
  const room = draftRooms.get(draftId);
  if (!room) return;
  room.status = 'completed';
  if (room.scoringSystem === 'h2h') {
     room.h2hSchedule = generateH2HSchedule(room.members.map((m: DraftRoom['members'][0]) => m.userId));
  }
  ioInstance.to(draftId).emit('draft_state_update', getRoomState(draftId));
  saveDraftRoom(draftId, room).catch(console.error);
}

function nextPlayer(draftId: string) {
  const room = draftRooms.get(draftId);
  if (!room) return;
  
  const maxRosterSize = getMaxRosterSize(room.sport);

  if (room.playerPool.length === 0 || room.members.every(m => m.roster.length >= maxRosterSize)) {
    // Draft ends
    finalizeDraft(draftId);
    return;
  }
  
  room.currentPlayerOut = room.playerPool.shift() as Player;
  room.highestBid = undefined;
  room.outUsers = [];
  room.timeLeft = room.draftTimePerPick;
  
  ioInstance.to(draftId).emit('draft_state_update', getRoomState(draftId));
  
  // Timer interval
  room.timerActive = true;
}

export function tickAuctionTurn(room: DraftRoom, draftId: string) {
  if (!room.timerActive) return;
  const maxRosterSize = getMaxRosterSize(room.sport);
  room.timeLeft -= 1;
  
  if (room.timeLeft > 0) {
    // Bot Logic
    const currentHighestAmount = room.highestBid ? room.highestBid.amount : 0;
    const currentHighestUserId = room.highestBid ? room.highestBid.userId : null;
    
    const eligibleBots = room.members.filter((m: DraftRoom['members'][0]) => (m.isBot || m.isAutoBid) && m.roster.length < maxRosterSize && m.userId !== currentHighestUserId && !room.outUsers.includes(m.userId));
    if (eligibleBots.length > 0) {
       // Shuffle bots or pick one
       const bot = eligibleBots[Math.floor(Math.random() * eligibleBots.length)];
       
       // If it's a real user on autobid, check shortlist
       let wantsPlayer = true;
       if (!bot.isBot && bot.shortlist && bot.shortlist.length > 0) {
          wantsPlayer = bot.shortlist.includes(room.currentPlayerOut.id);
       }
       
       const currentImports = bot.roster.filter((p: Player) => p && p.isImport).length;
       if (room.currentPlayerOut?.isImport && currentImports >= 3) wantsPlayer = false;

       if (room.rosterConfig === 'consistent' && room.currentPlayerOut) {
          if (!canAddPlayerToConsistentRoster(room.sport, bot.roster, room.currentPlayerOut.position)) {
             wantsPlayer = false;
          }
       }

       if (wantsPlayer) {
         const maxPossibleBid = bot.budget - (maxRosterSize - bot.roster.length - 1);
         // Real users might want to pay more for shortlisted players, but let's keep it simple.
         const maxWillingToPay = Math.min(maxPossibleBid, room.currentPlayerOut.price + (!bot.isBot ? 5 : 2)); 
         const requiredBid = currentHighestAmount + 1;
         
         if (requiredBid <= maxWillingToPay) {
            // Increase chance when time is short or if the bot really wants them
            const bidChance = room.timeLeft <= 2 ? 0.8 : (!bot.isBot ? 0.3 : 0.1);
            if (Math.random() < bidChance) {
               room.highestBid = { userId: bot.userId, amount: requiredBid };
               room.timeLeft = room.draftTimePerPick; // Reset timer when bid occurs
               ioInstance.to(draftId).emit('draft_state_update', getRoomState(draftId));
            }
         } else {
            if (!room.outUsers.includes(bot.userId)) {
               room.outUsers.push(bot.userId);
               const activeUsers = room.members.filter((m: DraftRoom['members'][0]) => !room.outUsers.includes(m.userId) && m.roster.length < maxRosterSize);
               if (activeUsers.length <= 1) room.timeLeft = 1;
               ioInstance.to(draftId).emit('draft_state_update', getRoomState(draftId));
            }
         }
       } else {
          // Does not want the player, so fold
          if (!room.outUsers.includes(bot.userId)) {
             room.outUsers.push(bot.userId);
             const activeUsers = room.members.filter((m: DraftRoom['members'][0]) => !room.outUsers.includes(m.userId) && m.roster.length < maxRosterSize);
             if (activeUsers.length <= 1) room.timeLeft = 1;
             ioInstance.to(draftId).emit('draft_state_update', getRoomState(draftId));
          }
       }
    }
  }

  if (room.timeLeft <= 0) {
    room.timerActive = false;
    // Time up, process winner
    if (room.highestBid) {
      const winner = room.members.find((m: DraftRoom['members'][0]) => m.userId === room.highestBid!.userId);
      if (winner) {
        winner.roster.push(room.currentPlayerOut);
        winner.budget -= room.highestBid.amount;
      }
    } else {
      // No one bid... system random bid?
      let incomplete = room.members.filter((m: DraftRoom['members'][0]) => m.roster.length < maxRosterSize);
      if (room.rosterConfig === 'consistent' && room.currentPlayerOut) {
         incomplete = incomplete.filter((m: DraftRoom['members'][0]) => canAddPlayerToConsistentRoster(room.sport, m.roster, room.currentPlayerOut.position));
      }
      if (incomplete.length > 0) {
        const rand = incomplete[Math.floor(Math.random() * incomplete.length)];
        rand.roster.push(room.currentPlayerOut);
        rand.budget -= 1;
      } else {
         // No one can take this player (e.g. all positions filled, or out of budget/slots constraint)
         // Do not assign the player. They are passed.
      }
    }
    
    // Short delay before next pick
    setTimeout(() => nextPlayer(draftId), 2000);
  }
  
  ioInstance.to(draftId).emit('draft_timer_sync', { timeLeft: room.timeLeft });
}
