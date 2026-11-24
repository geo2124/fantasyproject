import { Player, Squad } from '../../types';

export class FantasyEngine {
  static readonly SQUAD_SIZE = 15;
  static readonly STARTING_SIZE = 11;
  static readonly MAX_PLAYERS_PER_TEAM = 3;

  /**
   * Validates if a proposed transfer is legal
   */
  static validateTransfer(
    currentSquad: Squad | null, 
    allPlayers: Player[],
    transfersInIds: string[], 
    transfersOutIds: string[],
    newPlayerId: string,
    sport: 'football' | 'basketball'
  ): { valid: boolean; reason?: string } {
    if (!currentSquad) return { valid: false, reason: 'No active squad found.' };
    
    // 1. Target Size Rules
    const targetSize = sport === 'basketball' ? 10 : 15;
    const prospectiveTotal = (currentSquad.players.length) - transfersOutIds.length + transfersInIds.length + 1;
    
    if (prospectiveTotal > targetSize) {
      return { valid: false, reason: `You can only have ${targetSize} players in your squad! You must transfer someone out to make room.` };
    }

    if (!currentSquad.draftLeagueId && !currentSquad.favoriteClub) {
      return { valid: false, reason: 'Please select a favorite club first!' };
    }

    // 2. Composition Checks
    const currentActiveIds = currentSquad.players.map(p => p.playerId).filter(id => !transfersOutIds.includes(id));
    const prospectiveIds = [...currentActiveIds, ...transfersInIds, newPlayerId];
    
    const teamCounts: Record<string, number> = {};
    const positionCounts: Record<string, number> = {};
    
    prospectiveIds.forEach(id => {
      const p = allPlayers.find(x => x.id === id);
      if (p) {
        teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
        const pos = sport === 'basketball' ? (p.basketballPosDetail?.primary || p.position) : p.position;
        positionCounts[pos] = (positionCounts[pos] || 0) + 1;
      }
    });

    if (sport === 'football') {
      if ((positionCounts['GKP'] || 0) > 2) return { valid: false, reason: 'Maximum 2 Goalkeepers allowed.' };
      if ((positionCounts['DEF'] || 0) > 5) return { valid: false, reason: 'Maximum 5 Defenders allowed.' };
      if ((positionCounts['MID'] || 0) > 5) return { valid: false, reason: 'Maximum 5 Midfielders allowed.' };
      if ((positionCounts['FWD'] || 0) > 3) return { valid: false, reason: 'Maximum 3 Forwards allowed.' };
    } else {
      if ((positionCounts['PG'] || 0) > 2) return { valid: false, reason: 'Maximum 2 Point Guards allowed.' };
      if ((positionCounts['SG'] || 0) > 2) return { valid: false, reason: 'Maximum 2 Shooting Guards allowed.' };
      if ((positionCounts['SF'] || 0) > 2) return { valid: false, reason: 'Maximum 2 Small Forwards allowed.' };
      if ((positionCounts['PF'] || 0) > 2) return { valid: false, reason: 'Maximum 2 Power Forwards allowed.' };
      if ((positionCounts['C'] || 0) > 2) return { valid: false, reason: 'Maximum 2 Centers allowed.' };
    }

    if (!currentSquad.draftLeagueId) {
      for (const [team, count] of Object.entries(teamCounts)) {
        if (team === currentSquad.favoriteClub) {
          if (count > 5) return { valid: false, reason: `Maximum 5 players from your favorite club (${currentSquad.favoriteClub}).` };
        } else {
          if (count > 3) return { valid: false, reason: `Maximum 3 players from any other club (${team}).` };
        }
      }
    } else {
      for (const [team, count] of Object.entries(teamCounts)) {
        if (count > 3) return { valid: false, reason: `Maximum 3 players from any club (${team}).` };
      }
    }

    return { valid: true };
  }

  static validateDraftPick(
    roster: Player[], 
    newPlayer: Player, 
    sport: 'football' | 'basketball'
  ): { valid: boolean; reason?: string } {
    const targetSize = sport === 'football' ? 15 : 10;
    if (roster.length >= targetSize) {
      return { valid: false, reason: 'Roster is full.' };
    }

    const currentAndNew = [...roster, newPlayer];
    const positionCounts: Record<string, number> = {};
    const teamCounts: Record<string, number> = {};
    
    currentAndNew.forEach(p => {
      teamCounts[p.team] = (teamCounts[p.team] || 0) + 1;
      const pos = sport === 'basketball' ? (p.basketballPosDetail?.primary || p.position) : p.position;
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    });

    if (sport === 'football') {
      if ((positionCounts['GKP'] || 0) > 3) return { valid: false, reason: 'Maximum 3 Goalkeepers allowed in Draft.' };
      if ((positionCounts['DEF'] || 0) > 8) return { valid: false, reason: 'Maximum 8 Defenders allowed in Draft.' };
      if ((positionCounts['MID'] || 0) > 8) return { valid: false, reason: 'Maximum 8 Midfielders allowed in Draft.' };
      if ((positionCounts['FWD'] || 0) > 6) return { valid: false, reason: 'Maximum 6 Forwards allowed in Draft.' };
    } else {
      if ((positionCounts['PG'] || 0) > 3) return { valid: false, reason: 'Maximum 3 Point Guards allowed in Draft.' };
      if ((positionCounts['SG'] || 0) > 3) return { valid: false, reason: 'Maximum 3 Shooting Guards allowed in Draft.' };
      if ((positionCounts['SF'] || 0) > 3) return { valid: false, reason: 'Maximum 3 Small Forwards allowed in Draft.' };
      if ((positionCounts['PF'] || 0) > 3) return { valid: false, reason: 'Maximum 3 Power Forwards allowed in Draft.' };
      if ((positionCounts['C'] || 0) > 3) return { valid: false, reason: 'Maximum 3 Centers allowed in Draft.' };
    }

    // Enforce team limits for drafts
    for (const [team, count] of Object.entries(teamCounts)) {
      if (count > 3) return { valid: false, reason: `Maximum 3 players from any club (${team}) allowed in Draft.` };
    }
    
    return { valid: true };
  }
}
