import PageHeader from '~/components/molecules/PageHeader';
import { newStockEntryItemSchema } from '~/validators/stockEntry';
import { NextPageWithLayout } from '../_app';
import { devtools, persist } from 'zustand/middleware';
import { Box, NumberInput, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { trpc } from '~/utils/trpc';
import { useRef, useState } from 'react';
import { Product } from '@prisma/client';
import { showNotification } from '@mantine/notifications';
import create from 'zustand';

interface NewStockEntryState {
  items: {
    productId: number;
    quantity: number;
    cost: number;
    product: Product;
  }[];
  addItem: (item: {
    productId: number;
    quantity: number;
    cost: number;
    product: Product;
  }) => void;
  removeItem: (index: number) => void;
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
                  quantity: i.quantity + item.quantity,
                };
              }
              return i;
            });

            return { ...prev, items: newItems };
          }
          return { ...prev, items: [...prev.items, item] };
        }),
      removeItem: (index) =>
        set((state) => ({
          items: state.items.filter((_, i) => i !== index),
        })),
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

  const itemForm = useForm({
    initialValues: {
      quantity: 0,
      cost: 0,
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
    <Box>
      <TextInput
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

      <TextInput label="Product Name" value={product?.name || ''} disabled />
      <form onSubmit={itemForm.onSubmit(handleSubmit)}>
        <NumberInput
          ref={quantityInputRef}
          label="Cantidad"
          {...itemForm.getInputProps('quantity')}
        />
        <NumberInput label="Costo" {...itemForm.getInputProps('cost')} />
        <button type="submit" disabled={!product}>
          Adicionar
        </button>
      </form>
    </Box>
  );
};

const StockEntryList = () => {
  const { items, removeItem } = useNewStockEntry();
  return (
    <Box>
      {items.map((item, index) => (
        <Box key={index}>
          <Box>{item.product.name}</Box>
          <Box>{item.quantity}</Box>
          <Box>{item.cost}</Box>
          <button onClick={() => removeItem(index)}>Remove</button>
        </Box>
      ))}
    </Box>
  );
};

const CreateEntryPage: NextPageWithLayout = () => {
  return (
    <PageHeader title="Nueva Entrada de Stock">
      <StockEntryForm />
      <StockEntryList />
    </PageHeader>
  );
};

export default CreateEntryPage;
