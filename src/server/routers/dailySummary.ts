/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { t } from '../trpc';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';

export const dailySummaryRouter = t.router({
   list: t.procedure
      .input(
         z.object({
            date: z.string().optional(),
         }),
      )
      .query(async ({ input }) => {
         const { date } = input;

         if (!date) {
            return {
               sales: [],
               payments: [],
            };
         }

         const startDate = new Date(date);
         const endDate = new Date(date);
         endDate.setDate(new Date(date).getDate() + 1);

         const sales = await prisma.sale.findMany({
            where: {
               createdAt: {
                  gte: startDate,
                  lt: endDate,
               },
            },
            orderBy: {
               createdAt: 'asc',
            },
            include: {
               entity: true,
            },
         });

         const payments = await prisma.paymentProcess.findMany({
            where: {
               createdAt: {
                  gte: startDate,
                  lt: endDate,
               },
            },
            orderBy: {
               createdAt: 'asc',
            },
            include: {
               entity: true,
            },
         });

         return {
            sales: sales,
            payments: payments,
         };
      }),
});
