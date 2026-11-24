import { PlayerFixture } from '../../types';

export class ScoringEngine {
  /**
   * Calculates points for a single player in a single fixture
   */
  static calculatePlayerPoints(fixtureStats: PlayerFixture, position: string): number {
    let points = 0;

    // Appearance points
    if (fixtureStats.minutesPlayed > 0) points += 1;
    if (fixtureStats.minutesPlayed >= 60) points += 1;

    // Goals
    if (position === 'FWD') points += fixtureStats.goals * 4;
    if (position === 'MID') points += fixtureStats.goals * 5;
    if (position === 'DEF' || position === 'GKP') points += fixtureStats.goals * 6;

    // Assists
    points += fixtureStats.assists * 3;

    // Clean sheet
    if (fixtureStats.cleanSheet && fixtureStats.minutesPlayed >= 60) {
      if (position === 'DEF' || position === 'GKP') points += 4;
      if (position === 'MID') points += 1;
    }

    // Additional rules (yellow cards, saves, etc.) would be here

    return points;
  }
}
