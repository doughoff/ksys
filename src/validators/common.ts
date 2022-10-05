import { z } from 'zod';

export const statusSchema = z.enum(['ACTIVE', 'DELETED'], {
  required_error: 'El estado es requerido',
  invalid_type_error: 'El estado es inválido, debe ser ACTIVE o DELETED',
});

export const ivaSchema = z.enum(['IVA_0', 'IVA_5', 'IVA_10'], {
  required_error: 'El IVA es requerido',
  invalid_type_error: 'El IVA es inválido, debe ser IVA_0 o IVA_12',
});

export const paginationSchema = z.object({
  page: z
    .number()
    .min(1, {
      message: 'La página debe ser mayor o igual a 1',
    })
    .default(1),
  pageSize: z
    .number()
    .min(1, {
      message: 'El tamaño de página debe ser mayor o igual a 1',
    })
    .max(100, {
      message: 'El tamaño de página debe ser menor o igual a 100',
    })
    .default(10),
});

export type Pagination = z.infer<typeof paginationSchema>;

export function parsePagination(
  pagination?: Pagination,
): Record<string, never> | { take: number; skip: number } {
  if (!pagination) return {};
  const { page, pageSize } = pagination;
  return {
    take: pageSize + 1,
    skip: (page - 1) * pageSize,
  };
}

export function parseActiveStatus(input: {
  [p: string]: any;
  active?: boolean;
}): {
  [p: string]: any;
  active?: boolean;
  deletedAt?: Date;
} {
  if (input.active ?? true) return { ...input, active: true };
  return {
    ...input,
    active: false,
    deletedAt: new Date(),
  };
}
