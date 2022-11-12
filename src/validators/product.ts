import { z } from 'zod';
import { ivaSchema, paginationSchema, statusSchema } from './common';

export const productSchema = z.object({
   name: z
      .string({
         required_error: 'El nombre es requerido',
      })
      .min(3, {
         message: 'El nombre debe tener al menos 3 caracteres',
      })
      .max(100, {
         message: 'El nombre debe tener máximo 100 caracteres',
      })
      .transform((name) => name.toUpperCase().trim()),
   barcode: z
      .string()
      .min(2, {
         message: 'El código de barras debe tener al menos 2 caracteres',
      })
      .max(30, {
         message: 'El código de barras debe tener máximo 30 caracteres',
      }),
   description: z
      .string({
         required_error: 'La descripción es requerida',
      })
      .max(100, {
         message: 'La descripción debe tener máximo 100 caracteres',
      })
      .optional()
      .transform((description) => description?.toUpperCase().trim()),
   stock: z
      .number({
         required_error: 'El stock es requerido',
      })
      .min(0, {
         message: 'El stock debe ser mayor o igual a 0',
      })
      .default(0),
   price: z
      .number({
         required_error: 'El precio es requerido',
      })
      .min(1, {
         message: 'El precio debe ser mayor que 0',
      }),
   iva: ivaSchema.optional().default('IVA_10'),
   status: statusSchema.optional().default('ACTIVE'),
});

export type Product = z.infer<typeof productSchema>;

export const productCreateSchema = productSchema;
export type ProductCreate = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = productSchema
   .partial()
   .extend({
      id: z.number({
         required_error: 'El id es requerido',
      }),
   })
   .transform((value) => {
      if (value.status === 'DELETED') {
         return {
            ...value,
            deletedAt: new Date(),
         };
      }
      return value;
   });
export type ProductUpdate = z.infer<typeof productUpdateSchema>;

export const productFilterSchema = z.object({
   text: z.string().optional(),
   pagination: paginationSchema.optional(),
});
export type ProductFilter = z.infer<typeof productFilterSchema>;
