import express from 'express';
import { createServer as createViteServer } from 'vite';
import http from 'http';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { aiRouter } from './src/server/routes/ai.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const server = http.createServer(app);

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'EAI CLASSROOM API is running' });
  });

  // Mount routers
  app.use('/api/sessions/:id', aiRouter); // Mount AI routes under sessions
  app.use('/api/ai', aiRouter); // Mount general AI routes

  // Vite middleware for development (skip if dist folder exists from a build)
  const distPath = path.join(process.cwd(), 'dist');
  
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  }).on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      console.log('Address in use, retrying...');
      setTimeout(() => {
        server.close();
        server.listen(PORT, '0.0.0.0');
      }, 1000);
    }
  });
}

startServer();
