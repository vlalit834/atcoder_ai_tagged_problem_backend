import { env } from './config/env.js';
import { openDatabase, closeDatabase } from './db/connection.js';
import { createApp } from './app.js';

function bootstrap() {
  openDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(
      `[server] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`
    );
  });

  const shutdown = (signal) => {
    // eslint-disable-next-line no-console
    console.log(`[server] received ${signal}, shutting down…`);
    server.close((err) => {
      closeDatabase();
      if (err) {
        // eslint-disable-next-line no-console
        console.error('[server] error during shutdown', err);
        process.exit(1);
      }
      process.exit(0);
    });

    // Force-exit if shutdown hangs longer than 10s.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('[server] unhandled rejection', reason);
  });
}

bootstrap();