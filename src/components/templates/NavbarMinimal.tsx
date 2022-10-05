import {
  createStyles,
  Navbar,
  Stack,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { NextLink } from '@mantine/next';
import {
  IconActivity,
  IconBarcode,
  IconGauge,
  IconHome2,
  IconUser,
  TablerIcon,
} from '@tabler/icons';
import { useRouter } from 'next/router';
import NoSSR from '../atoms/NoSSRTooltip/NoSSRTooltip';

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark?.[0]
        : theme.colors.gray?.[7],

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark?.[5]
          : theme.colors.gray?.[0],
    },
  },

  active: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({
        variant: 'light',
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
        .color,
    },
  },
}));

interface NavbarLinkProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  href: string;
  onClick?(): void;
}

function NavbarLink({
  icon: Icon,
  label,
  active,
  onClick,
  href,
}: NavbarLinkProps) {
  const { classes, cx } = useStyles();
  return (
    <NoSSR>
      <Tooltip label={label} position="right" transitionDuration={0}>
        <UnstyledButton
          onClick={onClick}
          className={cx(classes.link, { [classes.active]: active })}
          component={NextLink}
          href={href}
        >
          <Icon stroke={1.5} />
        </UnstyledButton>
      </Tooltip>
    </NoSSR>
  );
}

const mockdata = [
  { icon: IconHome2, label: 'Página', href: '/', exactMatch: true },
  { icon: IconGauge, label: 'Dashboard', href: '/posts' },
  { icon: IconUser, label: 'Clientes', href: '/entities' },
  { icon: IconActivity, label: 'Logs', href: '/logs' },
  { icon: IconBarcode, label: 'Produtos', href: '/products' },
];

export function NavbarMinimal() {
  const router = useRouter();

  const links = mockdata.map((link) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={
        link.exactMatch
          ? router.asPath === link.href
          : router.asPath.startsWith(link.href)
      }
    />
  ));

  return (
    <Navbar width={{ base: 80 }} p="md">
      <Navbar.Section grow mt={0}>
        <Stack justify="center" spacing={0}>
          {links}
        </Stack>
      </Navbar.Section>
    </Navbar>
  );
}
