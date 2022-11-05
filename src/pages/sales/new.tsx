import {
  Button,
  Text,
  CloseButton,
  Grid,
  Group,
  Modal,
  NumberInput,
  Radio,
  Stack,
  Switch,
  Table,
  TextInput,
} from '@mantine/core';
import { Entity, Product, SaleType } from '@prisma/client';
import { IconCheck, IconPlus, IconSearch } from '@tabler/icons';
import React from 'react';
import PageHeader from '~/components/molecules/PageHeader';
import { SelectEntityModal, SelectProductModal } from '~/components/organisms';
import { NextPageWithLayout } from '~/pages/_app';
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { currencyFormatter, currencyParser } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';
import { showNotification } from '@mantine/notifications';

export enum IvaEnum {
  IVA_0 = 'IVA_0',
  IVA_5 = 'IVA_5',
  IVA_10 = 'IVA_10',
}

function parseIva(iva: string): IvaEnum {
  switch (iva) {
    case 'IVA_0':
      return IvaEnum.IVA_0;
    case 'IVA_5':
      return IvaEnum.IVA_5;
    case 'IVA_10':
      return IvaEnum.IVA_10;
    default:
      throw new Error('Invalid IVA');
  }
}

interface SaleItem {
  productId: number;
  quantity: number;
  price: number;
  product: Product;
  iva: 'IVA_0' | 'IVA_5' | 'IVA_10';
}

interface AddItemFormState {
  barcode: string;
  quantity: number;
  price: number;

  product?: Product | null;
  editPriceMode: boolean;
  saleItems: SaleItem[];

  shouldFocusBarcode: boolean;

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
  setShouldFocusBarcode: (shouldFocusBarcode: boolean) => void;
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
        const existingItemIndex = prev.saleItems.findIndex(
          (i) => i.productId === item.productId,
        );

        const saleItemsCopy = [...prev.saleItems];

        if (existingItemIndex !== -1) {
          const alreadyExistingItem = saleItemsCopy[existingItemIndex];
          if (alreadyExistingItem) {
            alreadyExistingItem.quantity += item.quantity;
            saleItemsCopy[existingItemIndex] = alreadyExistingItem;
          }
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
              iva: prev.product.iva,
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
    shouldFocusBarcode: true,
    setShouldFocusBarcode: (shouldFocusBarcode) => set({ shouldFocusBarcode }),
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
    shouldFocusBarcode,
    setShouldFocusBarcode,
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
            iva: data.iva,
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
    if (barcodeInputRef.current && !product) {
      barcodeInputRef.current.focus();
    }
  }, [product]);

  // focus on barcodeInput
  React.useEffect(() => {
    if (barcodeInputRef.current && shouldFocusBarcode) {
      barcodeInputRef.current.focus();
      setShouldFocusBarcode(false);
    }
  }, [setShouldFocusBarcode, shouldFocusBarcode]);

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

interface FinishSaleModalState {
  isOpen: boolean;
  saleType: 'CASH' | 'CREDIT';
  entity: Entity | undefined;

  setSaleType: (saleType: 'CASH' | 'CREDIT') => void;
  setEntity: (entity: Entity | undefined) => void;
  setIsOpen: (isOpen: boolean) => void;
  clear: () => void;
}

const useFinishSaleModal = create<FinishSaleModalState>((set) => ({
  isOpen: false,
  saleType: 'CASH',
  entity: undefined,
  setSaleType: (saleType) => set({ saleType }),
  setEntity: (entity) => set({ entity }),
  setIsOpen: (isOpen) => set({ isOpen }),
  clear: () => set({ saleType: 'CASH', entity: undefined }),
}));

