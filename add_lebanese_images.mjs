import fs from 'fs';

const path = 'src/data/mockData.ts';
let content = fs.readFileSync(path, 'utf8');

const replacement = `
  // Basketball Players
  { id: 'b1', name: 'Wael Arakji', team: 'Al Riyadi', position: 'PG', price: 15.0, totalPoints: 210, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Wael_Arakji.jpg' },
  { id: 'b2', name: 'Ali Haidar', team: 'Beirut Club', position: 'PF', price: 14.5, totalPoints: 195, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://placehold.co/400x400/26B6B1/white?text=AH' },
  { id: 'b3', name: 'Sergio El Darwich', team: 'Sagesse', position: 'SG', price: 12.0, totalPoints: 180, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://placehold.co/400x400/26B6B1/white?text=SD' },
  { id: 'b4', name: 'Karim Zeinoun', team: 'Al Riyadi', position: 'SG', price: 10.5, totalPoints: 160, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://placehold.co/400x400/26B6B1/white?text=KZ' },
  { id: 'b5', name: 'Ali Mansour', team: 'Dynamo', position: 'PG', price: 9.0, totalPoints: 140, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://placehold.co/400x400/26B6B1/white?text=AM' },
  { id: 'b6', name: 'Ater Majok', team: 'Sagesse', position: 'C', price: 13.0, totalPoints: 170, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://placehold.co/400x400/26B6B1/white?text=AM' },
  { id: 'b7', name: 'Amir Saoud', team: 'Al Riyadi', position: 'SG', price: 11.5, totalPoints: 155, status: 'available', fixtureHistory: [], sport: 'basketball', image: 'https://placehold.co/400x400/26B6B1/white?text=AS' },

  // Football Players
  { sport: 'football', id: 'p1', name: 'Hassan Maatouk', team: 'Al Ansar', position: 'FWD', price: 14.0, totalPoints: 180, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/144673-1629891784.jpg' },
  { sport: 'football', id: 'p2', name: 'Mohamad Haidar', team: 'Al Ahed', position: 'MID', price: 13.0, totalPoints: 175, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171578-1568213693.jpg' },
  { sport: 'football', id: 'p3', name: 'Rabih Ataya', team: 'Nejmeh', position: 'MID', price: 9.0, totalPoints: 150, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171577-1629891395.jpg' },
  { sport: 'football', id: 'p4', name: 'Bassel Jradi', team: 'Bangkok United', position: 'FWD', price: 8.5, totalPoints: 140, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/267727-1602061036.jpg' },
  { sport: 'football', id: 'p5', name: 'Kassem El Zein', team: 'Nejmeh', position: 'DEF', price: 7.0, totalPoints: 100, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/171574-1629892015.jpg' },
  { sport: 'football', id: 'p6', name: 'Mostafa Matar', team: 'Al Ahed', position: 'GKP', price: 5.5, totalPoints: 90, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/543166-1629891963.jpg' },
  { sport: 'football', id: 'p7', name: 'Nour Mansour', team: 'Al Ahed', position: 'DEF', price: 5.5, totalPoints: 110, status: 'available', fixtureHistory: [], image: 'https://img.a.transfermarkt.technology/portrait/header/144672-1629891638.jpg' },
`;

content = content.replace(/\/\/ Basketball Players[\s\S]+?\];/m, replacement + '\n];');
fs.writeFileSync(path, content, 'utf8');
