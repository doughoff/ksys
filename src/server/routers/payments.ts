import { z } from 'zod';
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
          throw new Error('Amount is greater than total payment left');
        }

        let amountLeft = input.amount;

        const process = await prisma.log.create({
          data: {
            type: 'CREATE',
            table: 'payment_process',
            rowId: 0,
            data: {
              amount: input.amount,
              entityId: input.entityId,
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
                processId: process.id,
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
            },
          });

          await prisma.log.create({
            data: {
              type: 'CREATE',
              table: 'payment',
              rowId: payment.id,
              data: {
                processId: process.id,
                amount: paymentLeft,
                creditId: credit.id,
              },
            },
          });
        }
      });

      return true;
    }),
});
