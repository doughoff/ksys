import { NextPageWithLayout } from '~/pages/_app';
import { useForm } from '@mantine/form';

const NewSalePage: NextPageWithLayout = () => {
  const itemForm = useForm<{
    quantity?: number;
    cost?: number;
  }>({
    initialValues: {
      quantity: undefined,
      cost: undefined,
    },
  });

  return <h1>Sale page </h1>;
};

export default NewSalePage;
