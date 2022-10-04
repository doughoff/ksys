import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';
import {
  Button,
  Group,
  Stack,
  TextInput,
  Title,
  Grid,
  Text,
  Tabs,
} from '@mantine/core';
import {
  IconGridDots,
  IconReceipt2,
  IconReportMoney,
  IconShoppingCart,
} from '@tabler/icons';
import dayjs from 'dayjs';
import PageHeader from '~/components/molecules/PageHeader';
import { Description } from '~/components/atoms/Description';

const EntityDetailPage: NextPageWithLayout = () => {
  const id = useRouter().query.id as string;
  const { data: entity, error } = trpc.entity.byId.useQuery({
    id: parseInt(id),
  });

  if (error) return <div>failed to load</div>;
  if (!entity) return <div>loading...</div>;

  return (
    <PageHeader
      title={entity.name}
      extra={[
        <Button
          key={'actions'}
          variant={'outline'}
          color={'blue'}
          rightIcon={<IconGridDots />}
        >
          Acciones
        </Button>,
      ]}
    >
      <Grid>
        <Description label={'Documento'} data={entity?.document} />

        <Description
          label={'Tipo Documento'}
          data={entity.documentType?.toString()}
        />

        <Description
          label={'Creación'}
          data={dayjs(entity.createdAt).format('DD/MM/YYYY')}
        />
        <Description
          label={'Teléfono'}
          data={entity.cellphone ?? 'Sin teléfono'}
        />

        <Description
          span={6}
          label={'Dirección'}
          data={entity.address ?? 'Sin dirección'}
        />

        <Description
          label={'Limite crédito'}
          data={'1.000.000 Gs.'}
          align={'right'}
        />

        <Description
          label={'Pago Pendiente'}
          data={'950.000 Gs.'}
          align={'right'}
        />
      </Grid>

      <Tabs defaultValue={'pendingPayments'}>
        <Tabs.List>
          <Tabs.Tab value={'pendingPayments'} icon={<IconReportMoney />}>
            Pagos pendientes
          </Tabs.Tab>
          <Tabs.Tab value={'payments'} icon={<IconReceipt2 />}>
            Pagos
          </Tabs.Tab>
          <Tabs.Tab value={'sales'} icon={<IconShoppingCart />}>
            Ventas
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pendingPayments" pt="xs">
          <Title order={4}>Pagos pendientes</Title>
        </Tabs.Panel>

        <Tabs.Panel value="payments" pt="xs">
          <Title order={4}>Pagos</Title>
        </Tabs.Panel>

        <Tabs.Panel value="sales" pt="xs">
          <Title order={4}>Ventas</Title>
        </Tabs.Panel>
      </Tabs>
    </PageHeader>
  );
};

export default EntityDetailPage;
