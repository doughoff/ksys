import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../prisma';
import { paginationSchema } from '../serverSchemas';
import { t } from '../trpc';

const entityFilterSchema = z.object({
  text: z.string().optional(),
  pagination: paginationSchema.optional(),
});
