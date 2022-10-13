import { Button, Grid, Table, Text } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { ConfirmModal } from '@mantine/modals/lib/ConfirmModal';
import { showNotification } from '@mantine/notifications';
import { IconX, IconCheck } from '@tabler/icons';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Description } from '~/components/atoms/Description';
import PageHeader from '~/components/molecules/PageHeader';
import { currencyFormatter } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const StockEntryDetailsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const trpcUtils = trpc.useContext();
  const id = router.query.id as string;
  const {
    data: stockEntry,
    error,
    isLoading,
  } = trpc.stockEntries.byId.useQuery({
    id: parseInt(id),
  });

  const { mutateAsync: deleteStockEntry } =
    trpc.stockEntries.delete.useMutation({
      onSuccess: async () => {
        await trpcUtils.stockEntries.list.invalidate();
        await trpcUtils.stockEntries.byId.invalidate({
          id: stockEntry?.id ?? 0,
        });
        showNotification({
          title: 'Entrada de stock desactivada',
          message: 'La entrada de stock ha sido desactivada',
        });
      },
    });

  if (error || (!stockEntry && !isLoading)) {
    return <div>failed to load</div>;
  }

  return (
    <PageHeader
      title={`Entrada de Stock ${stockEntry?.id}`}
      extra={[
        stockEntry?.status === 'ACTIVE' ? (
          <Button
            key="deactivate"
            variant="outline"
            color="red"
            leftIcon={<IconX />}
            loading={isLoading}
            onClick={() => {
              openConfirmModal({
                title: 'Desactivar entrada de stock',
                children: (
                  <Text size={'sm'}>
                    ¿Estás seguro de que deseas desactivar esta entrada de
                    stock?
                  </Text>
                ),
                labels: {
                  confirm: 'Desactivar',
                  cancel: 'Cancelar',
                },
                confirmProps: {
                  color: 'red',
                },
                onConfirm: () => {
                  deleteStockEntry({ id: parseInt(id) ?? 0 });
                },
              });
            }}
          >
            Desactivar
          </Button>
        ) : (
          <></>
        ),
      ]}
    >
      <Grid>
        <Description
          span={6}
          label="Fecha"
          data={dayjs(stockEntry?.createdAt).format('DD/MM/YYYY HH:mm:ss')}
        />
        <Description
          span={6}
          label="Total"
          align="right"
          data={currencyFormatter(
            stockEntry?.items.reduce(
              (acc, item) => acc + item.quantity * item.cost,
              0,
            ),
          )}
        />
      </Grid>

      <Table>
        <thead>
          <tr>
            <th>Cod.Barras</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Costo</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {stockEntry?.items.map((item) => (
            <tr key={item.id}>
              <td width={150}>{item.product.barcode}</td>
              <td>{item.product.name}</td>
              <td
                width={150}
                style={{
                  textAlign: 'right',
                }}
              >
                {item.quantity} x
              </td>
              <td
                width={150}
                style={{
                  textAlign: 'right',
                }}
              >
                {currencyFormatter(item.cost)}
              </td>
              <td
                width={180}
                style={{
                  textAlign: 'right',
                }}
              >
                {currencyFormatter(item.quantity * item.cost)}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </PageHeader>
  );
};

export default StockEntryDetailsPage;
