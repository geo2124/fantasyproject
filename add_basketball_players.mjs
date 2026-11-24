import fs from 'fs';

const path = 'src/data/mockData.ts';
let content = fs.readFileSync(path, 'utf8');

const additionalPlayers = `
  // Basketball Players
  { id: 'b1', name: 'Wael Arakji', team: 'RIY', position: 'PG', price: 15.0, totalPoints: 210, status: 'available', fixtureHistory: [], sport: 'basketball' },
  { id: 'b2', name: 'Ali Haidar', team: 'BEI', position: 'PF', price: 14.5, totalPoints: 195, status: 'available', fixtureHistory: [], sport: 'basketball' },
  { id: 'b3', name: 'Sergio El Darwich', team: 'SAG', position: 'SG', price: 12.0, totalPoints: 180, status: 'available', fixtureHistory: [], sport: 'basketball' },
  { id: 'b4', name: 'Karim Zeinoun', team: 'RIY', position: 'SG', price: 10.5, totalPoints: 160, status: 'available', fixtureHistory: [], sport: 'basketball' },
  { id: 'b5', name: 'Ali Mansour', team: 'DYN', position: 'PG', price: 9.0, totalPoints: 140, status: 'available', fixtureHistory: [], sport: 'basketball' },
  { id: 'b6', name: 'Ater Majok', team: 'SAG', position: 'C', price: 13.0, totalPoints: 170, status: 'available', fixtureHistory: [], sport: 'basketball' },
  { id: 'b7', name: 'Amir Saoud', team: 'RIY', position: 'SG', price: 11.5, totalPoints: 155, status: 'available', fixtureHistory: [], sport: 'basketball' },
`;

content = content.replace(/export const mockPlayers: Player\[\] = \[/, 'export const mockPlayers: Player[] = [\n' + additionalPlayers);
content = content.replace(/\{ id: 'p1',/g, '{ sport: \'football\', id: \'p1\',');
content = content.replace(/\{ id: 'p2',/g, '{ sport: \'football\', id: \'p2\',');
content = content.replace(/\{ id: 'p3',/g, '{ sport: \'football\', id: \'p3\',');
content = content.replace(/\{ id: 'p4',/g, '{ sport: \'football\', id: \'p4\',');
content = content.replace(/\{ id: 'p5',/g, '{ sport: \'football\', id: \'p5\',');
content = content.replace(/\{ id: 'p6',/g, '{ sport: \'football\', id: \'p6\',');
content = content.replace(/\{ id: 'p7',/g, '{ sport: \'football\', id: \'p7\',');

fs.writeFileSync(path, content, 'utf8');
