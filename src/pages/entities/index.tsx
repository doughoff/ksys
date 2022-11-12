import { Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import { NextLink } from '@mantine/next';
import dayjs from 'dayjs';
import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import EntityFormModal from '~/components/forms/EntityFormModal';
import GenericTable from '~/components/organisms/GenericTable/GenericTable';
import PaginatedTable from '~/components/organisms/PaginatedTable/PaginatedTable';
import { usePagination } from '~/hooks/usePagination';
import { appRouter, AppRouter } from '~/server/routers/_app';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const IndexPage: NextPageWithLayout = () => {
   const [isOpen, setIsOpen] = React.useState(false);
   const [text, setText] = React.useState('');
   const [search, setSearch] = React.useState('');
   const pagination = usePagination();
   const { data } = trpc.entity.list.useQuery(
      {
         text: search,
         pagination: pagination.data,
      },
      { onSuccess: (data) => pagination.setTotal(data.count) },
   );

   React.useEffect(() => {
      const timeout = setTimeout(() => {
         setSearch(text);
      }, 300);
      return () => clearTimeout(timeout);
   }, [text]);

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
               value={text}
               onChange={(e) => setText(e.target.value)}
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
                        <Button
                           variant="filled"
                           onClick={() => setIsOpen(true)}
                           component={NextLink}
                           href={`/entities/${row.id}`}
                        >
                           Detalles
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
