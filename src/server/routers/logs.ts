import { z } from 'zod';
import { prisma } from '../prisma';
import { t } from '../trpc';

export const logRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        table: z.string().optional(),
        rowId: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      return prisma.log.findMany({
        where: input,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),
});
