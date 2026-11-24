import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Initialize firebase admin using application default credentials or just mock it if not available
try {
  admin.initializeApp();
} catch(e) {
  console.warn('Firebase admin failed to initialize', e);
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const publicRoutes = ['/api/health', '/api/drafts/public'];
  if (publicRoutes.includes(req.path) || req.path.startsWith('/api/leagues/')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await (admin as any).auth().verifyIdToken(token);
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying auth token', error);
    // For demo/development without proper admin config, fallback to decoding without verification
    if (process.env.NODE_ENV !== 'production') {
        try {
            // Very unsafe, only for local dev when firebase-admin lacks credentials
            const base64Url = token.split('.')[1];
            if (base64Url) {
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(Buffer.from(base64, 'base64').toString().split('').map(function(c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                }).join(''));
                (req as any).user = JSON.parse(jsonPayload);
                return next();
            }
        } catch(e) {}
    }
    return res.status(401).json({ error: 'Unauthorized' });
  }
};
