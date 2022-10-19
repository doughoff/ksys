import { Stack, Title, Group } from '@mantine/core';
import Head from 'next/head';

export interface PageHeaderProps {
  title: string;
  extra?: React.ReactNode[];
  tags?: React.ReactNode;
  children?: React.ReactNode;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

const PageHeader = ({
  title,
  tags,
  extra,
  children,
  onKeyDown,
}: PageHeaderProps) => {
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <Stack
        spacing={'lg'}
        style={{
          height: '100%',
        }}
        onKeyDown={(event) => {
          if (onKeyDown) {
            onKeyDown(event);
          }
        }}
      >
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
