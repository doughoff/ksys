import { writeFileSync } from 'fs';
import { z } from 'zod';
import { formatString, lineSeparator } from '~/utils/ticket';
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
         console.log('creating sale');

         // log on trpc output server
         console.log(input);
         const result = await prisma.$transaction(async (prisma) => {
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

            //check entity credit limit
            const entity = await prisma.entity.findFirst({
               where: {
                  id: input.entityId,
               },
            });

            if (input.type === 'CREDIT') {
               if (!input.entityId) {
                  throw new Error(
                     'No se puede crear una venta a credito sin cliente',
                  );
               }

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
                     saleId: sale.id,
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

            let ticket = 'Mercado Dos Hermanos\n';
            ticket += `Fecha: ${new Date().toLocaleString()}\n`;
            ticket += `Venta: ${sale.id}\n`;
            ticket += lineSeparator();
            ticket += `Nombre del Producto\n`;
            ticket += formatString('CantidadxPrecio', 'Total');
            ticket += lineSeparator();

            input.items.forEach((item) => {
               let description = item.description;
               if (description.length > 33) {
                  description = description.substring(0, 30) + '...';
               }
               ticket += `${description}\n`;

               const quantity = `${item.quantity}x${item.price.toFixed(0)}`;
               const total = (item.quantity * item.price).toFixed(0);
               ticket += formatString(quantity, total);
            });

            ticket += lineSeparator();
            ticket += formatString(
               'Total',
               input.items
                  .reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
                  .toFixed(0),
            );

            ticket += lineSeparator();
            // client info
            if (input.entityId) {
               ticket += `Cliente: ${entity?.name}\n`;
            } else {
               ticket += `Cliente: Cliente Ocasional\n`;
            }

            // if credit leave space for signature
            if (input.type === 'CREDIT') {
               ticket += '\n';
               ticket += '\n';
               ticket += 'Firma: \n';
            }

            ticket += lineSeparator();

            console.log(ticket);

            writeFileSync('ticket.txt', ticket);

            return sale;
         });

         return result;
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
   byId: t.procedure
      .input(
         z.object({
            id: z.number(),
         }),
      )
      .query(async ({ input }) => {
         const sale = await prisma.sale.findUnique({
            where: {
               id: input.id,
            },
            include: {
               SaleItems: {
                  include: {
                     product: true,
                  },
               },
               entity: true,
               Credit: true,
            },
         });

         if (!sale) {
            throw new Error('Sale not found');
         }

         return sale;
      }),
});
