import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

let wss: WebSocketServer | null = null;

export function initWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws: WebSocket, req: any) => {
    console.log('New WebSocket connection from:', req.socket.remoteAddress, 'path:', req.url);
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('WS message received:', data.type);
        // Simple broadcast for MVP realtime sync
        broadcast(data, ws);
      } catch (e) {
        console.error('WS message error', e);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return wss;
}

export function broadcast(data: any, excludeWs?: WebSocket) {
  if (!wss) return;
  wss.clients.forEach((client) => {
    if (client !== excludeWs && client.readyState === 1) { // 1 = OPEN
      client.send(JSON.stringify(data));
    }
  });
}
