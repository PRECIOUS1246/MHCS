import http from 'http';
import app from './app';
import { config } from './config';
import { connectDatabase } from './config/database';
import { initializeSocket } from './socket';

const startServer = async () => {
  await connectDatabase();

  const httpServer = http.createServer(app);
  initializeSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`MHCS Server running on port ${config.port} [${config.nodeEnv}]`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
