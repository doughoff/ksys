import { Modal, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import React from 'react';
import create from 'zustand';

import styles from './ModalListSelection.module.css';

export interface ModalListSelectionState<T> {
  isOpen: boolean;
  searchValue: string;
  selectedIndex: number | null;
  items: T[];
  setIsOpen: (isOpen: boolean) => void;
  setItems: (items: T[]) => void;
  setSearchValue: (value: string) => void;
  setSelectedIndex: (id: number | null) => void;
  arrowUpHandler: () => void;
  arrowDownHandler: () => void;
}

export const useModalListSelectionStore = create<
  ModalListSelectionState<any>
>()((set) => ({
  searchValue: '',
  items: [],
  selectedIndex: null,
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
  setSearchValue: (value) => set({ searchValue: value }),
  setSelectedIndex: (id) => set({ selectedIndex: id }),
  setItems: (items) => set({ items }),
  arrowUpHandler: () => {
    set((prev) => {
      if (prev.selectedIndex === null || prev.selectedIndex === 0) {
        return { ...prev, selectedIndex: prev.items.length - 1 };
      }
      return { ...prev, selectedIndex: prev.selectedIndex - 1 };
    });
  },
  arrowDownHandler: () => {
    set((prev) => {
      if (
        prev.selectedIndex === null ||
        prev.selectedIndex === prev.items.length - 1
      ) {
        return { ...prev, selectedIndex: 0 };
      }
      return { ...prev, selectedIndex: prev.selectedIndex + 1 };
    });
  },
}));

export interface ModalListSelectionProps<T> {
  isOpen: boolean;
  items: T[];
  onClose: () => void;
  onSelect: (item: T) => void;
  renderItem: (item: T) => React.ReactNode;
  onSearch?: (value: string) => void;
}

export default function ModalListSelection<T>({
  isOpen,
  items,
  onClose,
  onSelect,
  renderItem,
  onSearch,
}: ModalListSelectionProps<T>) {
  const {
    searchValue,
    selectedIndex,
    setSearchValue,
    setSelectedIndex,
    setItems,
    setIsOpen,
  } = useModalListSelectionStore();

  const arrowUpHandler = useModalListSelectionStore(
    (state) => state.arrowUpHandler,
  );
  const arrowDownHandler = useModalListSelectionStore(
    (state) => state.arrowDownHandler,
  );

  //get searchInput ref
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // focus search input on open
  React.useEffect(() => {
    if (isOpen) {
      //timeout for animation
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // debounce SearchValue and call onSearch
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (onSearch) {
        onSearch(searchValue);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [onSearch, searchValue]);

  React.useEffect(() => {
    setItems(items);
  }, [items, setItems]);

  React.useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen, setIsOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(e.key);
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        arrowUpHandler();
        break;
      case 'ArrowDown':
        e.preventDefault();
        arrowDownHandler();
        break;
      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (isOpen) {
          const selected = items[selectedIndex ?? -1];
          if (selected) {
            onSelect(selected);
            setIsOpen(false);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        break;
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={() => {
        setIsOpen(false);
        onClose();
      }}
    >
      <div
        className={styles.modalContent}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <TextInput
          ref={searchInputRef}
          label="Buscar"
          icon={<IconSearch />}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li
              key={index}
              className={index === selectedIndex ? styles.selected : ''}
              onClick={() => {
                setSelectedIndex(index);
              }}
            >
              {renderItem(item)}
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
