import {
  Button,
  CloseButton,
  Grid,
  Group,
  NumberInput,
  Stack,
  Switch,
  Table,
  TextInput,
} from '@mantine/core';
import { Product } from '@prisma/client';
import { IconPlus, IconSearch, IconTrash } from '@tabler/icons';
import React, { KeyboardEvent } from 'react';
import PageHeader from '~/components/molecules/PageHeader';
import { SelectEntityModal, SelectProductModal } from '~/components/organisms';
import { NextPageWithLayout } from '~/pages/_app';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { currencyFormatter, currencyParser } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';
import { showNotification } from '@mantine/notifications';

interface SaleItem {
  productId: number;
  quantity: number;
  price: number;
  product: Product;
}

interface AddItemFormState {
  barcode: string;
  quantity: number;
  price: number;

  product?: Product | null;

  editPriceMode: boolean;

  saleItems: SaleItem[];

  incrementQuantity: () => void;
  decrementQuantity: () => void;
  setQuantity: (quantity: number) => void;
  setPrice: (cost: number) => void;
  setBarcode: (barcode: string) => void;
  setProduct: (product?: Product | null) => void;
  setEditPriceMode: (editPriceMode: boolean) => void;
  addItem: (item: SaleItem) => void;
  removeItem: (index: number) => void;
  clearItems: () => void;
  pushItem: () => void;
}

const useAddItemForm = create<AddItemFormState>()(
  persist((set) => ({
    barcode: '',
    quantity: 1,
    price: 0,
    editPriceMode: false,
    saleItems: [],
    incrementQuantity: () => set((prev) => ({ quantity: prev.quantity + 1 })),
    decrementQuantity: () =>
      set((prev) => ({
        quantity: prev.quantity > 1 ? prev.quantity - 1 : prev.quantity,
      })),
    setQuantity: (quantity) => set({ quantity }),
    setPrice: (cost) => set({ price: cost }),
    setBarcode: (barcode) => set({ barcode, product: undefined, price: 0 }),
    setProduct: (product) =>
      set({
        product,
        barcode: product?.barcode ?? '',
        price: product?.price ?? 0,
      }),
    setEditPriceMode: (editPriceMode) => set({ editPriceMode }),
    addItem: (item) =>
      set((prev) => {
        const existingItem = prev.saleItems.find(
          (i) => i.productId === item.productId,
        );

        let saleItemsCopy = [...prev.saleItems];

        if (existingItem && existingItem.price === item.price) {
          saleItemsCopy = prev.saleItems.map((i) => {
            if (i.productId === item.productId && i.price === item.price) {
              return { ...i, quantity: i.quantity + item.quantity };
            }
            return i;
          });
        } else {
          saleItemsCopy.unshift(item);
        }

        return {
          ...prev,
          saleItems: saleItemsCopy,
          barcode: '',
          quantity: 1,
          price: 0,
        };
      }),
    removeItem: (index) =>
      set((prev) => ({
        saleItems: prev.saleItems.filter((_, i) => i !== index),
      })),
    clearItems: () => set({ saleItems: [] }),
    pushItem: () =>
      set((prev) => {
        if (prev.product) {
          const saleItemsCopy = [...prev.saleItems];
          const productAlreadyAddedIndex = prev.saleItems.findIndex(
            (i) => i.productId === prev.product?.id && i.price === prev.price,
          );

          if (productAlreadyAddedIndex !== -1) {
            const alreadyAddedCopy = saleItemsCopy[productAlreadyAddedIndex];
            if (alreadyAddedCopy) {
              alreadyAddedCopy.quantity += prev.quantity;
              saleItemsCopy[productAlreadyAddedIndex] = alreadyAddedCopy;
            }
          } else {
            saleItemsCopy.unshift({
              productId: prev.product.id,
              quantity: prev.quantity,
              price: prev.price,
              product: prev.product,
            });
          }

          return {
            saleItems: saleItemsCopy,
            barcode: '',
            quantity: 1,
            price: 0,
            product: undefined,
          };
        }
        return prev;
      }),
  })),
);

