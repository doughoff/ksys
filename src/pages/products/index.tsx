import { Button, TextInput } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconPlus, IconSearch } from '@tabler/icons';
import Head from 'next/head';
import React from 'react';
import StatusBadge from '~/components/atoms/StatusBadge';
import ProductFormModal from '~/components/forms/ProductFormModal';
import PageHeader from '~/components/molecules/PageHeader';
import PaginatedTable from '~/components/organisms/PaginatedTable/PaginatedTable';
import { usePagination } from '~/hooks/usePagination';
import { currencyFormatter } from '~/utils/formatters';
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
              <th>Cod. Barras</th>
              <th>Status</th>
              <th>Nombre</th>
              <th style={{ textAlign: 'right' }}>Precio</th>
              <th style={{ textAlign: 'right' }}>Stock</th>
              <th>Acciones</th>
            </tr>
          )}
          rows={(item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td width={180}>{item.barcode}</td>
              <td width={120}>{<StatusBadge status={item.status} />}</td>
              <td>{item.name}</td>
              <td style={{ textAlign: 'right' }}>
                {currencyFormatter(item.price)}
              </td>
              <td style={{ textAlign: 'right' }}>x{item.stock}</td>
              <td width={120}>
                <Button
                  variant="filled"
                  color="blue"
                  component={NextLink}
                  href={`/products/${item.id}`}
                >
                  Detalles
                </Button>
              </td>
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
