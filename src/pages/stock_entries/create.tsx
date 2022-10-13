import PageHeader from '~/components/molecules/PageHeader';
import { newStockEntryItemSchema } from '~/validators/stockEntry';
import { NextPageWithLayout } from '../_app';
import { devtools, persist } from 'zustand/middleware';
import {
  Box,
  Button,
  Grid,
  NumberInput,
  Table,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { trpc } from '~/utils/trpc';
import { useRef, useState } from 'react';
import { Product } from '@prisma/client';
import { showNotification } from '@mantine/notifications';
import create from 'zustand';
import { currencyFormatter, currencyParser } from '~/utils/formatters';
import { IconCheck, IconTrash, IconX } from '@tabler/icons';

interface NewStockEntryState {
  items: {
    productId: number;
    quantity: number;
    cost: number;
    product: Product;
  }[];
  addItem: (item: {
    productId: number;
    quantity?: number;
    cost?: number;
    product: Product;
  }) => void;
  removeItem: (index: number) => void;
  clearItems: () => void;
}

const useNewStockEntry = create<NewStockEntryState>()(
  devtools(
    persist((set) => ({
      items: [],
      addItem: (item) =>
        set((prev) => {
          //check if item already exists, if exists, update quantity if cost is same
          const existingItem = prev.items.find(
            (i) => i.productId === item.productId,
          );

          if (existingItem && existingItem.cost === item.cost) {
            // create new array with updated quantity
            const newItems = prev.items.map((i) => {
              if (i.productId === item.productId) {
                return {
                  ...i,
                  quantity: i.quantity + (item.quantity ?? 0),
                };
              }
              return i;
            });

            return { ...prev, items: newItems };
          }
          return {
            ...prev,
            items: [
              ...prev.items,
              {
                ...item,
                quantity: item.quantity ?? 1,
                cost: item.cost ?? 0,
              },
            ],
          };
        }),
      removeItem: (index) =>
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        })),
      clearItems: () => set({ items: [] }),
    })),
  ),
);

const StockEntryForm = () => {
  const { addItem } = useNewStockEntry();
  const [barcode, setBarcode] = useState('');
  const [searching, setSearching] = useState(false);
  const { data: product } = trpc.products.byBarcode.useQuery(
    {
      barcode: barcode,
    },
    {
      enabled: searching && barcode.length > 0,
      onSuccess: () => {
        setSearching(false);
        // set focus to cost quantityInput
        quantityInputRef.current?.focus();
      },
    },
  );
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);

  const itemForm = useForm<{
    quantity?: number;
    cost?: number;
  }>({
    initialValues: {
      quantity: undefined,
      cost: undefined,
    },
    validate: zodResolver(
      newStockEntryItemSchema.pick({
        cost: true,
        quantity: true,
      }),
    ),
  });

  const handleSubmit = () => {
    if (!product) {
      showNotification({
        title: 'Error',
        message: 'Por favor, escanee un producto válido',
        color: 'red',
      });
      return;
    }

    addItem({
      ...itemForm.values,
      productId: product.id,
      product,
    });

    setBarcode('');
    itemForm.reset();

    // set focus to barcodeInput
    barcodeInputRef.current?.focus();
  };

  return (
    <Grid>
      <Grid.Col span={2}>
        <TextInput
          label="Código de barras"
          ref={barcodeInputRef}
          value={barcode}
          onChange={(e) => {
            setBarcode(e.currentTarget.value);
            setSearching(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearching(true);
            }
          }}
          placeholder="Escanee un producto"
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <TextInput label="Product Name" value={product?.name || ''} disabled />
      </Grid.Col>
      <Grid.Col span={7}>
        <form onSubmit={itemForm.onSubmit(handleSubmit)}>
          <Grid>
            <Grid.Col span={2}>
              <NumberInput
                ref={quantityInputRef}
                label="Cantidad"
                {...itemForm.getInputProps('quantity')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <NumberInput
                label="Costo"
                parser={currencyParser}
                formatter={currencyFormatter}
                {...itemForm.getInputProps('cost')}
              />
            </Grid.Col>

            <Grid.Col span={3}>
              <NumberInput
                label="Total"
                parser={(value) => currencyParser(value ?? '')}
                formatter={currencyFormatter}
                disabled
                value={
                  (itemForm.values.quantity ?? 0) * (itemForm.values.cost ?? 0)
                }
              />
            </Grid.Col>

            <Grid.Col span={3}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  height: '100%',
                  width: '100%',
                }}
              >
                <Button
                  type="submit"
                  variant="filled"
                  fullWidth
                  disabled={!product}
                >
                  Adicionar
                </Button>
              </div>
            </Grid.Col>
          </Grid>
        </form>
      </Grid.Col>
    </Grid>
  );
};

const StockEntryList = () => {
  const { items, removeItem } = useNewStockEntry();
  return (
    <Table>
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Costo</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {items.map((item, index) => (
          <tr key={item.productId}>
            <td>{item.product.name}</td>
            <td width={200} style={{ textAlign: 'right' }}>
              {item.quantity} x
            </td>
            <td width={200} style={{ textAlign: 'right' }}>
              {currencyFormatter(item.cost)}
            </td>
            <td width={200} style={{ textAlign: 'right', fontWeight: 'bold' }}>
              {currencyFormatter(item.quantity * item.cost)}
            </td>
            <td width={200}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-end',
                  height: '100%',
                  width: '100%',
                }}
              >
                <Button
                  variant="outline"
                  color="red"
                  onClick={() => removeItem(index)}
                >
                  <IconTrash />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

const CreateEntryPage: NextPageWithLayout = () => {
  const { items, clearItems } = useNewStockEntry();

  const { mutateAsync: createEntry } = trpc.stockEntries.create.useMutation({
    onSuccess: () => {
      clearItems();
      showNotification({
        title: 'Success',
        message: 'Entrada creada',
        color: 'green',
      });
    },
    onError: (err) => {
      showNotification({
        title: 'Error',
        message: err.message,
        color: 'red',
      });
    },
  });

  return (
    <PageHeader
      title="Nueva Entrada de Stock"
      extra={[
        <Button
          key="cancel"
          variant="filled"
          color="red"
          leftIcon={<IconX />}
          disabled={items.length === 0}
          onClick={() => {
            clearItems();
          }}
        >
          Cancelar
        </Button>,
        <Button
          key="save"
          variant="filled"
          color="green"
          disabled={items.length === 0}
          leftIcon={<IconCheck />}
          onClick={() => {
            createEntry({
              items: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                cost: item.cost,
              })),
            });
          }}
        >
          Guardar
        </Button>,
      ]}
    >
      <StockEntryForm />
      <StockEntryList />
    </PageHeader>
  );
};

export default CreateEntryPage;
