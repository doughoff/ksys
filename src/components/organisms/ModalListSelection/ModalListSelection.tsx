import {
   Box,
   LoadingOverlay,
   Modal,
   ModalProps,
   TextInput,
} from '@mantine/core';
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
         if (prev.items.length === 0) {
            return { selectedIndex: null };
         }

         if (prev.selectedIndex === null || prev.selectedIndex === 0) {
            return { ...prev, selectedIndex: prev.items.length - 1 };
         }
         return { ...prev, selectedIndex: prev.selectedIndex - 1 };
      });
   },
   arrowDownHandler: () => {
      set((prev) => {
         if (prev.items.length === 0) {
            return { selectedIndex: null };
         }

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
   isLoading: boolean;
   title?: string;
   size: ModalProps['size'];
   onClose: () => void;
   onSelect: (item: T) => void;
   renderItems: (
      items: T[],
      selected: number,
      setSelectedIndex: (id: number | null) => void,
   ) => React.ReactNode;
   onSearch?: (value: string) => void;
   noResults?: React.ReactNode;
   onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void | undefined;
}

export default function ModalListSelection<T>({
   isOpen,
   items,
   onClose,
   onSelect,
   renderItems,
   onSearch,
   size = 'md',
   title,
   isLoading,
   noResults,
   onKeyDown,
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
      console.log('isOpen', isOpen);
      // reset search value and selected index
      if (!isOpen) {
         setSearchValue('');
         setSelectedIndex(null);
      }
   }, [isOpen, setSearchValue, setSelectedIndex]);

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
                  onClose();
               }
            }
            break;
         case 'Escape':
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(false);
            break;
      }

      if (onKeyDown) {
         onKeyDown(e);
      }
   };

   return (
      <Modal
         title={title}
         opened={isOpen}
         onClose={() => {
            setIsOpen(false);
            onClose();
         }}
         size={size}
         onKeyDown={handleKeyDown}
      >
         <div
            className={styles.modalContent}
            onClick={(e) => {
               e.stopPropagation();
            }}
         >
            <TextInput
               ref={searchInputRef}
               placeholder="Tipea para buscar..."
               autoComplete="off"
               icon={<IconSearch />}
               value={searchValue}
               onChange={(e) => setSearchValue(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === 'ArrowUp') {
                     e.preventDefault();
                  } else if (e.key === 'ArrowDown') {
                     e.preventDefault();
                  }
               }}
            />

            <Box
               style={{
                  minHeight: '300px',
                  width: '100%',
                  marginTop: '10px',
               }}
            >
               {isLoading && <LoadingOverlay visible={isLoading} />}
               {renderItems(items, selectedIndex ?? -1, setSelectedIndex)}
               {searchValue.length === 0 && (
                  <div
                     style={{
                        textAlign: 'center',
                        marginTop: '10px',
                        color: 'gray',
                        fontSize: '18px',
                     }}
                  >
                     Tipea para buscar
                  </div>
               )}
               {searchValue.length > 0 && items.length === 0 && (
                  <div
                     style={{
                        textAlign: 'center',
                        marginTop: '10px',
                        color: 'gray',
                        fontSize: '18px',
                     }}
                  >
                     {noResults ?? 'No hay resultados'}
                  </div>
               )}
            </Box>
         </div>
      </Modal>
   );
}
