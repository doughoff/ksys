import { z } from 'zod';
import { paginationSchema, parsePagination } from '~/validators/common';
import { newStockEntryItemSchema } from '~/validators/stockEntry';
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
            include: {
               items: true,
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
               items: {
                  include: {
                     product: true,
                  },
               },
            },
         });
      }),
   create: t.procedure
      .input(
         z.object({
            items: z.array(
               z.object({
                  productId: z.number({
                     required_error: 'Producto es requerido',
                     invalid_type_error: 'ID de producto inválido',
                  }),
                  quantity: z
                     .number({
                        required_error: 'Cantidad es requerida',
                        invalid_type_error: 'Cantidad inválida',
                     })
                     .min(1, 'Cantidad debe ser mayor a 0'),
                  cost: z
                     .number({
                        required_error: 'Costo es requerido',
                        invalid_type_error: 'Costo inválido',
                     })
                     .min(1, 'Costo debe ser mayor a 0'),
               }),
            ),
         }),
      )
      .mutation(async ({ input }) => {
         return prisma.$transaction(async (prisma) => {
            const entry = await prisma.stockEntry.create({
               data: {
                  items: {
                     create: input.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        cost: item.cost,
                     })),
                  },
               },
               include: {
                  items: true,
               },
            });

            //update products stock
            await Promise.all(
               entry.items.map(async (item) => {
                  await prisma.product.update({
                     where: { id: item.productId },
                     data: {
                        stock: {
                           increment: item.quantity,
                        },
                        lastCost: item.cost,
                     },
                  });
               }),
            );

            // add log history
            await prisma.log.create({
               data: {
                  type: 'CREATE',
                  table: 'stockEntry',
                  rowId: entry.id,
                  data: JSON.stringify(entry),
               },
            });

            return entry;
         });
      }),

   delete: t.procedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
         return prisma.$transaction(async (prisma) => {
            const entry = await prisma.stockEntry.findUnique({
               where: { id: input.id },
               include: {
                  items: true,
               },
            });

            if (!entry) {
               throw new Error('No existe la entrada de stock');
            }

            // update products stock
            await Promise.all(
               entry.items.map(async (item) => {
                  const lastCost = await prisma.stockEntryItems.findFirst({
                     where: {
                        status: 'ACTIVE',
                        productId: item.productId,
                        stockEntryId: {
                           not: input.id,
                        },
                     },
                     orderBy: {
                        createdAt: 'desc',
                     },
                  });

                  await prisma.product.update({
                     where: { id: item.productId },
                     data: {
                        stock: {
                           decrement: item.quantity,
                        },
                        lastCost: lastCost?.cost || 0,
                     },
                  });
               }),
            );

            // Update stock entry status to deleted

            const updatedEntry = await prisma.stockEntry.update({
               where: { id: input.id },
               data: {
                  status: 'DELETED',
                  deletedAt: new Date(),
               },
            });

            // add log history
            await prisma.log.create({
               data: {
                  type: 'UPDATE',
                  table: 'stockEntry',
                  rowId: entry.id,
                  data: JSON.stringify(updatedEntry),
               },
            });

            return entry;
         });
      }),
});
