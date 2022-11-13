import dayjs from 'dayjs';
import { z } from 'zod';
import { paginationSchema, parsePagination } from '~/validators/common';
import { prisma } from '../prisma';
import { t } from '../trpc';

export const paymentsRouter = t.router({
   create: t.procedure
      .input(
         z.object({
            amount: z.number().min(1),
            entityId: z.number(),
         }),
      )
      .mutation(async ({ input }) => {
         await prisma.$transaction(async (prisma) => {
            const credits = await prisma.credit.findMany({
               where: {
                  entityId: input.entityId,
                  paymentLeft: {
                     gt: 0,
                  },
               },
            });

            const totalPaymentLeft = credits.reduce(
               (acc, credit) => acc + credit.paymentLeft,
               0,
            );

            if (input.amount > totalPaymentLeft) {
               throw new Error('Valor es mayor al valor de la deuda');
            }

            let amountLeft = input.amount;

            const process = await prisma.paymentProcess.create({
               data: {
                  amount: input.amount,
                  entityId: input.entityId,
               },
            });

            await prisma.log.create({
               data: {
                  type: 'CREATE',
                  table: 'payment_process',
                  rowId: process.id,
                  data: {
                     processId: process.id,
                  },
               },
            });

            for (const credit of credits) {
               if (amountLeft === 0) {
                  break;
               }

               const paymentLeft = Math.min(credit.paymentLeft, amountLeft);
               amountLeft -= paymentLeft;

               await prisma.credit.update({
                  where: {
                     id: credit.id,
                  },
                  data: {
                     paymentLeft: {
                        decrement: paymentLeft,
                     },
                  },
               });

               await prisma.log.create({
                  data: {
                     type: 'UPDATE',
                     table: 'credit',
                     rowId: credit.id,
                     data: {
                        paymentProcessId: process.id,
                        paymentLeft: {
                           decrement: paymentLeft,
                        },
                     },
                  },
               });

               const payment = await prisma.payment.create({
                  data: {
                     amount: paymentLeft,
                     creditId: credit.id,
                     paymentProcessId: process.id,
                  },
               });

               await prisma.log.create({
                  data: {
                     type: 'CREATE',
                     table: 'payment',
                     rowId: payment.id,
                     data: {
                        paymentProcessId: process.id,
                        amount: paymentLeft,
                        creditId: credit.id,
                     },
                  },
               });
            }
         });

         return true;
      }),
   list: t.procedure
      .input(
         z.object({
            pagination: paginationSchema.optional(),
         }),
      )
      .query(async ({ input }) => {
         const pagination = parsePagination(input.pagination);

         const processes = await prisma.paymentProcess.findMany({
            ...pagination,
            include: {
               entity: true,
            },
         });

         const count = await prisma.paymentProcess.count();

         return {
            items: processes,
            count,
         };
      }),

   byId: t.procedure
      .input(
         z.object({
            id: z.number(),
         }),
      )
      .query(async ({ input }) => {
         const process = await prisma.paymentProcess.findUnique({
            where: {
               id: input.id,
            },
            include: {
               Payment: true,
               entity: true,
            },
         });

         if (!process) {
            throw new Error('Process not found');
         }

         return process;
      }),

   cancel: t.procedure
      .input(
         z.object({
            id: z.number(),
         }),
      )
      .mutation(async ({ input }) => {
         await prisma.$transaction(async (prisma) => {
            const process = await prisma.paymentProcess.findUnique({
               where: {
                  id: input.id,
               },
               include: {
                  Payment: true,
               },
            });

            if (!process) {
               throw new Error('No fue encontrado el Procedimiento de Pago');
            }

            //check if date is more than 7 days using dayjs helpers
            const isOld = dayjs().diff(dayjs(process.createdAt), 'day') > 7;

            if (isOld) {
               throw new Error(
                  'El Procedimiento de Pago es muy antiguo, mas de 7 dias',
               );
            }

            await prisma.paymentProcess.update({
               where: {
                  id: process.id,
               },
               data: {
                  status: 'DELETED',
                  deletedAt: new Date(),
               },
            });

            await prisma.log.create({
               data: {
                  type: 'UPDATE',
                  table: 'payment_process',
                  rowId: input.id,
                  data: {
                     status: 'DELETED',
                  },
               },
            });

            for (const payment of process.Payment) {
               await prisma.credit.update({
                  where: {
                     id: payment.creditId,
                  },
                  data: {
                     paymentLeft: {
                        increment: payment.amount,
                     },
                  },
               });

               await prisma.log.create({
                  data: {
                     type: 'UPDATE',
                     table: 'credit',
                     rowId: payment.creditId,
                     data: {
                        processId: process.id,
                        paymentLeft: {
                           increment: payment.amount,
                        },
                     },
                  },
               });

               await prisma.payment.update({
                  where: {
                     id: payment.id,
                  },
                  data: {
                     status: 'DELETED',
                     deletedAt: new Date(),
                  },
               });

               await prisma.log.create({
                  data: {
                     type: 'UPDATE',
                     table: 'payment',
                     rowId: payment.id,
                     data: {
                        status: 'DELETED',
                     },
                  },
               });
            }
         });

         return true;
      }),
});
