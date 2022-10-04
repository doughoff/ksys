import { Stack, Title, Text, Group } from '@mantine/core';

export interface PageHeaderProps {
  title: string;
  extra?: React.ReactNode[];
  children?: React.ReactNode;
}

const PageHeader = ({ title, extra, children }: PageHeaderProps) => {
  return (
    <Stack spacing={'lg'}>
      <Group position={'apart'}>
        <Title order={3}>{title}</Title>
        {extra && <Group spacing={'sm'}>{extra}</Group>}
      </Group>
      {children}
    </Stack>
  );
};

export default PageHeader;
