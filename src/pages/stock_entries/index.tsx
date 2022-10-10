import { Button, Title } from '@mantine/core';
import { NextLink } from '@mantine/next';
import dayjs from 'dayjs';
import PageHeader from '~/components/molecules/PageHeader';
import PaginatedTable from '~/components/organisms/PaginatedTable/PaginatedTable';
import { usePagination } from '~/hooks/usePagination';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const StockEntriesPage: NextPageWithLayout = () => {
  const pagination = usePagination();
  const { data } = trpc.stockEntries.list.useQuery(
    {
      pagination: pagination.data,
    },
    { onSuccess: (data) => pagination.setTotal(data.count) },
  );
  return (
    <PageHeader title="Entradas de Stock" extra={[]}>
      <PaginatedTable
        items={data?.items ?? []}
        header={() => (
          <tr>
            <th>Cod.</th>
            <th>Fecha</th>
            <th>Status</th>
            <th>Acciones</th>
          </tr>
        )}
        rows={(item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>{dayjs(item.createdAt).format('DD/MM/YYYY')}</td>
            <td>{item.status}</td>
            <td>
              <Button
                variant="filled"
                color="blue"
                component={NextLink}
                href={`/stock_entries/${item.id}`}
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

export default StockEntriesPage;
