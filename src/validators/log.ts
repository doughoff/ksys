import { z } from 'zod';

export const LogsFilterSchema = z
  .object({
    table: z.string().optional(),
    rowId: z.number().optional(),
  })
  .optional();

export type LogsFilter = z.infer<typeof LogsFilterSchema>;
