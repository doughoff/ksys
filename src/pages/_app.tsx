import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { NotificationsProvider } from '@mantine/notifications';
import type { NextPage } from 'next';
import type { AppType, AppProps } from 'next/app';
import Head from 'next/head';
import type { ReactElement, ReactNode } from 'react';
import React from 'react';
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

  // prevent default from events like F5
  const preventDefault = (e: KeyboardEvent) => {
    const keysToPrevent = ['F2', 'F5'];
    if (keysToPrevent.includes(e.key)) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  React.useEffect(() => {
    window.addEventListener('keydown', preventDefault);
    return () => {
      window.removeEventListener('keydown', preventDefault);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: 'dark' }}
      >
        <ModalsProvider>
          <NotificationsProvider position="top-right">
            {getLayout(<Component {...pageProps} />)}
          </NotificationsProvider>
        </ModalsProvider>
      </MantineProvider>
    </>
  );
}) as AppType;

export default trpc.withTRPC(MyApp);
