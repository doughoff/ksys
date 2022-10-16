import { Button } from '@mantine/core';
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
      <div>Search Modal: {showSearchModal ? 'true' : 'false'}</div>
      <SelectEntityModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={(entity) => {
          console.log(entity);
        }}
      />
    </PageHeader>
  );
};

export default NewSalePage;
