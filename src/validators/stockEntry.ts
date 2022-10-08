import { z } from 'zod';
import { statusSchema } from './common';
import { productSchema } from './product';

const stockEntryItemsSchema = z.object({
  stockEntryId: z.number(),
  productId: z.number(),
  product: productSchema,
  quantity: z.number(),
  cost: z.number(),
  status: statusSchema.default('ACTIVE'),
});

const stockEntrySchema = z.object({
  id: z.number().optional(),
  status: statusSchema.default('ACTIVE'),
  items: z.array(stockEntryItemsSchema),
});
