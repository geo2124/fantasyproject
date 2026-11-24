const fs = require('fs');

const content = `import { PrismaClient } from "@prisma/client";
import { mockPlayers, mockFixtures, mockUsers, mockSquads } from "../src/data/mockData";

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database...');
  
  for (const user of mockUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    });
  }

  await prisma.player.deleteMany({});
  for (const p of mockPlayers) {
    await prisma.player.create({
      data: {
        id: p.id,
        name: p.name,
        team: p.team,
        position: p.position,
        price: p.price,
        totalPoints: p.totalPoints,
        status: p.status,
        sport: p.sport,
        image: p.image || null,
        basketballPosDetail: p.basketballPosDetail ? JSON.stringify(p.basketballPosDetail) : null,
        fixtureHistory: JSON.stringify(p.fixtureHistory || [])
      }
    });
  }

  await prisma.fixture.deleteMany({});
  for (const f of mockFixtures) {
    await prisma.fixture.create({
      data: {
        id: f.id,
        homeTeam: f.homeTeam,
        awayTeam: f.awayTeam,
        homeScore: f.homeScore,
        awayScore: f.awayScore,
        datetime: new Date(f.datetime),
        status: f.status,
        sport: f.sport,
        league: f.league,
        matchday: f.matchday
      }
    });
  }

  await prisma.squad.deleteMany({});
  for (const s of mockSquads) {
    await prisma.squad.create({
        data: {
            id: s.id,
            userId: s.userId,
            name: s.name,
            bank: s.bank,
            totalPoints: s.totalPoints,
            overallRank: s.overallRank,
            sport: s.sport,
            draftLeagueId: s.draftLeagueId || null,
            players: JSON.stringify(s.players)
        }
    })
  }

  console.log('Seeding completed!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
`;

fs.writeFileSync('prisma/seed.ts', content);