const FinishSaleModal: React.FC = () => {
  const { isOpen, saleType, entity, setSaleType, setEntity, setIsOpen, clear } =
    useFinishSaleModal();
  const [userDocument, setUserDocument] = React.useState('');
  const [openEntitySearch, setOpenEntitySearch] = React.useState(false);
  const [shouldSearchEntity, setShouldSearchEntity] = React.useState(false);
  const { refetch } = trpc.entity.byDocument.useQuery(userDocument, {
    enabled: shouldSearchEntity,
    onSuccess(data) {
      setEntity(data ?? undefined);
      setShouldSearchEntity(false);
    },
  });

  const { mutateAsync: FinishSale } = trpc.sales.create.useMutation();

  // get search client input ref
  const searchClientInputRef = React.useRef<HTMLInputElement>(null);

  // focus on search client input
  React.useEffect(() => {
    // timeout for modal animation
    setTimeout(() => {
      if (isOpen && searchClientInputRef.current) {
        searchClientInputRef.current.focus();
      }
    }, 300);
  }, [isOpen]);

  return (
    <Modal
      title="Finalizar Venta"
      opened={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();

          FinishSale({
            address: entity?.address ?? 'Troncal 3',
            entityId: entity?.id,
            document: entity?.document ?? '0000000000',
            type: saleType,
            items: useAddItemForm.getState().saleItems.map((item) => ({
              ...item,
              description: item.product.name,
              iva: parseIva(item.product.iva),
            })),
          })
            .then(() => {
              clear();
              setIsOpen(false);
              useAddItemForm.getState().clearItems();
              showNotification({
                title: 'Venta Finalizada',
                message: JSON.stringify({
                  entity,
                  saleType,
                }),
              });
            })
            .catch((err) => {
              showNotification({
                title: 'Error',
                message: err.message,
                color: 'red',
              });
            });
        }}
      >
        <Stack spacing={'lg'}>
          <TextInput
            ref={searchClientInputRef}
            label="Identificación del Cliente"
            placeholder='Ej: "Cédula" o "RUC"'
            value={
              entity && !entity.document ? 'Sin Identificación' : userDocument
            }
            onChange={(e) => {
              if (entity) {
                setEntity(undefined);
                setUserDocument('');
              } else {
                setUserDocument(e.currentTarget.value);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (userDocument.length > 0) {
                  setShouldSearchEntity(true);
                }
                e.preventDefault();
              } else if (e.key === 'F2') {
                setOpenEntitySearch(true);
                e.preventDefault();
              }
            }}
          />

          <TextInput
            label="Nombre del Cliente Selecionado"
            value={entity?.name ?? 'Cliente Ocasional'}
            disabled
          />

          <Radio.Group
            name="saleType"
            label="Tipo de Venta"
            defaultValue={SaleType.CASH}
            onChange={(value) => {
              setSaleType(value as 'CASH' | 'CREDIT');
            }}
          >
            <Radio label="Efectivo" value={SaleType.CASH} />
            <Radio label="Crédito" value={SaleType.CREDIT} />
          </Radio.Group>

          <Button
            type="submit"
            color="blue"
            rightIcon={<IconCheck />}
            disabled={!entity && saleType === SaleType.CREDIT}
            fullWidth
          >
            Finalizar Venta
          </Button>
          {/* display error message when entity is not selected and saleType is "credit" */}
          {!entity && saleType === SaleType.CREDIT && (
            <Text color="red">
              Debe seleccionar un cliente para realizar una venta a crédito
            </Text>
          )}
        </Stack>
      </form>

      <SelectEntityModal
        isOpen={openEntitySearch}
        onClose={() => {
          setOpenEntitySearch(false);
        }}
        onSelect={(entity) => {
          setEntity(entity);
          setUserDocument(entity.document ?? '');
          setOpenEntitySearch(false);
        }}
      />
    </Modal>
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

  const { isOpen: finishModalOpen, setIsOpen: setFinishModalOpen } =
    useFinishSaleModal();

  const handleFinishSale = React.useMemo(
    () => () => {
      if (saleItems.length > 0) {
        setFinishModalOpen(true);
      } else {
        showNotification({
          title: 'No se puede finalizar la venta',
          message: 'No hay productos en la venta',
          color: 'red',
        });
      }
    },
    [saleItems, setFinishModalOpen],
  );

  const hotKeys: Record<string, () => void> = React.useMemo(
    () => ({
      F2: () => setShowSearchModal(true),
      '+': () => incrementQuantity(),
      '-': () => decrementQuantity(),
      p: () => setEditPriceMode(!editPriceMode),
      P: () => setEditPriceMode(!editPriceMode),
      f: () => handleFinishSale(),
      F: () => handleFinishSale(),
    }),
    [
      incrementQuantity,
      decrementQuantity,
      setEditPriceMode,
      editPriceMode,
      handleFinishSale,
    ],
  );

  React.useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (!showSearchModal && !finishModalOpen && hotKeys[e.key]) {
        hotKeys[e.key]?.();
        e.preventDefault();
      }
    }

    document.body.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotKeys, showSearchModal, finishModalOpen]);

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
      <FinishSaleModal />
    </PageHeader>
  );
};

export default NewSalePage;
