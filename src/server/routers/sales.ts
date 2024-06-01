import { writeFileSync } from 'fs';
import { z } from 'zod';
import { formatString, lineSeparator } from '~/utils/ticket';
import { device, printer } from '~/utils/escposConnection';
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
         const sale = await prisma.$transaction(async (prisma) => {
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

            if (device) {
               try {
                  device?.open((err) => {
                     if (!printer) return;
                     let printerOpen = printer
                        .font('A')
                        .align('CT')
                        .style('NORMAL')
                        .size(1, 1);

                     printerOpen = printerOpen.text('Mercado dos Hermanos');
                     printerOpen = printerOpen.align('LT');
                     printerOpen = printerOpen.text(
                        `Fecha: ${new Date().toLocaleString()}`,
                     );
                     printerOpen = printerOpen.text(`Venta: ${sale.id}`);
                     printerOpen = printerOpen.text(lineSeparator());
                     printerOpen = printerOpen.text(`Nombre del Producto`);
                     printerOpen = printerOpen.text(
                        formatString('CantidadxPrecio', 'Total'),
                     );
                     printerOpen = printerOpen.text(lineSeparator());

                     input.items.forEach((item) => {
                        let description = item.description;
                        if (description.length > 33) {
                           description = description.substring(0, 30) + '...';
                        }
                        printerOpen = printerOpen.text(`${description}`);

                        const quantity = `${item.quantity}x${item.price.toFixed(
                           0,
                        )}`;
                        const total = (item.quantity * item.price).toFixed(0);
                        printerOpen = printerOpen.text(
                           formatString(quantity, total),
                        );
                     });

                     printerOpen = printerOpen.text(lineSeparator());
                     printerOpen = printerOpen.text(
                        formatString(
                           'Total',
                           input.items
                              .reduce(
                                 (acc, curr) =>
                                    acc + curr.price * curr.quantity,
                                 0,
                              )
                              .toFixed(0),
                        ),
                     );
                     printerOpen = printerOpen.text(lineSeparator());
                     // client info
                     if (input.entityId) {
                        printerOpen = printerOpen.text(
                           `Cliente: ${entity?.name}`,
                        );
                     } else {
                        printerOpen = printerOpen.text(
                           `Cliente: Cliente Ocasional`,
                        );
                     }

                     // if credit leave space for signature
                     if (input.type === 'CREDIT') {
                        printerOpen = printerOpen.newLine().newLine();
                        printerOpen = printerOpen.text('Firma:');
                     }

                     printerOpen = printerOpen.text(lineSeparator());
                     printerOpen = printerOpen
                        .newLine()
                        .newLine()
                        .newLine()
                        .newLine()
                        .newLine();

                     printerOpen.cut().close();
                  });
               } catch (error) {
                  console.log('erro');
               }
            }
            return sale;
         });
         return sale;
      }),

   calculate_interest: t.procedure
      .mutation(async () => {
         return prisma.$queryRaw`
            UPDATE "Credit"
            SET
               last_interest_update = NOW(),
               payment_left = payment_left * POWER(1.05, LEAST(EXTRACT(MONTH FROM AGE(NOW(), COALESCE(last_interest_update, created_at)))::int, 1)),
               interest_added = interest_added + payment_left * (POWER(1.05, LEAST(EXTRACT(MONTH FROM AGE(NOW(), COALESCE(last_interest_update, created_at)))::int, 1)) - 1)
            WHERE
               id IN (
                  SELECT id
                  FROM "Credit"
                  WHERE COALESCE(last_interest_update, created_at) < NOW() - INTERVAL '1 month'
                     AND payment_left > 0
               );
         `;
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
