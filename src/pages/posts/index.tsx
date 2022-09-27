import { Button, Center, Group, Pagination, Table, Title } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconEye } from '@tabler/icons';
import dayjs from 'dayjs';
import Head from 'next/head';
import React from 'react';
import AddPostModal from '~/components/forms/AddPostModal';
import { trpc } from '../../utils/trpc';
import { NextPageWithLayout } from '../_app';

const IndexPage: NextPageWithLayout = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const postsQuery = trpc.post.list.useQuery({
    pagination: {
      page: page,
      pageSize: pageSize,
    },
  });

  const posts = postsQuery.data?.items ?? [];
  const postsCount = postsQuery.data?.count ?? 0;
  const totalPages = Math.ceil(postsCount / pageSize);
  const tableRows = posts?.map((post) => (
    <tr key={post.id}>
      <td>{post.title}</td>
      <td>{post.text}</td>
      <td>{dayjs(post.createdAt).format('DD/MM/YYYY HH:mm:ss')}</td>
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
  ));

  const postsTable = (
    <Table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Text</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>{tableRows}</tbody>
    </Table>
  );

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>
      <Group position="apart">
        <Title order={2}>Posts</Title>
        <Button variant="filled" color={'blue'} onClick={() => setIsOpen(true)}>
          Add post
        </Button>
      </Group>
      {postsTable}
      <Center mt={'md'}>
        <Pagination
          page={page}
          total={totalPages}
          onChange={(page) => setPage(page)}
        />
      </Center>
      {/* test button */}
      <AddPostModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default IndexPage;
