/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
import express from 'express';
import helmet from 'helmet';
import { authMiddleware } from "./src/server/authMiddleware";
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { logger } from './src/server/logger';

import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [
        nodeProfilingIntegration(),
      ],
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
  } catch (err) {
    logger.error({ err }, "Invalid Sentry DSN configuration");
  }
}

import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupDraftManager, createDraftRoom, getPublicDrafts, joinDraftRoomAPI, startDraftExecution, initDraftManager, deleteDraftRoom, getRoomState } from './src/server/draftManager';
import { createMiniLeague, initMiniLeaguesManager, joinMiniLeague, getUserMiniLeagues, getAllMiniLeaguesAdmin, deleteMiniLeagueAdmin, editMiniLeague, leaveMiniLeague, deleteMiniLeague, generateH2HSchedule, getLeagueById, updateH2HScore } from './src/server/miniLeaguesManager';

import multer from 'multer';
import fs from 'fs';

// Global error handlers
process.on('uncaughtException', (err) => {
  logger.error(err, 'Uncaught Exception');
  process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ promise, reason }, 'Unhandled Rejection');
});


// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext)
  }
});
const upload = multer({ storage: storage });

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  // Trust proxy for express-rate-limit when behind reverse proxy
  app.set('trust proxy', 1);
  
  // Security and Optimization Middlewares
  app.use(helmet({ 
    contentSecurityPolicy: false, // Disabled for Vite hot reload and dev mode
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
    ieNoOpen: false,
    frameguard: false
  }));
  app.use(compression());
  app.use(pinoHttp({ logger }));

  // Global JSON parsing before Limiter
  app.use(express.json());

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `window`
    message: 'Too many requests from this IP, please try again later.',
    validate: { trustProxy: false, xForwardedForHeader: false, default: true }
  });
  app.use('/api/', apiLimiter);
  app.use('/api/', authMiddleware);

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  // Serve uploads statically
  app.use('/uploads', express.static(uploadDir, { maxAge: '1d' }));

  // Direct PDF guide download endpoint (supports ?inline=1 for in-app preview)
  app.get('/download/basketball-guide.pdf', (req, res) => {
    const publicPdf = path.join(process.cwd(), 'public', 'LBFL-Basketball-Fantasy-Guide.pdf');
    const distPdf = path.join(process.cwd(), 'dist', 'LBFL-Basketball-Fantasy-Guide.pdf');
    const filePath = fs.existsSync(publicPdf) ? publicPdf : distPdf;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Guide PDF not found' });
    }
    const isInline = req.query.inline === '1' || req.query.inline === 'true';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${isInline ? 'inline' : 'attachment'}; filename="LBFL-Basketball-Fantasy-Guide.pdf"`
    );
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'no-store');
    res.removeHeader('X-Download-Options');
    res.removeHeader('X-Frame-Options');
    res.sendFile(filePath);
  });

  // Setup Draft WebSockets
  await initDraftManager();
  await initMiniLeaguesManager();
  setupDraftManager(io);

  app.post('/api/upload', upload.single('media'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      res.json({ url: `/uploads/${req.file.filename}` });
    } catch (err: any) {
       res.status(500).json({ error: err.message });
    }
  });

  // API Routes placeholder (Mock API)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
  });

  app.post('/api/drafts/create', (req, res) => {
    try {
      const draftId = createDraftRoom(req.body);
      res.json({ draftId });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/drafts/join', (req, res) => {
    try {
      const { draftId, userId, email, password } = req.body;
      joinDraftRoomAPI(draftId, userId, email, password);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });
  
  app.post('/api/drafts/start', (req, res) => {
    try {
      startDraftExecution(req.body.draftId, req.body.userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/drafts/public', (req, res) => {
    res.json(getPublicDrafts());
  });
  
  app.get('/api/drafts/:id', (req, res) => {
    if (getRoomState && typeof getRoomState === 'function') {
      const room = getRoomState(req.params.id);
      if (room) {
        res.json(room);
        return;
      }
    }
    res.status(404).json({ error: 'Not found' });
  });

  app.post('/api/drafts/:id/trades', (req, res) => {
    try {
      const { initiatorId, targetId, offerPlayerIds, receivePlayerIds } = req.body;
      const { proposeTrade } = require('./src/server/draftManager');
      const result = proposeTrade(req.params.id, initiatorId, targetId, offerPlayerIds, receivePlayerIds);
      res.json(result);
    } catch(e:any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/drafts/:id/trades/:tradeId/vote', (req, res) => {
    try {
      const { userId, isFair } = req.body;
      const { voteTrade } = require('./src/server/draftManager');
      const trade = voteTrade(req.params.id, req.params.tradeId, userId, isFair);
      res.json(trade);
    } catch(e:any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/drafts/:id/trades/:tradeId/respond', (req, res) => {
    try {
      const { userId, action } = req.body;
      const { respondTrade } = require('./src/server/draftManager');
      const trade = respondTrade(req.params.id, req.params.tradeId, userId, action);
      res.json(trade);
    } catch(e:any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/drafts/:id/waivers', (req, res) => {
    try {
      const { getRoomState, saveDraftRoom, canAddPlayerToConsistentRoster, ROSTER_LIMITS } = require('./src/server/draftManager');
      const room = getRoomState(req.params.id);
      if (!room) { return res.status(404).json({ error: 'Room not found' }) }
      const { userId, players } = req.body;
      const member = room.members.find((m: any) => m.userId === userId);
      
      if (member && players) {
         // Gather full player profiles
         const newRoster = [];
         
         for (const p of players) {
             let fullP = member.roster.find((rp: any) => rp.id === p.playerId);
             if (!fullP) {
                 // Try finding in free agents pool (has completely all undrafted players)
                 // NOTE: `room.playerPool` currently gets drained but Free Agents is the same
                 // Actually `room.playerPool` still holds remainder in Drafts.
                 fullP = room.playerPool.find((poolP: any) => poolP.id === p.playerId);
                 if (!fullP) {
                      // Player is taken or doesn't exist
                      return res.status(400).json({ error: 'Player ' + p.playerId + ' is no longer available.' });
                 }
                 // Remove from pool since he was snatched
                 room.playerPool = room.playerPool.filter(poolP => poolP.id !== p.playerId);
             }
             newRoster.push(fullP);
         }
         
         // If "consistent", ensure limits are checked before replacing roster
         if (room.rosterConfig === 'consistent') {
             const counts: Record<string, number> = {};
             for (const rp of newRoster) {
                 counts[rp.position] = (counts[rp.position] || 0) + 1;
             }
             const maxAllowed = ROSTER_LIMITS[room.sport];
             for (const [pos, count] of Object.entries(counts)) {
                 if (count > (maxAllowed[pos] || 0)) {
                      return res.status(400).json({ error: `Exceeds max ${pos} player limit.` });
                 }
             }
         }

         // Put dumped players back into playerPool
         const dumpedPlayers = member.roster.filter(oldP => !newRoster.find(nP => nP.id === oldP.id));
         room.playerPool.push(...dumpedPlayers);

         member.roster = newRoster;
         
         saveDraftRoom(room.leagueId, room);
      }
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/drafts', (req, res) => {
    // For admin, we should return all drafts actually, but getPublicDrafts has most of the data
    // Let's create an getAllDrafts in draftManager, or just use getPublicDrafts for now
    res.json(getPublicDrafts()); // we can add getAllDrafts later or pass a flag
  });

  app.delete('/api/drafts/:id', (req, res) => {
    try {
      // In real scenario we'd check admin auth
      if (deleteDraftRoom && typeof deleteDraftRoom === 'function') {
         deleteDraftRoom(req.params.id);
      }
      res.json({ success: true });
    } catch(err: any) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // Mini Leagues
  app.post("/api/minileagues", (req, res) => {
    try { const { name, sport, type = 'roto', userId, email } = req.body; res.json(createMiniLeague(name, sport, type, userId, email)); } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/minileagues/join", (req, res) => {
    try { const { code, userId, email } = req.body; const l = joinMiniLeague(code, userId, email); if(l) res.json(l); else res.status(404).json({ error: "Not found" }); } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/minileagues/:sport/:userId", (req, res) => {
    try { res.json(getUserMiniLeagues(req.params.userId, req.params.sport as any)); } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/admin/minileagues", (req, res) => {
    try { res.json(getAllMiniLeaguesAdmin()); } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/admin/minileagues/:id", (req, res) => {
    try { res.json({ success: deleteMiniLeagueAdmin(req.params.id) }); } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.delete("/api/minileagues/:id", (req, res) => {
    try { res.json({ success: deleteMiniLeague(req.params.id, req.query.userId as string) }); } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/minileagues/:id/leave", (req, res) => {
    try { res.json({ success: leaveMiniLeague(req.params.id, req.body.userId) }); } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.put("/api/minileagues/:id", (req, res) => {
    try { res.json({ success: editMiniLeague(req.params.id, req.body.userId, req.body.name) }); } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.get("/api/minileagues/league/:id", (req, res) => {
    try { 
      const league = getLeagueById(req.params.id);
      if (league) res.json(league);
      else res.status(404).json({ error: 'Not found' });
    } catch(e:any) { res.status(500).json({ error: e.message }); }
  });

  app.get("/api/leagues/:code", (req, res) => {
    try {
       const { getLeagueByCode } = require('./src/server/draftManager');
       const league = getLeagueByCode(req.params.code);
       if (league) res.json(league);
       else res.status(404).json({ error: 'League code not found' });
    } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/admin/minileagues/:id/schedule", (req, res) => {
    try { 
      const league = generateH2HSchedule(req.params.id, req.body.roundIds);
      if (league) res.json(league);
      else res.status(400).json({ error: 'Failed to generate schedule' });
    } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  app.post("/api/admin/minileagues/:id/scores", (req, res) => {
    try {
      const { roundId, userA, userB, newScoreA, newScoreB } = req.body;
      const success = updateH2HScore(req.params.id, roundId, userA, userB, newScoreA, newScoreB);
      res.json({ success });
    } catch(e:any) { res.status(500).json({ error: e.message }); }
  });
  // Extract FIBA LiveStats
  app.post('/api/fiba/extract', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      // e.g. https://fibalivestats.dcd.shared.geniussports.com/u/FLB/2796020/
      const match = url.match(/\/u\/[^\/]+\/(\d+)/) || url.match(/data\/(\d+)/);
      if (!match || !match[1]) {
        return res.status(400).json({ error: 'Invalid FIBA LiveStats URL format. Could not extract match ID.' });
      }
      const matchId = match[1];

      const dataUrl = `https://fibalivestats.dcd.shared.geniussports.com/data/${matchId}/data.json`;
      const response = await fetch(dataUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch data from FIBA' });
      }
      
      const data = await response.json();
      res.json(data);
    } catch (err: any) {
      logger.error({ err }, "FIBA Extract Error");
      res.status(500).json({ error: 'Internal server error while extracting FIBA data', details: err.message });
    }
  });

  // Future API routes will be mounted here
  // app.use('/api/users', userRoutes);
  // app.use('/api/leagues', leagueRoutes);
  // app.use('/api/fixtures', fixtureRoutes);
  // app.use('/api/teams', teamRoutes);

  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }
  
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1y', immutable: true }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(e => { console.error("CRASH", e); });
