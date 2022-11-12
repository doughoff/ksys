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
import StatusBadge from '~/components/atoms/StatusBadge';
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
         tags={<StatusBadge status={product.status} />}
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
            <Description
               label="Código de barras"
               data={product?.barcode}
               span={2}
            />
            <Description label="Nombre" data={product?.name} span={4} />
            <Description label="IVA" data={product?.iva} span={1} />
            <Description
               label="Stock"
               data={product?.stock.toString()}
               align="right"
               span={2}
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
               span={3}
               data={dayjs(product.createdAt).format('DD/MM/YYYY')}
            />
            <Description
               span={3}
               label="Ultimo Costo"
               data={currencyFormatter(product?.lastCost)}
               align="right"
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

            <Tabs.Panel value="Ventas">Panel de ventas</Tabs.Panel>

            <Tabs.Panel value="Compras">Panel de compras</Tabs.Panel>
         </Tabs>

         {showEditForm && (
            <ProductFormModal
               isOpen={showEditForm}
               onClose={() => setShowEditForm(false)}
               product={product}
            />
         )}
      </PageHeader>
   );
};

export default ProductDetailPage;
