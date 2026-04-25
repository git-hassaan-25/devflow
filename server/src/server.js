import dotenv from 'dotenv';
dotenv.config();

import http from 'http'; // for socket.io
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './socket.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  const httpServer = http.createServer(app);
  initSocket(httpServer);
  httpServer.listen(PORT, () => {
    console.log(`DevFlow API running on http://localhost:${PORT}`);
  });
};

start();
