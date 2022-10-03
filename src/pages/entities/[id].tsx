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

const EntityDetailPage: NextPageWithLayout = () => {
  const id = useRouter().query.id as string;
  const { data: entity, error } = trpc.entity.byId.useQuery({
    id: parseInt(id),
  });

  if (error) return <div>failed to load</div>;
  if (!entity) return <div>loading...</div>;

  const Description = ({
    label,
    data,
    align = 'left',
  }: {
    label: string;
    data?: string | null;
    align?: 'left' | 'right';
  }) => (
    <Stack spacing={'xs'}>
      <Text size={'sm'} weight={'bold'} align={align}>
        {label}
      </Text>
      <Text align={align}>{data}</Text>
    </Stack>
  );

  return (
    <Stack>
      <Group position={'apart'}>
        <Title order={3}>{entity.name}</Title>
        <Button variant={'outline'} color={'blue'} rightIcon={<IconGridDots />}>
          Acciones
        </Button>
      </Group>
      <Grid>
        <Grid.Col span={3}>
          <Description label={'Documento'} data={entity?.document} />
        </Grid.Col>

        <Grid.Col span={3}>
          <Description
            label={'Tipo Documento'}
            data={entity.documentType?.toString()}
          />
        </Grid.Col>

        <Grid.Col span={3}>
          <Description
            label={'Creación'}
            data={dayjs(entity.createdAt).format('DD/MM/YYYY')}
          />
        </Grid.Col>
        <Grid.Col span={3}>
          <Description
            label={'Teléfono'}
            data={entity.cellphone ?? 'Sin teléfono'}
          />
        </Grid.Col>

        <Grid.Col span={6}>
          <Description
            label={'Dirección'}
            data={entity.address ?? 'Sin dirección'}
          />
        </Grid.Col>

        <Grid.Col span={3}>
          <Description
            label={'Limite crédito'}
            data={'1.000.000 Gs.'}
            align={'right'}
          />
        </Grid.Col>

        <Grid.Col span={3}>
          <Description
            label={'Pago Pendiente'}
            data={'950.000 Gs.'}
            align={'right'}
          />
        </Grid.Col>
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
    </Stack>
  );
};

export default EntityDetailPage;
