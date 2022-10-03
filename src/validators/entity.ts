import { z } from 'zod';
import { paginationSchema } from './common';

export const entityFilterSchema = z.object({
  text: z.string().optional(),
  pagination: paginationSchema.optional(),
});
export type EntityFilter = z.infer<typeof entityFilterSchema>;

export const documentTypeSchema = z.enum(['RUC', 'CI'], {
  required_error: 'El tipo de documento es requerido',
  invalid_type_error: 'El tipo de documento es inválido, debe ser RUC o CI',
});

export const tagsSchema = z.array(z.string()).transform((tags, ctx) => {
  console.log(ctx);
  return {
    connectOrCreate: tags.map((tag) => ({
      where: { tag: tag },
      create: { tag: tag },
    })),
  };
});

export const entitySchema = z.object({
  name: z
    .string({
      required_error: 'El nombre es requerido',
    })
    .min(3, {
      message: 'El nombre debe tener al menos 3 caracteres',
    })
    .max(100, {
      message: 'El nombre debe tener máximo 100 caracteres',
    }),
  cellphone: z
    .string()
    .max(30, {
      message: 'El celular debe tener máximo 30 caracteres',
    })
    .optional(),
  documentType: documentTypeSchema.optional(),
  document: z
    .string()
    .max(20, {
      message: 'El documento debe tener máximo 20 caracteres',
    })
    .optional(),
  creditLimit: z
    .number()
    .min(0, {
      message: 'El límite de crédito debe ser mayor o igual a 0',
    })
    .optional(),
  address: z
    .string()
    .max(100, {
      message: 'La dirección debe tener máximo 100 caracteres',
    })
    .optional(),
});

export type Entity = z.infer<typeof entitySchema>;

export const entityCreateSchema = entitySchema;
export type EntityCreate = z.infer<typeof entityCreateSchema>;

export const entityUpdateSchema = entitySchema
  .extend({
    id: z.number(),
    active: z.boolean().optional(),
  })
  .partial()
  .transform((value, ctx) => {
    if (value.active === false) {
      return {
        ...value,
        deletedAt: new Date(),
      };
    }
    return value;
  });
export type EntityUpdate = z.infer<typeof entityUpdateSchema>;
