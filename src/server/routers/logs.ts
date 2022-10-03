import { LogsFilterSchema } from '~/validators/log';
import { prisma } from '../prisma';
import { t } from '../trpc';

export const logRouter = t.router({
  list: t.procedure.input(LogsFilterSchema).query(async ({ input }) => {
    return prisma.log.findMany({
      where: input,
      orderBy: { createdAt: 'desc' },
    });
  }),
});
