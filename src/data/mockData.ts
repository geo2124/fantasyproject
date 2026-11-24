import { Player, Fixture, Squad, User } from '../types';

export const mockUsers: User[] = [
  { id: 'u1', username: 'test', email: 'test@demo.com', role: 'user', teamId: 'sq1' },
  { id: 'a1', username: 'admin', email: 'admin@demo.com', role: 'admin' }
];

export const mockPlayers: Player[] = [
  // Basketball Players
  { id: 'b1', name: 'Wael Arakji', team: 'Al Riyadi', position: 'PG', price: 8.5, totalPoints: 210, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Wael_Arakji.jpg', basketballPosDetail: { type: 'combo', primary: 'PG', secondary: 'SG', label: 'COMBO GUARD' } },
  { id: 'b2', name: 'Ali Haidar', team: 'Beirut Club', position: 'PF', price: 8.0, totalPoints: 195, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'C', label: 'BIG' } },
  { id: 'b3', name: 'Sergio El Darwich', team: 'Sagesse', position: 'SG', price: 7.5, totalPoints: 180, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'SF', label: 'GUARD' } },
  { id: 'b4', name: 'Karim Zeinoun', team: 'Al Riyadi', position: 'SG', price: 6.0, totalPoints: 160, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'SF', label: 'WING' } },
  { id: 'b5', name: 'Ali Mansour', team: 'Dynamo', position: 'PG', price: 5.5, totalPoints: 140, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
  { id: 'b6', name: 'Ater Majok', team: 'Sagesse', position: 'C', price: 7.0, totalPoints: 170, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'C', label: 'CENTER' } },
  { id: 'b7', name: 'Amir Saoud', team: 'Al Riyadi', position: 'SG', price: 6.5, totalPoints: 155, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'SHARPSHOOTER' } },
  { id: 'b8', name: 'Hayk Gyokchyan', team: 'Al Riyadi', position: 'PF', price: 4.5, totalPoints: 130, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'SF', label: 'FORWARD' } },
  { id: 'b9', name: 'Jean Abdel Nour', team: 'Al Riyadi', position: 'SF', price: 2.0, totalPoints: 85, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SF', label: 'WING' } },
  { id: 'b10', name: 'Gerard Hadidian', team: 'Beirut Club', position: 'C', price: 3.5, totalPoints: 110, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1542178243-fc20202b85e6?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'C', label: 'CENTER' } },
  { id: 'b11', name: 'Mark Khoury', team: 'Sagesse', position: 'PF', price: 1.5, totalPoints: 45, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'SF', label: 'FORWARD' } },
  { id: 'b12', name: 'Elie Rustom', team: 'Beirut Club', position: 'SF', price: 3.0, totalPoints: 95, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SF', label: 'WING' } },
  { id: 'b13', name: 'Jad Khalil', team: 'Dynamo', position: 'PG', price: 4.0, totalPoints: 120, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PG', secondary: 'SG', label: 'COMBO GUARD' } },
  { id: 'b14', name: 'Marc Khoueiry', team: 'Sagesse', position: 'SG', price: 1.5, totalPoints: 50, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'GUARD' } },
  { id: 'b15', name: 'Jimmy Salem', team: 'Dynamo', position: 'SG', price: 2.0, totalPoints: 60, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'SF', label: 'WING' } },
  { id: 'b16', name: 'Karim Ezzedine', team: 'Dynamo', position: 'C', price: 2.5, totalPoints: 75, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'C', secondary: 'PF', label: 'BIG' } },
  { id: 'b17', name: 'Omar Jamaleddine', team: 'Beirut Club', position: 'SF', price: 2.5, totalPoints: 80, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SF', label: 'WING' } },
  { id: 'b18', name: 'Ali Mezher', team: 'Sagesse', position: 'PG', price: 3.5, totalPoints: 105, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
  { id: 'b19', name: 'Georges El Beyrouty', team: 'Dynamo', position: 'PG', price: 1.5, totalPoints: 40, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
  { id: 'b20', name: 'Gabriel Salibi', team: 'Beirut Club', position: 'SG', price: 1.0, totalPoints: 20, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'GUARD' } },
  { id: 'b21', name: 'Nadim Souaid', team: 'Sagesse', position: 'SF', price: 1.0, totalPoints: 25, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1504257404282-534fc139367c?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SF', label: 'WING' } },
  { id: 'b22', name: 'Izzat El Kaissi', team: 'Al Riyadi', position: 'C', price: 1.0, totalPoints: 15, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'C', label: 'CENTER' } },

  { id: 'b23', name: 'Ali Farhat', team: 'Hoops', position: 'PG', price: 1.5, totalPoints: 30, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
  { id: 'b24', name: 'Khalil Aoun', team: 'Hoops', position: 'PF', price: 2.0, totalPoints: 40, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'C', label: 'BIG' } },
  { id: 'b25', name: 'Jason Rabeh', team: 'Hoops', position: 'SG', price: 1.0, totalPoints: 10, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'SF', label: 'WING' } },
  
  { id: 'b26', name: 'Youssef Ghantous', team: 'Antranik', position: 'PG', price: 2.5, totalPoints: 60, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
  { id: 'b27', name: 'Christian Harvey', team: 'Antranik', position: 'SG', price: 3.5, totalPoints: 90, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SG', secondary: 'PG', label: 'GUARD' } },
  { id: 'b28', name: 'Salim Alaaeddine', team: 'Antranik', position: 'PF', price: 1.0, totalPoints: 15, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PF', label: 'FORWARD' } },
  
  { id: 'b29', name: 'Javien Williams', team: 'Champville', position: 'SG', price: 4.5, totalPoints: 120, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'SHARPSHOOTER' } },
  { id: 'b30', name: 'Patrick Bou Abboud', team: 'Champville', position: 'SF', price: 3.0, totalPoints: 70, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'SF', secondary: 'PF', label: 'FORWARD' } },
  { id: 'b31', name: 'Gaby Ajemian', team: 'Champville', position: 'PG', price: 1.5, totalPoints: 25, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1542178243-fc20202b85e6?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'PG', label: 'POINT GUARD' } },
  
  { id: 'b32', name: 'Dallas Morgan', team: 'NSA', position: 'SG', price: 4.0, totalPoints: 100, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'SG', label: 'GUARD' } },
  { id: 'b33', name: 'Calvin Godfrey', team: 'NSA', position: 'C', price: 5.0, totalPoints: 130, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'fixed', primary: 'C', label: 'CENTER' } },
  { id: 'b34', name: 'Elias Sebaaly', team: 'NSA', position: 'PF', price: 1.0, totalPoints: 10, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250&h=250', basketballPosDetail: { type: 'combo', primary: 'PF', secondary: 'SF', label: 'FORWARD' } },
  
  // Football Players
  { sport: 'football', id: 'p1', name: 'Hassan Maatouk', team: 'Al Ansar', position: 'FWD', price: 14.0, totalPoints: 180, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/144673-1629891784.jpg' },
  { sport: 'football', id: 'p2', name: 'Mohamad Haidar', team: 'Al Ahed', position: 'MID', price: 13.0, totalPoints: 175, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171578-1568213693.jpg' },
  { sport: 'football', id: 'p3', name: 'Rabih Ataya', team: 'Nejmeh', position: 'MID', price: 9.0, totalPoints: 150, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171577-1629891395.jpg' },
  { sport: 'football', id: 'p4', name: 'Bassel Jradi', team: 'Bangkok United', position: 'FWD', price: 8.5, totalPoints: 140, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/267727-1602061036.jpg' },
  { sport: 'football', id: 'p5', name: 'Kassem El Zein', team: 'Nejmeh', position: 'DEF', price: 7.0, totalPoints: 100, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171574-1629892015.jpg' },
  { sport: 'football', id: 'p6', name: 'Mostafa Matar', team: 'Al Ahed', position: 'GKP', price: 5.5, totalPoints: 90, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/543166-1629891963.jpg' },
  { sport: 'football', id: 'p7', name: 'Nour Mansour', team: 'Al Ahed', position: 'DEF', price: 5.5, totalPoints: 110, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/144672-1629891638.jpg' },
];

export const mockFixtures: Fixture[] = [
  { id: 'f1', sport: 'football', homeTeam: 'MCI', awayTeam: 'LIV', date: new Date().toISOString(), homeScore: null, awayScore: null, status: 'upcoming' },
  { id: 'f2', sport: 'football', homeTeam: 'ARS', awayTeam: 'AVL', date: new Date().toISOString(), homeScore: null, awayScore: null, status: 'upcoming' }
];

export const mockSquads: Squad[] = [
  {
    id: 'sq1',
    userId: 'u1',
    name: 'FC Demo',
    bank: 100.0,
    totalPoints: 1240,
    overallRank: 12345,
    sport: 'football',
    players: [
      { playerId: 'p1', isCaptain: true, isViceCaptain: false, isStarting: true, positionIndex: 10 },
      { playerId: 'p2', isCaptain: false, isViceCaptain: true, isStarting: true, positionIndex: 8 },
    ]
  },
  {
    id: 'sq2',
    userId: 'u1',
    name: 'BC Demo',
    bank: 60.0,
    totalPoints: 1100,
    overallRank: 3450,
    sport: 'basketball',
    players: [
      { playerId: 'b1', isCaptain: true, isViceCaptain: false, isStarting: true, positionIndex: 1 },
      { playerId: 'b2', isCaptain: false, isViceCaptain: false, isStarting: true, positionIndex: 4 },
      { playerId: 'b6', isCaptain: false, isViceCaptain: true, isStarting: true, positionIndex: 5 },
    ]
  }
];
