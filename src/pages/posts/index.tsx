import {
  Button,
  Center,
  Group,
  Modal,
  Pagination,
  Table,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import React from 'react';
import { z } from 'zod';
import { trpc } from '../../utils/trpc';
import { NextPageWithLayout } from '../_app';
import dayjs from 'dayjs';
import { IconEye } from '@tabler/icons';
import { NextLink } from '@mantine/next';

const postSchema = z.object({
  title: z.string().min(3).max(50),
  text: z.string().min(8).max(1000),
});

const IndexPage: NextPageWithLayout = () => {
  const utils = trpc.useContext();
  const [isOpen, setIsOpen] = React.useState(false);
  const form = useForm({
    validate: zodResolver(postSchema),
    initialValues: {
      title: '',
      text: '',
    },
  });

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(5);

  const postsQuery = trpc.post.list.useQuery({
    pagination: {
      page: page,
      pageSize: pageSize,
    },
  });

  const addPost = trpc.post.add.useMutation({
    async onSuccess() {
      await utils.post.list.invalidate();
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
      <Modal title="Add Post" opened={isOpen} onClose={() => setIsOpen(false)}>
        <form
          onSubmit={form.onSubmit((values) => {
            addPost.mutate(values);
            form.reset();
            setIsOpen(false);
          })}
        >
          <TextInput
            label="Title"
            placeholder="Post title"
            {...form.getInputProps('title')}
          />
          <Textarea
            mt={'md'}
            label="Text"
            placeholder="Post text"
            {...form.getInputProps('text')}
          />
          <Group position="right" mt={'md'}>
            <Button type="submit">Add</Button>
          </Group>
        </form>
      </Modal>
    </>
  );
};

export default IndexPage;

/**
 * If you want to statically render this page
 * - Export `appRouter` & `createContext` from [trpc].ts
 * - Make the `opts` object optional on `createContext()`
 *
 * @link https://trpc.io/docs/ssg
 */
// export const getStaticProps = async (
//   context: GetStaticPropsContext<{ filter: string }>,
// ) => {
//   const ssg = createProxySSGHelpers({
//     router: appRouter,
//     ctx: await createContext(),
//   });
//
//   await ssg.post.all.fetch();
//
//   return {
//     props: {
//       trpcState: ssg.dehydrate(),
//       filter: context.params?.filter ?? 'all',
//     },
//     revalidate: 1,
//   };
// };
