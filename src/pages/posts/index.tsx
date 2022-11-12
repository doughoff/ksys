import { Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconEye, IconSearch } from '@tabler/icons';
import dayjs from 'dayjs';
import Head from 'next/head';
import React from 'react';
import AddPostModal from '~/components/forms/AddPostModal';
import PaginatedTable from '~/components/organisms/PaginatedTable/PaginatedTable';
import { usePagination } from '~/hooks/usePagination';
import { trpc } from '../../utils/trpc';
import { NextPageWithLayout } from '../_app';

const IndexPage: NextPageWithLayout = () => {
   const [isOpen, setIsOpen] = React.useState(false);
   const [search, setSearch] = React.useState('');
   const pagination = usePagination();
   const { data } = trpc.post.list.useQuery(
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
            <title>Posts</title>
         </Head>
         <Stack>
            <Group position="apart">
               <Title order={2}>Posts</Title>
               <Button
                  variant="filled"
                  color={'blue'}
                  onClick={() => setIsOpen(true)}
               >
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
                     <th>Title</th>
                     <th>Text</th>
                     <th>Created At</th>
                     <th>Actions</th>
                  </tr>
               )}
               rows={(post) => (
                  <tr key={post.id}>
                     <td>{post.title}</td>
                     <td>{post.text}</td>
                     <td>
                        {dayjs(post.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                     </td>
                     <td width={'120px'}>
                        <Button
                           variant="outline"
                           component={NextLink}
                           href={`/posts/${post.id}`}
                           leftIcon={<IconEye />}
                        >
                           Details
                        </Button>
                     </td>
                  </tr>
               )}
               pagination={pagination}
            />
         </Stack>
         {/* test button */}
         <AddPostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </>
   );
};

export default IndexPage;
