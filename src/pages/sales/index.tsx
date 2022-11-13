import { Button } from '@mantine/core';
import { NextLink } from '@mantine/next';
import dayjs from 'dayjs';
import PageHeader from '~/components/molecules/PageHeader';
import PaginatedTable from '~/components/organisms/PaginatedTable/PaginatedTable';
import { usePagination } from '~/hooks/usePagination';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const SalesPage: NextPageWithLayout = () => {
   const pagination = usePagination();
   const { data: sales } = trpc.sales.list.useQuery(
      {
         pagination: pagination.data,
      },
      {
         onSuccess: (data) => pagination.setTotal(data.count),
      },
   );

   return (
      <PageHeader title="Ventas">
         <PaginatedTable
            items={sales?.items ?? []}
            header={() => (
               <tr>
                  <th>Cod.</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Tipo</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Acciones</th>
               </tr>
            )}
            rows={(sale) => (
               <tr key={sale.id}>
                  <td>{sale.id}</td>
                  <td>{dayjs(sale.createdAt).format('DD/MM/YYYY')}</td>
                  <td>{sale.status}</td>
                  <td>{sale.type}</td>
                  <td>{sale.entity?.name ?? 'Cliente Ocasional'}</td>
                  <td>{sale.total}</td>
                  <td width={'120px'}>
                     <Button
                        variant="filled"
                        component={NextLink}
                        href={`/sales/${sale.id}`}
                     >
                        Detalles
                     </Button>
                  </td>
               </tr>
            )}
            pagination={pagination}
         />
      </PageHeader>
   );
};

export default SalesPage;
