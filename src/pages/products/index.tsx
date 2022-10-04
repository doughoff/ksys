import { Button, TextInput } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons';
import Head from 'next/head';
import React from 'react';
import ProductFormModal from '~/components/forms/ProductFormModal';
import PageHeader from '~/components/molecules/PageHeader';
import PaginatedTable from '~/components/organisms/PaginatedTable/PaginatedTable';
import { usePagination } from '~/hooks/usePagination';
import { trpc } from '~/utils/trpc';
import { NextPageWithLayout } from '../_app';

const ProductsPage: NextPageWithLayout = () => {
  const [addProductModalOpen, setAddProductModalOpen] = React.useState(false);
  const [text, setText] = React.useState('');
  const [search, setSearch] = React.useState('');
  const pagination = usePagination();
  const { data } = trpc.products.list.useQuery(
    {
      text: search,
      pagination: pagination.data,
    },
    { onSuccess: (data) => pagination.setTotal(data.count) },
  );

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(text);
    }, 300);
    return () => clearTimeout(timeout);
  }, [text]);

  return (
    <>
      <Head>
        <title>Productos</title>
      </Head>

      <PageHeader
        title="Productos"
        extra={[
          <Button
            key="add_product"
            variant="filled"
            onClick={() => setAddProductModalOpen(true)}
            leftIcon={<IconPlus />}
          >
            Adicionar Producto
          </Button>,
        ]}
      >
        <TextInput
          label="Buscar"
          icon={<IconSearch />}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <PaginatedTable
          items={data?.items ?? []}
          header={() => (
            <tr>
              <th>Cod.</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Acciones</th>
            </tr>
          )}
          rows={(item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.price}</td>
              <td>{item.stock}</td>
              <td>Acciones</td>
            </tr>
          )}
          pagination={pagination}
        />
      </PageHeader>

      <ProductFormModal
        isOpen={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
      />
    </>
  );
};

export default ProductsPage;
