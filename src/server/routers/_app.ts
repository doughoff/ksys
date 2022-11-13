/**
 * This file contains the root router of your tRPC-backend
 */
import { t } from '../trpc';
import { entityRouter } from './entities';
import { healthRouter } from './health';
import { logRouter } from './logs';
import { paymentsRouter } from './payments';
import { postRouter } from './post';
import { productRouter } from './products';
import { salesRouter } from './sales';
import { stockEntriesRouter } from './stockEntries';

export const appRouter = t.router({
   post: postRouter,
   health: healthRouter,
   entity: entityRouter,
   log: logRouter,
   products: productRouter,
   stockEntries: stockEntriesRouter,
   sales: salesRouter,
   payments: paymentsRouter,
});

export type AppRouter = typeof appRouter;
