import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Product } from '@prisma/client';
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
      price: product?.price ?? 0,
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
    (product ? updateMutation : createMutation)({
      id: product?.id,
      name: form.values.name,
      barcode: form.values.barcode,
      price: form.values.price,
    })
      .then(() => {
        showNotification({
          title: 'Producto guardado',
          message: 'El producto ha sido guardado correctamente',
          color: 'green',
        });
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

        <TextInput
          label="Precio"
          placeholder="Precio"
          {...form.getInputProps('price')}
        />
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
