import { z } from 'zod';
import { statusSchema } from './common';
import { productSchema } from './product';

export const stockEntryItemsSchema = z.object({
   stockEntryId: z.number(),
   productId: z.number(),
   product: productSchema,
   quantity: z.number().min(1),
   cost: z.number().min(1),
   status: statusSchema.default('ACTIVE'),
});

export const stockEntrySchema = z.object({
   id: z.number().optional(),
   status: statusSchema.default('ACTIVE'),
   items: z.array(stockEntryItemsSchema),
});

export const newStockEntryItemSchema = stockEntryItemsSchema.omit({
   status: true,
   stockEntryId: true,
});

export type NewStockEntryItem = z.infer<typeof newStockEntryItemSchema>;
