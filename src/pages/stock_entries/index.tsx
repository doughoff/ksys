import { Button, Title } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconEye, IconPlus } from '@tabler/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import StatusBadge from '~/components/atoms/StatusBadge';
import DebounceSearch from '~/components/molecules/DebounceSearch';
import PageHeader from '~/components/molecules/PageHeader';
import PaginatedTable from '~/components/organisms/PaginatedTable/PaginatedTable';
import { usePagination } from '~/hooks/usePagination';
import { currencyFormatter } from '~/utils/formatters';
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
    <PageHeader
      title="Entradas de Stock"
      extra={[
        <Button
          key="add_stock_entry"
          variant="filled"
          component={NextLink}
          href="/stock_entries/create"
          leftIcon={<IconPlus />}
        >
          Nueva Entrada
        </Button>,
      ]}
    >
      <PaginatedTable
        items={data?.items ?? []}
        header={() => (
          <tr>
            <th>Cod.</th>
            <th>Fecha</th>
            <th>Status</th>
            <th>N. Itenes</th>
            <th>Total</th>
            <th>Acciones</th>
          </tr>
        )}
        rows={(item) => (
          <tr key={item.id}>
            <td width={100}>{item.id}</td>
            <td width={180}>
              {dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}
            </td>
            <td>
              <StatusBadge status={item.status} />
            </td>
            <td
              width={100}
              style={{
                textAlign: 'right',
                fontWeight: 'bold',
              }}
            >
              {item.items.length} x
            </td>
            <td
              width={200}
              style={{
                textAlign: 'right',
                fontWeight: 'bold',
              }}
            >
              {currencyFormatter(
                item.items
                  .reduce((acc, pos) => acc + pos.cost * pos.quantity, 0)
                  .toString(),
              )}
            </td>
            <td width={100}>
              <Button
                variant="filled"
                color="blue"
                component={NextLink}
                href={`/stock_entries/${item.id}`}
                leftIcon={<IconEye />}
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
