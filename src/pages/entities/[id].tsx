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
   IconPencil,
   IconReceipt2,
   IconReportMoney,
   IconShoppingCart,
} from '@tabler/icons';
import dayjs from 'dayjs';
import PageHeader from '~/components/molecules/PageHeader';
import { Description } from '~/components/atoms/Description';
import EntityFormModal from '~/components/forms/EntityFormModal';
import React from 'react';
import { currencyFormatter } from '~/utils/formatters';
import { GenericTable } from '~/components/organisms';

const EntityDetailPage: NextPageWithLayout = () => {
   const id = useRouter().query.id as string;
   const { data: entity, error } = trpc.entity.byId.useQuery({
      id: parseInt(id),
   });
   const [showEditForm, setShowEditForm] = React.useState(false);

   if (error) return <div>failed to load</div>;
   if (!entity) return <div>loading...</div>;

   return (
      <PageHeader
         title={`${entity.id} - ${entity.name}`}
         extra={[
            <Button
               key={'actions'}
               variant={'outline'}
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

         <Tabs defaultValue={'pendingPayments'}>
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
                              <td width="120px">
                                 {dayjs(creditItem.createdAt).format(
                                    'DD/MM/YYYY',
                                 )}
                              </td>
                              <td width="80px">{creditItem.sale?.id ?? '-'}</td>
                              <td
                                 style={{
                                    textAlign: 'right',
                                 }}
                              >
                                 {currencyFormatter(creditItem.amount)}
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
                              <th>Fecha</th>
                              <th
                                 style={{
                                    textAlign: 'right',
                                 }}
                              >
                                 Valor
                              </th>
                           </tr>
                        )}
                        rows={(paymentProcess) => (
                           <tr>
                              <td width="80px">{paymentProcess.id}</td>
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
                           </tr>
                        )}
                     />
                  </Grid.Col>
               </Grid>
            </Tabs.Panel>

            <Tabs.Panel value="sales" pt="xs">
               <Title order={4}>Ventas</Title>
            </Tabs.Panel>
         </Tabs>
         {showEditForm && (
            <EntityFormModal
               isOpen={showEditForm}
               onClose={() => setShowEditForm(false)}
               entity={entity}
            />
         )}
      </PageHeader>
   );
};

export default EntityDetailPage;
