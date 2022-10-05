/**
 * This file contains the root router of your tRPC-backend
 */
import { t } from '../trpc';
import { entityRouter } from './entities';
import { healthRouter } from './health';
import { logRouter } from './logs';
import { postRouter } from './post';
import { productRouter } from './products';

export const appRouter = t.router({
  post: postRouter,
  health: healthRouter,
  entity: entityRouter,
  log: logRouter,
  products: productRouter,
});

export type AppRouter = typeof appRouter;
