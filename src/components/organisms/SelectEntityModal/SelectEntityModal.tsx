import { Box, Avatar, Text } from '@mantine/core';
import { Entity } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import React from 'react';
import { trpc } from '~/utils/trpc';
import { ModalListSelection } from '../ModalListSelection';

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
  const { data, isLoading } = trpc.entity.list.useQuery(
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

  React.useEffect(() => {
    console.log({
      data,
      isLoading,
      text,
    });
  });

  return (
    <ModalListSelection
      isOpen={isOpen}
      items={data?.items ?? []}
      onClose={onClose}
      onSearch={setText}
      onSelect={onSelect}
      renderItem={(client) => (
        <Box>
          <Text>{client.name}</Text>
        </Box>
      )}
    />
  );
}
