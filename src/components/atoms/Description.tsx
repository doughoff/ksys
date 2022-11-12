import {
   Grid,
   GridProps,
   MantineStyleSystemProps,
   Stack,
   Text,
} from '@mantine/core';

export interface DescriptionItemProps extends MantineStyleSystemProps {
   label: string;
   className?: string;
   span?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
   data?: string | null;
   align?: 'left' | 'right';
   children?: React.ReactNode;
}

export const Description = ({
   label,
   span = 3,
   data,
   align,
   children,
}: DescriptionItemProps) => {
   return (
      <Grid.Col span={span}>
         <Stack spacing={'xs'}>
            <Text size={'sm'} weight={'bold'} align={align}>
               {label}
            </Text>
            {children ? children : <Text align={align}>{data}</Text>}
         </Stack>
      </Grid.Col>
   );
};
