import { Button, Grid, Tabs } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import {
  IconCheck,
  IconPencil,
  IconShoppingCart,
  IconTransferIn,
  IconX,
} from '@tabler/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import React from 'react';
import { Description } from '~/components/atoms/Description';
import ProductFormModal from '~/components/forms/ProductFormModal';
import PageHeader from '~/components/molecules/PageHeader';
import { currencyFormatter } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const ProductDetailPage: NextPageWithLayout = () => {
  const trpcUtils = trpc.useContext();
  const id = useRouter().query.id as string;
  const { data: product, error } = trpc.products.byId.useQuery({
    id: parseInt(id),
  });
  const [showEditForm, setShowEditForm] = React.useState(false);

  const { mutateAsync: updateProduct, isLoading: isUpdating } =
    trpc.products.update.useMutation({
      onSuccess: async () => {
        await trpcUtils.products.list.invalidate();
        await trpcUtils.products.byId.invalidate({ id: product?.id ?? 0 });
      },
    });

  if (error) return <div>failed to load</div>;
  if (!product) return <div>loading...</div>;

  return (
    <PageHeader
      title={`${product.id} - ${product.name}`}
      extra={[
        product.status === 'ACTIVE' ? (
          <Button
            key="deactivate"
            variant="outline"
            color="red"
            leftIcon={<IconX />}
            loading={isUpdating}
            onClick={() => {
              updateProduct({
                id: parseInt(id) ?? 0,
                status: 'DELETED',
              })
                .then(() => {
                  showNotification({
                    title: 'Producto desactivado',
                    message: 'El producto ha sido desactivado',
                  });
                })
                .catch((err) => {
                  showNotification({
                    title: 'Error al desactivar producto',
                    message: err.message,
                  });
                });
            }}
          >
            Desactivar Producto
          </Button>
        ) : (
          <Button
            key="activate"
            variant="outline"
            color="green"
            leftIcon={<IconCheck />}
            loading={isUpdating}
            onClick={() => {
              updateProduct({
                id: parseInt(id) ?? 0,
                status: 'ACTIVE',
              })
                .then(() => {
                  showNotification({
                    title: 'Producto activado',
                    message: 'El producto ha sido activado',
                    color: 'green',
                  });
                })
                .catch((err) => {
                  showNotification({
                    title: 'Error al activar producto',
                    message: err.message,
                  });
                });
            }}
          >
            Activar Producto
          </Button>
        ),
        <Button
          key="edit"
          variant="outline"
          color="blue"
          leftIcon={<IconPencil />}
          onClick={() => setShowEditForm(true)}
        >
          Editar Producto
        </Button>,
      ]}
    >
      <Grid>
        <Description label="Código de barras" data={product?.barcode} />
        <Description label="Nombre" data={product?.name} />
        <Description
          label="Stock"
          data={product?.stock.toString()}
          align="right"
        />
        <Description
          label="Precio"
          data={currencyFormatter(product?.price)}
          align="right"
        />
        <Description
          label="Descripción"
          data={
            product?.description?.length
              ? product.description
              : 'No hay descripción'
          }
          span={6}
        />
        <Description
          label="Creación"
          data={dayjs(product.createdAt).format('DD/MM/YYYY')}
        />
      </Grid>

      <Tabs defaultValue={'Ventas'}>
        <Tabs.List>
          <Tabs.Tab value="Ventas" icon={<IconShoppingCart />}>
            Ventas
          </Tabs.Tab>
          <Tabs.Tab value="Compras" icon={<IconTransferIn />}>
            Compras
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="Ventas">
          <div>Panel de ventas</div>
        </Tabs.Panel>

        <Tabs.Panel value="Compras">
          <div>Panel de compras</div>
        </Tabs.Panel>
      </Tabs>

      <ProductFormModal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        product={product}
      />
    </PageHeader>
  );
};

export default ProductDetailPage;
