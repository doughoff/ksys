import { z } from 'zod';
import { paginationSchema, parsePagination } from '~/validators/common';
import { prisma } from '../prisma';
import { t } from '../trpc';

export enum IvaEnum {
   IVA_0 = 'IVA_0',
   IVA_5 = 'IVA_5',
   IVA_10 = 'IVA_10',
}

const ivaSchema = z.nativeEnum(IvaEnum);

export const salesRouter = t.router({
   create: t.procedure
      .input(
         z.object({
            items: z.array(
               z.object({
                  productId: z.number(),
                  description: z.string(),
                  quantity: z.number(),
                  price: z.number(),
                  iva: ivaSchema,
               }),
            ),
            entityId: z.number().optional(),
            address: z.string().optional(),
            document: z.string().optional(),

            type: z.enum(['CREDIT', 'CASH']),
         }),
      )
      .mutation(async ({ input }) => {
         return prisma.$transaction(async (prisma) => {
            // calculate liq iva and total
            let total = 0;
            const totalesIva: Record<IvaEnum, number> = {
               IVA_0: 0,
               IVA_5: 0,
               IVA_10: 0,
            };

            for (const item of input.items) {
               const totalItem = item.price * item.quantity;
               totalesIva[item.iva] += totalItem;
               total += totalItem;
            }

            if (input.type === 'CREDIT') {
               if (!input.entityId) {
                  throw new Error(
                     'No se puede crear una venta a credito sin cliente',
                  );
               }

               //check entity credit limit
               const entity = await prisma.entity.findUnique({
                  where: {
                     id: input.entityId,
                  },
               });

               if (!entity) {
                  throw new Error('Entity not found');
               }

               // check if entity has enough credit
               const totalCredit = await prisma.credit.aggregate({
                  where: {
                     entityId: input.entityId,
                     status: 'ACTIVE',
                  },
                  _sum: {
                     paymentLeft: true,
                  },
               });

               console.log({
                  total: (totalCredit?._sum?.paymentLeft ?? 0) + total,
                  creditLimit: entity.creditLimit,
               });

               if (
                  (totalCredit?._sum?.paymentLeft ?? 0) + total >
                  entity.creditLimit
               ) {
                  throw new Error('El cliente no tiene suficiente credito');
               }

               // create credit
               const credit = await prisma.credit.create({
                  data: {
                     entityId: input.entityId,
                     amount: total,
                     originalAmount: total,
                     paymentLeft: total,
                  },
               });

               // create log with credit
               await prisma.log.create({
                  data: {
                     table: 'credit',
                     rowId: credit.id,
                     type: 'CREATE',
                     data: {
                        entityId: input.entityId,
                        amount: total,
                        originalAmount: total,
                        paymentLeft: total,
                     },
                  },
               });
            }

            const sale = await prisma.sale.create({
               data: {
                  entityId: input.entityId,
                  address: input.address,
                  document: input.document,
                  type: input.type,
                  total,
                  SaleItems: {
                     create: input.items.map((item) => ({
                        productId: item.productId,
                        description: item.description,
                        quantity: item.quantity,
                        price: item.price,
                        iva: item.iva,
                     })),
                  },
               },
            });

            // update products stock
            for (const item of input.items) {
               await prisma.product.update({
                  where: {
                     id: item.productId,
                  },
                  data: {
                     stock: {
                        decrement: item.quantity,
                     },
                  },
               });
            }

            // save to log table
            await prisma.log.create({
               data: {
                  table: 'sale',
                  rowId: sale.id,
                  type: 'CREATE',
                  data: input,
               },
            });

            return sale;
         });
      }),

   list: t.procedure
      .input(
         z.object({
            pagination: paginationSchema.optional(),
         }),
      )
      .query(async ({ input }) => {
         const pagination = parsePagination(input.pagination);

         const sales = await prisma.sale.findMany({
            ...pagination,
            include: {
               SaleItems: true,
               entity: true,
            },
         });

         const total = await prisma.sale.count();

         return {
            items: sales,
            count: total,
         };
      }),
});
