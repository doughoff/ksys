import { Button, Group, Stack } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import React from 'react';
import PageHeader from '~/components/molecules/PageHeader';
import { SelectEntityModal, SelectProductModal } from '~/components/organisms';
import { NextPageWithLayout } from '~/pages/_app';

const NewSalePage: NextPageWithLayout = () => {
  const [showSearchModal, setShowSearchModal] = React.useState(false);
  return (
    <PageHeader
      title="Venta"
      extra={[
        <Button
          key="search"
          variant="outline"
          color="blue"
          leftIcon={<IconSearch />}
          onClick={() => setShowSearchModal(true)}
        >
          Buscar
        </Button>,
      ]}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          gap: 16,
          backgroundColor: '#ccc',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100px',
            backgroundColor: '#888',
          }}
        ></div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            flex: 'grow',
            justifySelf: 'stretch',
            height: '100%',
            backgroundColor: '#888',
          }}
        ></div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100px',
            backgroundColor: '#888',
          }}
        ></div>
      </div>
    </PageHeader>
  );
};

export default NewSalePage;

{
  /* <div>Search Modal: {showSearchModal ? 'true' : 'false'}</div>
      <SelectProductModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={(product) => {
          console.log(product);
        }}
      /> */
}
