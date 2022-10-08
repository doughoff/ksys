import { Title } from '@mantine/core';
import BearControls from '~/components/organisms/BearControls/BearControls';
import BearList from '~/components/organisms/BearList/BearList';
import { NextPageWithLayout } from '../_app';

const IndexPage: NextPageWithLayout = () => {
  return (
    <>
      <Title>Hey, im here to see if im rendering...</Title>
      <BearControls />
      <BearList />
    </>
  );
};

export default IndexPage;
