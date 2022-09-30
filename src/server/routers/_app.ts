/**
 * This file contains the root router of your tRPC-backend
 */
import { t } from '../trpc';
import { entityRouter } from './entities';
import { healthRouter } from './health';
import { postRouter } from './post';

export const appRouter = t.router({
  post: postRouter,
  health: healthRouter,
  entity: entityRouter,
});

export type AppRouter = typeof appRouter;
