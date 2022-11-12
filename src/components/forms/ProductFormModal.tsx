import {
   Button,
   Group,
   Modal,
   NumberInput,
   Select,
   TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Product } from '@prisma/client';
import { currencyFormatter, currencyParser } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';
import { productCreateSchema } from '~/validators/product';

export interface Props {
   isOpen: boolean;
   onClose: () => void;
   product?: Product;
}

const ProductFormModal: React.FunctionComponent<Props> = ({
   isOpen,
   onClose,
   product,
}) => {
   const trpcUtils = trpc.useContext();
   const form = useForm({
      initialValues: {
         barcode: product?.barcode ?? '',
         name: product?.name ?? '',
         description: product?.description ?? '',
         stock: product?.stock ?? 0,
         price: product?.price ?? 0,
         iva: product?.iva ?? 'IVA_10',
      },
      validate: zodResolver(productCreateSchema),
   });

   const { mutateAsync: createMutation, isLoading: isCreating } =
      trpc.products.add.useMutation({
         async onSuccess() {
            await trpcUtils.products.list.invalidate();
         },
      });

   const { mutateAsync: updateMutation, isLoading: isUpdating } =
      trpc.products.update.useMutation({
         async onSuccess() {
            await trpcUtils.products.list.invalidate();
            await trpcUtils.products.byId.invalidate({ id: product?.id ?? 0 });
         },
      });

   async function handleSubmit() {
      console.log({ product });
      (product ? updateMutation : createMutation)({
         id: product?.id ?? 0,
         name: form.values.name,
         barcode: form.values.barcode,
         price: form.values.price,
         stock: form.values.stock,
         description: form.values.description,
         iva: form.values.iva,
      })
         .then(() => {
            showNotification({
               title: 'Producto guardado',
               message: 'El producto ha sido guardado correctamente',
               color: 'green',
            });
            form.reset();
            onClose();
         })
         .catch((err) => {
            showNotification({
               title: 'Error al guardar el producto',
               message: err.message,
               color: 'red',
            });
         });
   }

   return (
      <Modal
         title={product ? 'Editar producto' : 'Crear producto'}
         opened={isOpen}
         onClose={onClose}
         transition="slide-down"
         size="sm"
      >
         <form onSubmit={form.onSubmit(handleSubmit)}>
            <Select
               label="IVA"
               placeholder="Seleccione el IVA"
               {...form.getInputProps('iva')}
               data={[
                  { label: '10%', value: 'IVA_10' },
                  { label: '5%', value: 'IVA_5' },
                  { label: '0%', value: 'IVA_0' },
               ]}
            />
            <TextInput
               label="Código de barras"
               placeholder="Código de barras"
               {...form.getInputProps('barcode')}
            />

            <TextInput
               label="Nombre"
               placeholder="Nombre"
               {...form.getInputProps('name')}
            />

            <TextInput
               label="Descripción"
               placeholder="Descripción"
               {...form.getInputProps('description')}
            />

            <NumberInput
               label="Precio"
               placeholder="Precio"
               formatter={currencyFormatter}
               parser={currencyParser}
               {...form.getInputProps('price')}
            />

            {product && (
               <NumberInput
                  label="Stock"
                  placeholder="Stock"
                  {...form.getInputProps('stock')}
               />
            )}

            <Group position="right" mt="md" spacing="md">
               <Button variant="outline" onClick={onClose}>
                  Cancelar
               </Button>

               <Button
                  type="submit"
                  variant="light"
                  loading={isCreating || isUpdating}
               >
                  {product ? 'Actualizar' : 'Crear'}
               </Button>
            </Group>
         </form>
      </Modal>
   );
};

export default ProductFormModal;
