import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { parsePagination } from '~/validators/common';
import {
  productCreateSchema,
  productFilterSchema,
  productUpdateSchema,
} from '~/validators/product';
import { prisma } from '../prisma';
import { t } from '../trpc';

export const productRouter = t.router({
  list: t.procedure.input(productFilterSchema).query(async ({ input }) => {
    const pagination = parsePagination(input.pagination);
    const filter = Prisma.validator<Prisma.ProductWhereInput>()({
      OR: [
        { name: { contains: input.text } },
        { description: { contains: input.text } },
        { barcode: { contains: input.text } },
      ],
    });

    const count = await prisma.product.count({ where: filter });
    const items = await prisma.product.findMany({
      where: filter,
      ...pagination,
      orderBy: {
        createdAt: 'asc',
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
      return prisma.product.findUnique({
        where: { id: input.id },
      });
    }),
  byBarcode: t.procedure
    .input(z.object({ barcode: z.string() }))
    .query(async ({ input }) => {
      return prisma.product.findUnique({
        where: { barcode: input.barcode },
      });
    }),
  add: t.procedure.input(productCreateSchema).mutation(async ({ input }) => {
    // check if product with barcode already exists
    return prisma.$transaction(async (prisma) => {
      0;
      const checkBarcode = await prisma.product.findUnique({
        where: {
          barcode: input.barcode,
        },
      });

      if (checkBarcode) {
        throw new Error('Ya existe un producto con ese código de barras');
      }

      const product = await prisma.product.create({
        data: { ...input, lastCost: 0 },
      });

      await prisma.log.create({
        data: {
          rowId: product.id,
          table: 'product',
          type: 'CREATE',
        },
      });

      return product;
    });
  }),
  update: t.procedure.input(productUpdateSchema).mutation(async ({ input }) => {
    // check if product with barcode already exists
    return prisma.$transaction(async (prisma) => {
      const checkBarcode = await prisma.product.findUnique({
        where: { id: input.id },
      });

      if (checkBarcode && checkBarcode.id !== input.id) {
        throw new Error('Ya existe un producto con ese código de barras');
      }

      const product = await prisma.product.update({
        where: { id: input.id },
        data: input,
      });

      await prisma.log.create({
        data: {
          rowId: product.id,
          table: 'product',
          type: 'UPDATE',
        },
      });

      return product;
    });
  }),
});
