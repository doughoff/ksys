import { Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { Entity } from '@prisma/client';
import { IconSearch } from '@tabler/icons';
import dayjs from 'dayjs';
import Head from 'next/head';
import React from 'react';
import EntityFormModal from '~/components/forms/EntityFormModal';
import PaginatedTable from '~/components/organisms/PaginatedTable/PaginatedTable';
import { usePagination } from '~/hooks/usePagination';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const IndexPage: NextPageWithLayout = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const pagination = usePagination();
  const { data, isLoading, isError, error } = trpc.entity.list.useQuery(
    {
      text: search,
      pagination: pagination.data,
    },
    { onSuccess: (data) => pagination.setTotal(data.count) },
  );

  React.useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <>
      <Head>
        <title>Clientes</title>
      </Head>
      <Stack>
        <Group position="apart">
          <Title order={2}>Clientes</Title>
          <Button variant="filled" onClick={() => setIsOpen(true)}>
            Add post
          </Button>
        </Group>
        <TextInput
          label="Search"
          icon={<IconSearch />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <PaginatedTable
          items={data?.items ?? []}
          header={() => (
            <tr>
              <th>Cod.</th>
              <th>Nombre</th>
              <th>Documento</th>
              <th>Actions</th>
            </tr>
          )}
          rows={(row) => (
            <tr>
              <td width={'80px'}>{row.id}</td>
              <td>{row.name}</td>
              <td>
                {row.documentType} {row.document}
              </td>
              <td>{dayjs(row.createdAt).format('DD/MM/YYYY')}</td>
              <td width={'120px'}>
                <Button variant="filled" onClick={() => setIsOpen(true)}>
                  Editar
                </Button>
              </td>
            </tr>
          )}
          pagination={pagination}
        />
      </Stack>

      <EntityFormModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default IndexPage;
