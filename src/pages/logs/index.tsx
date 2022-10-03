import { Button, NumberInput, Stack, Table, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { Log } from '@prisma/client';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const IndexPage: NextPageWithLayout = () => {
  const [filters, setFilters] = useState<{ table?: string; rowId?: number }>();
  const { data, refetch } = trpc.log.list.useQuery(
    { ...filters },
    { enabled: false },
  );

  const filterForm = useForm({
    initialValues: {
      table: '',
      rowId: 0,
    },
    validate: zodResolver(
      z.object({
        table: z.string(),
        rowId: z.number(),
      }),
    ),
  });

  async function handleSubmit() {
    const { table, rowId } = filterForm.values;
    setFilters({ table, rowId: Number(rowId) });
  }

  useEffect(() => {
    if (filters) {
      refetch();
    }
  }, [filters, refetch]);

  return (
    <div>
      <form onSubmit={filterForm.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput label="Table" {...filterForm.getInputProps('table')} />
          <NumberInput label="Row ID" {...filterForm.getInputProps('rowId')} />
          <Button type="submit">Search</Button>
        </Stack>
      </form>

      <Table>
        <thead>
          <tr>
            <th>Table</th>
            <th>Row ID</th>
            <th>Type</th>
            <th>CreatedAt</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {data?.map((log) => (
            <tr key={log.id}>
              <td>{log.table}</td>
              <td>{log.rowId}</td>
              <td>{log.type}</td>
              <td>{dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}</td>
              <td>{JSON.stringify(log.data)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default IndexPage;
