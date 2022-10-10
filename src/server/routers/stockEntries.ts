import { z } from 'zod';
import { paginationSchema, parsePagination } from '~/validators/common';
import { prisma } from '../prisma';
import { t } from '../trpc';

export const stockEntriesRouter = t.router({
  list: t.procedure
    .input(z.object({ pagination: paginationSchema }))
    .query(async ({ input }) => {
      const pagination = parsePagination(input.pagination);
      const count = await prisma.stockEntry.count();
      const items = await prisma.stockEntry.findMany({
        ...pagination,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        items: items,
        count: count,
      };
    }),
  byId: t.procedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return prisma.stockEntry.findUnique({
        where: { id: input.id },
        include: {
          items: true,
        },
      });
    }),
});