const AddItemForm: React.FC = () => {
  const {
    barcode,
    quantity,
    price,
    product,
    setQuantity,
    setPrice,
    setBarcode,
    setProduct,
    editPriceMode,
    addItem,
    pushItem,
  } = useAddItemForm();

  const priceInputRef = React.useRef<HTMLInputElement>(null);
  const barcodeInputRef = React.useRef<HTMLInputElement>(null);

  const [focusOnPrice, setFocusOnPrice] = React.useState(false);
  const [searchByBarcode, setSearchByBarcode] = React.useState(false);
  const { isInitialLoading } = trpc.products.byBarcode.useQuery(
    { barcode },
    {
      enabled: searchByBarcode,
      onSuccess: (data) => {
        if (!editPriceMode && data) {
          addItem({
            productId: data.id,
            quantity,
            price: data.price,
            product: data,
          });
          //focus on barcode Input
          barcodeInputRef.current?.focus();
        } else {
          setProduct(data);
          // focus on priceInput
          if (data) {
            setFocusOnPrice(true);
          } else if (barcode.length > 0) {
            showNotification({
              title: 'Producto no encontrado',
              message: 'El producto no existe en la base de datos',
              color: 'red',
            });
          }
        }
        setSearchByBarcode(false);
      },
    },
  );

  // focus on price
  React.useEffect(() => {
    if (priceInputRef && focusOnPrice) {
      priceInputRef.current?.focus();
      setFocusOnPrice(false);
    }
  }, [focusOnPrice]);

  // focus on barcodeInput
  React.useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  return (
    <Grid
      style={{
        width: '100%',
        alignItems: 'end',
      }}
    >
      <Grid.Col span={3}>
        <TextInput
          ref={barcodeInputRef}
          label="Cod. Barras"
          width={'100%'}
          value={barcode}
          onChange={(e) => setBarcode(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setSearchByBarcode(true);
            }
          }}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <TextInput
          label="Producto"
          style={{ width: '100%' }}
          disabled
          value={isInitialLoading ? 'Cargando...' : product?.name ?? ''}
        />
      </Grid.Col>

      <Grid.Col span={2}>
        <NumberInput
          label="Cantidad"
          value={quantity}
          onChange={(value) => {
            setQuantity(value ?? 1);
          }}
          disabled
        />
      </Grid.Col>

      <Grid.Col span={2}>
        <NumberInput
          ref={priceInputRef}
          label="Precio"
          style={{ width: '100%' }}
          value={price}
          onChange={(value) => {
            setPrice(value ?? 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              pushItem();
            }
          }}
          disabled={!editPriceMode}
        />
      </Grid.Col>

      <Grid.Col span={2}>
        {/* full width */}
        <Button
          variant="outline"
          color="blue"
          rightIcon={<IconPlus />}
          fullWidth
          disabled={!product}
          onClick={() => {
            pushItem();
          }}
        >
          Adicionar
        </Button>
      </Grid.Col>
    </Grid>
  );
};

const NewSalePage: NextPageWithLayout = () => {
  const [showSearchModal, setShowSearchModal] = React.useState(false);
  const {
    incrementQuantity,
    decrementQuantity,
    setProduct,
    editPriceMode,
    setEditPriceMode,
    saleItems,
    removeItem,
  } = useAddItemForm();

  const hotKeys: Record<string, () => void> = React.useMemo(
    () => ({
      F2: () => setShowSearchModal(true),
      '+': () => incrementQuantity(),
      '-': () => decrementQuantity(),
      p: () => setEditPriceMode(!editPriceMode),
      P: () => setEditPriceMode(!editPriceMode),
    }),
    [incrementQuantity, decrementQuantity, setEditPriceMode, editPriceMode],
  );

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
      onKeyDown={(e) => {
        console.log(e.key);
        const handler = hotKeys[e.key];
        if (handler) {
          e.preventDefault();
          handler();
        }
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100px',
          }}
        >
          <AddItemForm />
        </div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            flex: 'grow',
            height: '100%',
            alignItems: 'start',
          }}
        >
          <Table>
            <thead>
              <tr>
                <th>Cod. Barras</th>
                <th>Producto</th>
                <th style={{ textAlign: 'right' }}>Cantidad</th>
                <th style={{ textAlign: 'right' }}>Precio</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {saleItems.map((item, index) => (
                <tr key={`${item.product?.id}${item.product?.price}`}>
                  <td width={120}>{item.product?.barcode}</td>
                  <td>{item.product?.name}</td>
                  <td
                    width={100}
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    width={150}
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    {currencyFormatter(item.price)}
                  </td>
                  <td
                    width={150}
                    style={{
                      textAlign: 'right',
                    }}
                  >
                    {currencyFormatter(item.price * item.quantity)}
                  </td>
                  <td width={50}>
                    <CloseButton
                      color={'red'}
                      onClick={() => {
                        removeItem(index);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100px',
          }}
        >
          {/* Display EditPrice mode Information */}
          <Group>
            <Switch
              label="Edición de Precio"
              checked={editPriceMode}
              onChange={(e) => setEditPriceMode(e.currentTarget.checked)}
            />
          </Group>
        </div>
      </div>
      <SelectProductModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelect={(product) => {
          setProduct(product);
        }}
      />
    </PageHeader>
  );
};

export default NewSalePage;
