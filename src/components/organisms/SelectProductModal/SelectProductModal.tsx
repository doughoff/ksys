import { clsx, Table } from '@mantine/core';
import { Product } from '@prisma/client';
import React from 'react';
import { currencyFormatter } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';
import { ModalListSelection } from '../ModalListSelection';
import styles from './SelectProductModal.module.css';

export interface SelectProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

export default function SelectProductModal({
  isOpen,
  onClose,
  onSelect,
}: SelectProductModalProps) {
  const [text, setText] = React.useState('');
  const { data, isInitialLoading } = trpc.products.list.useQuery(
    {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      text,
    },
    {
      enabled: isOpen && text.length > 0,
    },
  );

  return (
    <ModalListSelection
      title="Buscar producto"
      size="lg"
      isOpen={isOpen}
      items={data?.items ?? []}
      onClose={onClose}
      onSearch={setText}
      onSelect={onSelect}
      isLoading={isInitialLoading}
      renderItems={(items, selected, setSelectedIndex) => (
        <Table>
          <thead>
            <tr>
              <th>Cod</th>
              <th>Nombre</th>
              <th>Stock</th>
              <th
                style={{
                  textAlign: 'right',
                }}
              >
                Precio
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr
                key={item.id}
                className={clsx(
                  styles.row,
                  selected === index && styles.selected,
                )}
                onClick={() => {
                  setSelectedIndex(index);
                }}
              >
                <td width={80}>{item.id}</td>
                <td>{item.name}</td>
                <td width={80}>{item.stock}</td>
                <td
                  width={120}
                  style={{
                    textAlign: 'right',
                  }}
                >
                  {currencyFormatter(item.price)}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    />
  );
}
