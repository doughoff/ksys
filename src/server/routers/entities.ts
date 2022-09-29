import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { t } from '../trpc';

const defaultEntitySelect = Prisma.validator<Prisma.EntitySelect>()({
  id: true,
  name: true,
  cellphone: true,
  documentType: true,
  document: true,
  creditLimit: true,
  createdAt: true,
  updatedAt: true,
});

export const entityRouter = t.router({
  list: t.procedure
    .input(
      z.object({
        name: z.string().optional(),
        pagination: z.object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(10),
        }),
      }),
    )
    .query(async ({ input }) => {
      const { page, pageSize } = input.pagination;
      const count = await prisma.entity.count({
        where: {
          name: {
            contains: input.name,
          },
        },
      });
      const items = await prisma.entity.findMany({
        select: defaultEntitySelect,
        where: {
          name: {
            contains: input.name,
          },
        },
        take: pageSize + 1,
        skip: (page - 1) * pageSize,
        orderBy: {
          createdAt: 'asc',
        },
      });

      return {
        items: items,
        count: count,
      };
    }),
  add: t.procedure
    .input(
      z.object({
        name: z.string(),
        cellphone: z.string(),
        documentType: z.string(),
        document: z.string(),
        creditLimit: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const entity = await prisma.entity.create({
        data: {
          name: input.name,
          cellphone: input.cellphone,
          documentType: input.documentType,
          document: input.document,
          creditLimit: input.creditLimit,
        },
      });

      return entity;
    }),

  update: t.procedure
    .input(
      z.object({
        id: z.number(),
        name: z.string(),
        cellphone: z.string(),
        documentType: z.string(),
        document: z.string(),
        creditLimit: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const entity = await prisma.entity.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          cellphone: input.cellphone,
          documentType: input.documentType,
          document: input.document,
          creditLimit: input.creditLimit,
        },
      });

      return entity;
    }),
});
