const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
  });

  // Store active connections
  const clients = new Map();

  wss.on('connection', async (ws, req) => {
    try {
      // Extract user ID from query params or headers
      const url = new URL(req.url, `http://${req.headers.host}`);
      const userId = url.searchParams.get('userId');
      
      if (userId) {
        clients.set(userId, ws);
        console.log(`WebSocket connected for user: ${userId}`);
        
        ws.send(JSON.stringify({
          type: 'connection',
          title: 'Connected',
          message: 'Real-time notifications enabled'
        }));
      }

      ws.on('close', () => {
        if (userId) {
          clients.delete(userId);
          console.log(`WebSocket disconnected for user: ${userId}`);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

    } catch (error) {
      console.error('WebSocket connection error:', error);
      ws.close();
    }
  });

  // Function to send notification to specific user
  const sendNotificationToUser = (userId, notification) => {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notification));
    }
  };

  // Function to broadcast to all connected clients
  const broadcastNotification = (notification) => {
    clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(notification));
      }
    });
  };

  return {
    sendNotificationToUser,
    broadcastNotification,
    getConnectedClients: () => clients.size
  };
};

module.exports = setupWebSocket;