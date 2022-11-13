import { Grid } from '@mantine/core';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Description } from '~/components/atoms/Description';
import StatusBadge from '~/components/atoms/StatusBadge';
import PageHeader from '~/components/molecules/PageHeader';
import { GenericTable } from '~/components/organisms';
import { currencyFormatter } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const SaleDetailsPage: NextPageWithLayout = () => {
   const id = useRouter().query.id as string;
   const {
      data: sale,
      error,
      isLoading,
   } = trpc.sales.byId.useQuery({ id: parseInt(id) });

   if (!sale) return <div>Cargando...</div>;

   return (
      <PageHeader
         title={`Venta ${sale?.id}`}
         tags={<StatusBadge status={sale.status} />}
      >
         <Grid>
            <Description
               span={2}
               label="Fecha"
               data={dayjs(sale.createdAt).format('DD/MM/YYYY')}
            />

            <Description
               span={6}
               label="Cliente"
               data={sale.entity?.name ?? 'Cliente Ocasional'}
            />

            <Description
               span={4}
               label="Total"
               data={currencyFormatter(sale.total)}
               align="right"
            />
         </Grid>

         <GenericTable
            items={sale.SaleItems}
            header={() => (
               <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th
                     style={{
                        textAlign: 'right',
                     }}
                  >
                     Precio
                  </th>
                  <th
                     style={{
                        textAlign: 'right',
                     }}
                  >
                     Subtotal
                  </th>
               </tr>
            )}
            rows={(item) => (
               <tr key={item.id}>
                  <td>{item.product.name}</td>
                  <td width="100px">{item.quantity}</td>
                  <td
                     style={{
                        textAlign: 'right',
                     }}
                  >
                     {currencyFormatter(item.price)}
                  </td>
                  <td
                     style={{
                        textAlign: 'right',
                     }}
                  >
                     {currencyFormatter(Math.ceil(item.price * item.quantity))}
                  </td>
               </tr>
            )}
         />
      </PageHeader>
   );
};

export default SaleDetailsPage;
