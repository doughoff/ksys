import { Prisma } from '@prisma/client';
import { parseActiveStatus, parsePagination } from '~/validators/common';
import {
  entityCreateSchema,
  entityFilterSchema,
  entityUpdateSchema,
  tagsSchema,
} from '~/validators/entity';
import { prisma } from '../prisma';
import { t } from '../trpc';

export const entityRouter = t.router({
  list: t.procedure.input(entityFilterSchema).query(async ({ input }) => {
    console.log(tagsSchema.parse(['tag1', 'tag2']));
    const pagination = parsePagination(input.pagination);

    const filter = Prisma.validator<Prisma.EntityWhereInput>()({
      OR: [
        { name: { contains: input.text } },
        { cellphone: { contains: input.text } },
        { document: { contains: input.text } },
      ],
    });

    const count = await prisma.entity.count({ where: filter });
    const items = await prisma.entity.findMany({
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
  add: t.procedure.input(entityCreateSchema).mutation(async ({ input }) => {
    const entity = await prisma.entity.create({
      data: input,
    });
    return entity;
  }),
  update: t.procedure.input(entityUpdateSchema).mutation(async ({ input }) => {
    const entity = await prisma.entity.update({
      where: { id: input.id },
      data: input,
    });
    return entity;
  }),
});
