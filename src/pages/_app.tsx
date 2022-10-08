import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
import { DefaultLayout } from '~/components/templates/DefaultLayout';
import { trpc } from '~/utils/trpc';
import '../styles/global.css';

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = (({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout =
    Component.getLayout ?? ((page) => <DefaultLayout>{page}</DefaultLayout>);

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <span>test</span>
      <span>test2</span>
      <span>test3</span>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: 'dark' }}
      >
        <NotificationsProvider position="top-right">
          {getLayout(<Component {...pageProps} />)}
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
}) as AppType;

export default trpc.withTRPC(MyApp);
