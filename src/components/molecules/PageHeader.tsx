import { Stack, Title, Group, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons';
import Head from 'next/head';
import { useRouter } from 'next/router';

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
   const router = useRouter();
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
                  <ActionIcon color="gray" onClick={() => router.back()}>
                     <IconArrowLeft />
                  </ActionIcon>

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
