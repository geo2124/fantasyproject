import fs from 'fs';

let text = fs.readFileSync('src/server/draftManager.ts', 'utf-8');

text = text.replace("import { DraftLeague, Player } from '../types';", "import { Player } from '../types';");
text = text.replace("roster: any[]", "roster: Player[]");
text = text.replace("fixtureHistory?: any[] }", "fixtureHistory?: unknown[] }");
text = text.replace("currentPlayerOut?: any;", "currentPlayerOut?: Player;");
text = text.replace("offer: any[], receive: any[], status: 'pending' | 'voting' | 'accepted' | 'rejected', votes?: any }", "offer: Player[], receive: Player[], status: 'pending' | 'voting' | 'accepted' | 'rejected', votes?: Record<string, boolean> }");
text = text.replace("h2hSchedule?: any;", "h2hSchedule?: Array<Array<{home: string, away: string}>>;");
text = text.replace("roster: any[], playerPosition: string", "roster: Player[], playerPosition: string");
text = text.replace("roster.filter((p: any) => p && p.isImport)", "roster.filter((p: Player) => p && p.isImport)");
text = text.replace("findIndex((p: any) => p.id === playerId)", "findIndex((p: Player) => p.id === playerId)");
text = text.replace("export function createDraftRoom(data: any)", "export function createDraftRoom(data: any)");
text = text.replace("members: any[] = [{ userId:", "members: DraftRoom['members'] = [{ userId:");
text = text.replace("playerPool: data.players.sort((a: any, b: any) => b.price - a.price),", "playerPool: data.players.sort((a: Player, b: Player) => b.price - a.price),");
text = text.replace("const active: any[] = [];", "const active: string[] = [];");
text = text.replace("const active: any[] = [];", "const active: string[] = [];");
text = text.replace("reduce((s: number, p: any) => s + (p.price || 0), 0)", "reduce((s: number, p: Player) => s + (p.price || 0), 0)");
text = text.replace("reduce((s: number, p: any) => s + (p.price || 0), 0)", "reduce((s: number, p: Player) => s + (p.price || 0), 0)");
text = text.replace("function findValidHighestPricedPlayer(room: any, member: any)", "function findValidHighestPricedPlayer(room: DraftRoom, member: DraftRoom['members'][0])");
text = text.replace("export function tickSnakeTurn(room: any, draftId: string)", "export function tickSnakeTurn(room: DraftRoom, draftId: string)");
text = text.replace("room.members.find((m: any) => m.userId === currentUserId)", "room.members.find((m: DraftRoom['members'][0]) => m.userId === currentUserId)");
text = text.replace("room.members.find((m: any) => m.userId === currentUserId)", "room.members.find((m: DraftRoom['members'][0]) => m.userId === currentUserId)");
text = text.replace("generateH2HSchedule(room.members.map((m: any) => m.userId))", "generateH2HSchedule(room.members.map((m: DraftRoom['members'][0]) => m.userId))");
text = text.replace("export function tickAuctionTurn(room: any, draftId: string)", "export function tickAuctionTurn(room: DraftRoom, draftId: string)");
text = text.replace("room.members.filter((m: any) =>", "room.members.filter((m: DraftRoom['members'][0]) =>");
text = text.replace("room.members.filter((m: any) =>", "room.members.filter((m: DraftRoom['members'][0]) =>");
text = text.replace("room.members.filter((m: any) =>", "room.members.filter((m: DraftRoom['members'][0]) =>");
text = text.replace("room.members.find((m: any) => m.userId === room.highestBid!.userId)", "room.members.find((m: DraftRoom['members'][0]) => m.userId === room.highestBid!.userId)");
text = text.replace("incomplete = room.members.filter((m: any)", "incomplete = room.members.filter((m: DraftRoom['members'][0])");
text = text.replace("incomplete = incomplete.filter((m: any)", "incomplete = incomplete.filter((m: DraftRoom['members'][0])");

text = text.replace(/ \(m: any\)/g, " (m: DraftRoom['members'][0])");
text = text.replace(/ \(p: any\)/g, " (p: Player)");

fs.writeFileSync('src/server/draftManager.ts', text);
