import {
   ActionIcon,
   Center,
   Grid,
   LoadingOverlay,
   Pagination,
   Table,
   Tabs,
   Text,
} from '@mantine/core';
import { NextLink } from '@mantine/next';
import { Entity, PaymentProcess, Sale, SaleItems } from '@prisma/client';
import {
   IconArrowRight,
   IconReceiptOff,
   IconShoppingCartX,
} from '@tabler/icons';
import dayjs from 'dayjs';
import { Description } from '~/components/atoms/Description';
import StatusBadge from '~/components/atoms/StatusBadge';
import { PaginationController } from '~/hooks/usePagination';
import { currencyFormatter } from '~/utils/formatters';
import { GenericTable } from '../GenericTable';

export interface AggregatedData {
   sales: {
      total: number;
      deleted: number;
      deletedList: Array<
         Sale & {
            entity: Entity | null;
         }
      >;
      paid: number;
      credit: number;
      totalCash: number;
      totalCredit: number;
   };

   payments: {
      total: number;
      deleted: number;
      deletedList: Array<
         PaymentProcess & {
            entity: Entity | null;
         }
      >;
      totalCash: number;
   };
}

export interface Props {
   dailySummary?: AggregatedData;
   isLoading: boolean;
}

const DailySummary = ({ dailySummary, isLoading }: Props) => {
   console.log(dailySummary);

   if (isLoading) return <LoadingOverlay visible={isLoading} />;

   // if no data and is not loading return a message saying that there is no data for that day
   if (!dailySummary) {
      return (
         <Center>
            <Text size={20} weight={500}>
               No fue posible encontrar información para la fecha seleccionada
            </Text>
         </Center>
      );
   }
   return (
      <>
         <Text size={'xl'} weight={'bold'}>
            Ventas
         </Text>
         <Grid>
            <Description
               label="Numero de Ventas"
               data={dailySummary.sales.total.toString()}
            />
            <Description
               label="Numero de Ventas Eliminadas"
               data={dailySummary.sales.deleted.toString()}
            />
            <Description
               label="Total en Creditos"
               data={currencyFormatter(dailySummary.sales.totalCredit)}
               align="right"
            />
            <Description
               label="Total Vendido en Efectivo"
               data={currencyFormatter(dailySummary.sales.totalCash)}
               align="right"
            />
         </Grid>
         <Text size={'xl'} weight={'bold'}>
            Pagos de Creditos
         </Text>
         <Grid>
            <Description
               label="Numero de Pagos"
               data={dailySummary.payments.total.toString()}
            />
            <Description
               label="Numero de Pagos Eliminados"
               data={dailySummary.payments.deleted.toString()}
               span={6}
            />
            <Description
               label="Total Pago en Efectivo"
               data={currencyFormatter(dailySummary.payments.totalCash)}
               align="right"
            />
         </Grid>

         <Text size={'xl'} weight={'bold'}>
            Total en Efectivo
         </Text>
         <Grid>
            <Description
               label="Total en Efectivo"
               data={currencyFormatter(
                  dailySummary.sales.totalCash +
                     dailySummary.payments.totalCash,
               )}
               align="right"
            />
         </Grid>
         <Tabs defaultValue={'deleted_sales'}>
            <Tabs.List>
               <Tabs.Tab value="deleted_sales" icon={<IconShoppingCartX />}>
                  Ventas Eliminadas
               </Tabs.Tab>
               <Tabs.Tab value="deleted_payments" icon={<IconReceiptOff />}>
                  Pagos Eliminados
               </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="deleted_sales">
               <GenericTable
                  items={dailySummary.sales.deletedList}
                  header={() => (
                     <tr>
                        <th>Cod.</th>
                        <th>Estado</th>
                        <th>Fecha de Creación</th>
                        <th>Fecha de Modificación</th>
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
                        <td width="200px">
                           {dayjs(sale.updatedAt).format('DD/MM/YYYY')}
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
            <Tabs.Panel value="deleted_payments">
               <GenericTable
                  items={dailySummary.payments.deletedList}
                  header={() => (
                     <tr>
                        <th>Cod.</th>
                        <th>Estado</th>
                        <th>Fecha de Creación</th>
                        <th>Fecha de Modificación</th>
                        <th>Cliente</th>
                        <th
                           style={{
                              textAlign: 'right',
                           }}
                        >
                           Valor del Pago
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
                           {dayjs(creditItem.createdAt).format('DD/MM/YYYY')}
                        </td>
                        <td width="120px">
                           {dayjs(creditItem.updatedAt).format('DD/MM/YYYY')}
                        </td>
                        <td width="280px">
                           {creditItem.entity?.name || 'Cliente Ocasional'}
                        </td>
                        <td
                           style={{
                              textAlign: 'right',
                           }}
                        >
                           {currencyFormatter(creditItem.amount)}
                        </td>
                     </tr>
                  )}
               />
            </Tabs.Panel>
         </Tabs>
      </>
   );
};

export default DailySummary;
