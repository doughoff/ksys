import { Button } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconPlus } from '@tabler/icons';
import PageHeader from '~/components/molecules/PageHeader';
import { NextPageWithLayout } from '../_app';

import { DatePicker } from '@mantine/dates';
import 'dayjs/locale/es';
import { trpc } from '~/utils/trpc';
import React from 'react';
import { SaleType, Status } from '@prisma/client';
import {
   DailySummary,
   AggregatedData,
} from '~/components/organisms/DailySummary';

const DailySummaryPage: NextPageWithLayout = () => {
   const defaultDate = React.useMemo(
      () => new Date(new Date().setUTCHours(3, 0, 0, 0)),
      [],
   );
   const [selectedDate, setSelectedDate] = React.useState<Date | null>(
      defaultDate,
   );

   const { data, isLoading } = trpc.dailySummary.list.useQuery({
      date: selectedDate?.toISOString() ?? undefined,
   });

   const aggregatedData: AggregatedData | undefined = React.useMemo(() => {
      if (!data || isLoading) return undefined;

      const result: AggregatedData = {
         sales: {
            total: 0,
            deleted: 0,
            deletedList: [],
            paid: 0,
            credit: 0,
            totalCash: 0,
            totalCredit: 0,
         },

         payments: {
            total: 0,
            deleted: 0,
            deletedList: [],
            totalCash: 0,
         },
      };

      data.sales.forEach((sale) => {
         if (sale.status === Status.DELETED) {
            result.sales.deleted++;
            result.sales.deletedList.push(sale);
         } else if (sale.status === Status.ACTIVE) {
            result.sales.total++;
            if (sale.type === SaleType.CASH) {
               result.sales.paid++;
               result.sales.totalCash += sale.total;
            } else if (sale.type === SaleType.CREDIT) {
               result.sales.credit++;
               result.sales.totalCredit += sale.total;
            }
         } else {
            console.error('Sale status not handled');
         }
      });

      data.payments.forEach((payment) => {
         if (payment.status === Status.DELETED) {
            result.payments.deleted++;
            result.payments.deletedList.push(payment);
         } else if (payment.status === Status.ACTIVE) {
            result.payments.total++;
            result.payments.totalCash += payment.amount;
         } else {
            console.error('Payment status not handled');
         }
      });

      return result;
   }, [data, isLoading]);

   return (
      <PageHeader title="Movimientos diários">
         <DatePicker
            locale="es"
            placeholder="Seleccione una fecha"
            label="Fecha"
            defaultValue={selectedDate}
            onChange={(date) => setSelectedDate(date)}
         />

         {selectedDate && (
            <DailySummary dailySummary={aggregatedData} isLoading={isLoading} />
         )}
      </PageHeader>
   );
};

export default DailySummaryPage;
