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
   ActionIcon,
} from '@mantine/core';
import {
   IconArrowRight,
   IconEye,
   IconGridDots,
   IconPencil,
   IconReceipt2,
   IconReportMoney,
   IconShoppingCart,
   IconTrash,
} from '@tabler/icons';
import dayjs from 'dayjs';
import PageHeader from '~/components/molecules/PageHeader';
import { Description } from '~/components/atoms/Description';
import EntityFormModal from '~/components/forms/EntityFormModal';
import React from 'react';
import { currencyFormatter } from '~/utils/formatters';
import { GenericTable } from '~/components/organisms';
import PaymentModal from '~/components/forms/PaymentModal';
import StatusBadge from '~/components/atoms/StatusBadge';
import { openConfirmModal } from '@mantine/modals';
import { NextLink } from '@mantine/next';

const EntityDetailPage: NextPageWithLayout = () => {
   const id = useRouter().query.id as string;
   const {
      data: entity,
      error,
      refetch: refetchEntity,
   } = trpc.entity.byId.useQuery({
      id: parseInt(id),
   });
   const [showEditForm, setShowEditForm] = React.useState(false);
   const [showPaymentForm, setShowPaymentForm] = React.useState(false);

   const trpcUtils = trpc.useContext();

   const { mutateAsync: cancelPayment, isLoading: cancelPaymentInProcess } =
      trpc.payments.cancel.useMutation({
         async onSuccess() {
            await trpcUtils.payments.list.invalidate();
            await trpcUtils.entity.byId.invalidate({ id: entity?.id ?? 0 });
         },
      });

   const { mutateAsync: calculate } =
      trpc.sales.calculate_interest.useMutation();

   React.useEffect(() => {
      const today = dayjs().startOf('day'); // Get today's date at the start of the day
      const lastCalculationDate = dayjs(
         window.localStorage.getItem('lastCalculation'),
      );

      if (
         !lastCalculationDate.isValid() ||
         !today.isSame(lastCalculationDate, 'day')
      ) {
         calculate();
         window.localStorage.setItem('lastCalculation', today.toString());
         refetchEntity();
      }
   }, [calculate]); // eslint-disable-line react-hooks/exhaustive-deps

   if (error) return <div>failed to load</div>;
   if (!entity) return <div>loading...</div>;

   return (
      <PageHeader
         title={`${entity.id} - ${entity.name}`}
         extra={[
            <Button
               key={'actions'}
               color={'blue'}
               leftIcon={<IconReportMoney />}
               onClick={() => setShowPaymentForm(true)}
            >
               Agregar Pago
            </Button>,
            <Button
               key={'actions'}
               color={'blue'}
               leftIcon={<IconPencil />}
               onClick={() => setShowEditForm(true)}
            >
               Editar Cliente
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
               data={currencyFormatter(entity.creditLimit)}
               align={'right'}
            />
            <Description
               label={'Pago Pendiente'}
               data={currencyFormatter(
                  entity.Credit.reduce(
                     (acc, curr) => acc + curr.paymentLeft,
                     0,
                  ),
               )}
               align={'right'}
            />
         </Grid>

         <Tabs defaultValue={'payments'}>
            <Tabs.List>
               <Tabs.Tab value={'payments'} icon={<IconReceipt2 />}>
                  Pagos
               </Tabs.Tab>
               <Tabs.Tab value={'sales'} icon={<IconShoppingCart />}>
                  Historico de Ventas
               </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="payments" pt="xs">
               <Grid>
                  <Grid.Col span={6}>
                     <Title size={18}>Pendientes</Title>
                     <GenericTable
                        items={entity.Credit}
                        header={() => (
                           <tr>
                              <th>Cod.</th>
                              <th>Estado</th>
                              <th>Fecha</th>
                              <th>Cod. Venta</th>
                              <th
                                 style={{
                                    textAlign: 'right',
                                 }}
                              >
                                 Valor Original
                              </th>
                              <th
                                 style={{
                                    textAlign: 'right',
                                 }}
                              >
                                 Pago Pendiente
                              </th>
                           </tr>
                        )}
                        rows={(creditItem) => (
                           <tr>
                              <td width="80px">{creditItem.id}</td>
                              <td width="100px">
                                 <StatusBadge status={creditItem.status} />
                              </td>
                              <td width="120px">
                                 {dayjs(creditItem.createdAt).format(
                                    'DD/MM/YYYY',
                                 )}
                              </td>
                              <td width="120px">
                                 {creditItem.sale?.id ?? '-'}
                              </td>
                              <td
                                 style={{
                                    textAlign: 'right',
                                 }}
                              >
                                 {currencyFormatter(creditItem.originalAmount)}
                              </td>
                              <td
                                 style={{
                                    textAlign: 'right',
                                 }}
                              >
                                 {currencyFormatter(creditItem.paymentLeft)}
                              </td>
                           </tr>
                        )}
                     />
                  </Grid.Col>
                  <Grid.Col span={6}>
                     <Title size={18}>Pagos</Title>
                     <GenericTable
                        items={entity.PaymentProcess}
                        header={() => (
                           <tr>
                              <th>Cod.</th>
                              <th>Estado</th>
                              <th>Fecha</th>
                              <th
                                 style={{
                                    textAlign: 'right',
                                 }}
                              >
                                 Valor
                              </th>
                              <th>#</th>
                           </tr>
                        )}
                        rows={(paymentProcess) => (
                           <tr>
                              <td width="80px">{paymentProcess.id}</td>
                              <td width="100px">
                                 <StatusBadge status={paymentProcess.status} />
                              </td>
                              <td width="200px">
                                 {dayjs(paymentProcess.createdAt).format(
                                    'DD/MM/YYYY',
                                 )}
                              </td>
                              <td
                                 style={{
                                    textAlign: 'right',
                                 }}
                              >
                                 {currencyFormatter(paymentProcess.amount)}
                              </td>
                              <td width="50px">
                                 <ActionIcon
                                    color={
                                       paymentProcess.status === 'ACTIVE'
                                          ? 'red'
                                          : 'gray'
                                    }
                                    size={'sm'}
                                    disabled={
                                       paymentProcess.status !== 'ACTIVE' ||
                                       cancelPaymentInProcess
                                    }
                                    loading={cancelPaymentInProcess}
                                    onClick={() => {
                                       openConfirmModal({
                                          title: 'Cancelar Pago',
                                          children: (
                                             <Text size={'sm'}>
                                                ¿Está seguro que desea cancelar
                                                el pago?
                                             </Text>
                                          ),
                                          labels: {
                                             confirm: 'Cancelar',
                                             cancel: 'No',
                                          },
                                          confirmProps: {
                                             color: 'red',
                                          },
                                          onConfirm: async () => {
                                             cancelPayment({
                                                id: paymentProcess.id,
                                             });
                                          },
                                       });
                                    }}
                                 >
                                    <IconTrash />
                                 </ActionIcon>
                              </td>
                           </tr>
                        )}
                     />
                  </Grid.Col>
               </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="sales" pt="xs">
               <GenericTable
                  items={entity.Sale}
                  header={() => (
                     <tr>
                        <th>Cod.</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th
                           style={{
                              textAlign: 'right',
                           }}
                        >
                           Valor
                        </th>
                        <th>#</th>
                     </tr>
                  )}
                  rows={(sale) => (
                     <tr>
                        <td width="80px">{sale.id}</td>
                        <td width="100px">
                           <StatusBadge status={sale.status} />
                        </td>
                        <td width="200px">
                           {dayjs(sale.createdAt).format('DD/MM/YYYY')}
                        </td>
                        <td width="100px">
                           {sale.type === 'CREDIT' ? 'Crédito' : 'Contado'}
                        </td>
                        <td
                           style={{
                              textAlign: 'right',
                           }}
                        >
                           {currencyFormatter(sale.total)}
                        </td>
                        <td width="50px">
                           <ActionIcon
                              color={'blue'}
                              component={NextLink}
                              href={`/sales/${sale.id}`}
                           >
                              <IconArrowRight />
                           </ActionIcon>
                        </td>
                     </tr>
                  )}
               />
            </Tabs.Panel>
         </Tabs>
         {showEditForm && (
            <EntityFormModal
               isOpen={showEditForm}
               onClose={() => setShowEditForm(false)}
               entity={entity}
            />
         )}
         {showPaymentForm && (
            <PaymentModal
               isOpen={showPaymentForm}
               onClose={() => setShowPaymentForm(false)}
               entityId={entity.id}
            />
         )}
      </PageHeader>
   );
};

export default EntityDetailPage;
