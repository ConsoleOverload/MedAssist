import { createApp } from './app.js';
import { connectDB, closeDB } from './config/db.js';
import { ENV } from './config/env.js';

const startServer = async () => {
  try {
    // 1. Connect Persistence
    await connectDB();

    // 2. Initialize App
    const app = createApp();

    // 3. Listen
    const server = app.listen(ENV.PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🏥 MedAssist API Server is active`);
      console.log(`🚀 Port: ${ENV.PORT}`);
      console.log(`🌐 Base URL: http://localhost:${ENV.PORT}/api/v1`);
      console.log(`🩺 Health: http://localhost:${ENV.PORT}/api/v1/health`);
      console.log(`======================================================\n`);
    });

    // Graceful Shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully terminating...`);
      server.close(async () => {
        await closeDB();
        console.log('[Server] Process completed cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server] Critical startup failure:', error);
    process.exit(1);
  }
};

startServer();
