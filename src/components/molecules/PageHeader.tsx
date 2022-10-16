import { Stack, Title, Group } from '@mantine/core';
import Head from 'next/head';

export interface PageHeaderProps {
  title: string;
  extra?: React.ReactNode[];
  tags?: React.ReactNode;
  children?: React.ReactNode;
}

const PageHeader = ({ title, tags, extra, children }: PageHeaderProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Stack spacing={'lg'}>
        <Group position={'apart'} spacing={'sm'}>
          <Group>
            <Title order={3}>{title}</Title>
            {tags && <div>{tags}</div>}
          </Group>
          {extra && <Group spacing={'sm'}>{extra}</Group>}
        </Group>
        {children}
      </Stack>
    </>
  );
};

export default PageHeader;
