import { Box, Avatar, Text, Table, Button } from '@mantine/core';
import { Entity } from '@prisma/client';
import { IconPlus } from '@tabler/icons';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React from 'react';
import EntityFormModal from '~/components/forms/EntityFormModal';
import { trpc } from '~/utils/trpc';
import { ModalListSelection } from '../ModalListSelection';

import styles from './SelectEntityModal.module.css';

export interface SelectEntityModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSelect: (client: Entity) => void;
}

export default function SelectEntityModal({
   isOpen,
   onClose,
   onSelect,
}: SelectEntityModalProps) {
   const [text, setText] = React.useState('');
   const [createModal, setCreateModal] = React.useState(false);
   const { data, isInitialLoading } = trpc.entity.list.useQuery(
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
         title="Buscar cliente"
         size="lg"
         isOpen={isOpen}
         items={data?.items ?? []}
         onClose={onClose}
         onSearch={setText}
         onSelect={onSelect}
         isLoading={isInitialLoading}
         onKeyDown={(e) => {
            // F5 to create new Entity
            if (e.key === 'F5') {
               e.preventDefault();
               e.stopPropagation();
               setCreateModal(true);
            }

            // close on escape and stops propagation
            if (e.key === 'Escape') {
               setText('');
               onClose();
               e.preventDefault();
               e.stopPropagation();
            }
         }}
         renderItems={(items, selected, setSelectedIndex) => (
            <Table>
               <thead>
                  <tr>
                     <th>Cod.Interno</th>
                     <th>Nombre</th>
                     <th>Documento</th>
                  </tr>
               </thead>
               <tbody>
                  {items.map((item, index) => (
                     <tr
                        key={item.id}
                        className={index === selected ? styles.active : ''}
                        onClick={() => setSelectedIndex(index)}
                        style={{
                           cursor: 'pointer',
                           // disable text selection
                           userSelect: 'none',
                        }}
                     >
                        <td width={100}>{item.id}</td>
                        <td>{item.name}</td>
                        <td width={150}>
                           {item.documentType}:{item.document}
                        </td>
                     </tr>
                  ))}
               </tbody>

               <EntityFormModal
                  isOpen={createModal}
                  onClose={() => setCreateModal(false)}
               />
            </Table>
         )}
         noResults={
            <Box
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  height: '100%',
               }}
            >
               <Text>No se encontraron resultados</Text>
               <Text>
                  Pressiona F5 para <IconPlus size={15} /> Adicionar Cliente
               </Text>
            </Box>
         }
      />
   );
}
