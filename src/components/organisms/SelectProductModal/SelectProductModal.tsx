import { Box, clsx, LoadingOverlay, Modal, TextInput } from '@mantine/core';
import { Product } from '@prisma/client';
import React from 'react';
import { trpc } from '~/utils/trpc';
import create from 'zustand';
import styles from './SelectProductModal.module.css';

interface SelectProductModalState {
  isOpen: boolean;
  searchValue: string;
  selectedIndex: number | null;
  products: Product[];
  setIsOpen: (isOpen: boolean) => void;
  setProducts: (products: Product[]) => void;
  setSearchValue: (value: string) => void;
  setSelectedIndex: (id: number | null) => void;
  arrowUpHandler: () => void;
  arrowDownHandler: () => void;
}

const useSelectModalStore = create<SelectProductModalState>()((set) => ({
  searchValue: '',
  products: [],
  selectedIndex: null,
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  setSearchValue: (value) => set({ searchValue: value }),
  setSelectedIndex: (id) => set({ selectedIndex: id }),
  setProducts: (products) => set({ products }),
  arrowUpHandler: () => {
    set((prev) => {
      if (prev.selectedIndex === null || prev.selectedIndex === 0) {
        return { ...prev, selectedIndex: prev.products.length - 1 };
      }
      return { ...prev, selectedIndex: prev.selectedIndex - 1 };
    });
  },
  arrowDownHandler: () => {
    set((prev) => {
      if (
        prev.selectedIndex === null ||
        prev.selectedIndex === prev.products.length - 1
      ) {
        return { ...prev, selectedIndex: 0 };
      }
      return { ...prev, selectedIndex: prev.selectedIndex + 1 };
    });
  },
}));

export interface SelectProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (product: Product) => void;
}

const ProductModalSearch = () => {
  const setSearchValue = useSelectModalStore((state) => state.setSearchValue);
  const [text, setText] = React.useState('');
  const isOpen = useSelectModalStore((state) => state.isOpen);

  // get search ref
  const searchRef = React.useRef<HTMLInputElement>(null);
  // focus search input on open
  React.useEffect(() => {
    if (
      isOpen &&
      searchRef.current !== null &&
      searchRef.current !== undefined &&
      searchRef.current !== document.activeElement // don't focus if already focused
    ) {
      // timeout for animation
      setTimeout(() => {
        searchRef.current?.focus();
      }, 200);
    }
  }, [isOpen]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchValue(text);
    }, 300);
    return () => clearTimeout(timeout);
  }, [text, setSearchValue]);

  return (
    <TextInput
      ref={searchRef}
      label="Buscar"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        // prevent arrowDown and arrowUp
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
        }
      }}
    />
  );
};

const ProductModalItems = () => {
  const products = useSelectModalStore((state) => state.products);
  const index = useSelectModalStore((state) => state.selectedIndex);
  const setIndex = useSelectModalStore((state) => state.setSelectedIndex);

  return (
    <div
      style={{
        minHeight: '300px',
        overflowY: 'auto',
      }}
    >
      {products.map((product, i) => (
        <Box
          key={product.id}
          className={clsx({
            [styles.active ?? '']: index === i,
          })}
          onClick={() => setIndex(i)}
          style={{
            padding: '10px',
            cursor: 'pointer',
          }}
        >
          {product.name}
        </Box>
      ))}
    </div>
  );
};

const SelectProductModal: React.FunctionComponent<SelectProductModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const searchValue = useSelectModalStore((state) => state.searchValue);
  const setProducts = useSelectModalStore((state) => state.setProducts);
  const setSelectIndex = useSelectModalStore((state) => state.setSelectedIndex);
  const setIsOpen = useSelectModalStore((state) => state.setIsOpen);
  const arrowUpHandler = useSelectModalStore((state) => state.arrowUpHandler);
  const arrowDownHandler = useSelectModalStore(
    (state) => state.arrowDownHandler,
  );

  React.useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen, setIsOpen]);

  // get search ref
  const { isInitialLoading } = trpc.products.list.useQuery(
    {
      pagination: {
        page: 1,
        pageSize: 10,
      },
      text: searchValue,
    },
    {
      enabled: searchValue.length > 0,
      onSuccess(data) {
        setSelectIndex(null);
        setProducts(data.items);
      },
      onError() {
        setSelectIndex(null);
        setProducts([]);
      },
    },
  );

  React.useEffect(() => {
    if (searchValue.length === 0) {
      setProducts([]);
    }
  }, [searchValue, setProducts]);

  return (
    <Modal
      title="Buscar Producto"
      opened={isOpen}
      onClose={onClose}
      transition="slide-down"
      onKeyDown={(e) => {
        // log keys
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'ArrowUp') {
          arrowUpHandler();
        } else if (e.key === 'ArrowDown') {
          arrowDownHandler();
        }
      }}
    >
      <ProductModalSearch />
      <LoadingOverlay visible={isInitialLoading} />
      <ProductModalItems />
    </Modal>
  );
};

export default SelectProductModal;
