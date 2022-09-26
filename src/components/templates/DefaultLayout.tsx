import { AppShell } from '@mantine/core';
import { ReactNode } from 'react';
import { NavbarMinimal } from './NavbarMinimal';

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
  return (
    <AppShell padding={'md'} navbar={<NavbarMinimal />}>
      {children}
    </AppShell>
  );
};
