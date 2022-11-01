import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { Entity } from '@prisma/client';
import React from 'react';
import { currencyFormatter, currencyParser } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';
import { documentTypeSchema, entityCreateSchema } from '~/validators/entity';

export interface Props {
  isOpen: boolean;
  onClose: () => void;
  entity?: Entity;
}

const EntityFormModal: React.FunctionComponent<Props> = ({
  isOpen,
  onClose,
  entity,
}) => {
  const trpcUtils = trpc.useContext();
  const form = useForm({
    initialValues: {
      name: entity?.name ?? '',
      documentType: entity?.documentType ?? 'RUC',
      document: entity?.document ?? '',
      cellphone: entity?.cellphone ?? '',
      address: entity?.address ?? '',
      creditLimit: entity?.creditLimit ?? 0,
    },
    validate: zodResolver(entityCreateSchema),
  });

  const { mutateAsync: createMutation, isLoading: isCreating } =
    trpc.entity.add.useMutation({
      async onSuccess() {
        await trpcUtils.entity.list.invalidate();
      },
    });

  const { mutateAsync: updateMutation, isLoading: isUpdating } =
    trpc.entity.update.useMutation({
      async onSuccess() {
        await trpcUtils.entity.list.invalidate();
        await trpcUtils.entity.byId.invalidate({ id: entity?.id ?? 0 });
      },
    });

  // get Name Input ref
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  // focus Name Input on open
  React.useEffect(() => {
    // wait for animation
    setTimeout(() => {
      if (isOpen) {
        nameInputRef.current?.focus();
      }
    }, 200);
  }, [isOpen]);

  async function handleSubmit() {
    const documentType = documentTypeSchema
      .optional()
      .parse(form.values.documentType);

    (entity ? updateMutation : createMutation)({
      id: entity?.id,
      name: form.values.name,
      documentType,
      document: form.values.document,
      cellphone: form.values.cellphone,
      address: form.values.address,
      creditLimit: form.values.creditLimit,
    })
      .then(() => {
        showNotification({
          title: entity ? 'Usuário actualizado' : 'Usuario creado',
          message: entity
            ? 'El usuario ha sido actualizado'
            : 'El usuario ha sido creado',
          color: 'green',
        });
        form.reset();
        onClose();
      })
      .catch(() => {
        showNotification({
          title: 'Error',
          message: 'No se pudo realizar la operación, intente nuevamente',
          color: 'red',
        });
      });
  }

  return (
    <Modal
      title="Formulário de Cliente"
      opened={isOpen}
      onClose={onClose}
      transition="slide-down"
      size="md"
      onKeyDown={(e) => {
        // close on escape and stops propagation
        if (e.key === 'Escape') {
          onClose();
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing={'sm'}>
          <TextInput
            ref={nameInputRef}
            label="Nombre"
            {...form.getInputProps('name')}
          />
          <TextInput
            label="Documento"
            {...form.getInputProps('document')}
            rightSection={
              <Select
                placeholder="Seleccione"
                data={[
                  { label: 'Cedula', value: 'CI' },
                  { label: 'RUC', value: 'RUC' },
                ]}
                {...form.getInputProps('documentType')}
              />
            }
            rightSectionWidth={100}
          />
          <TextInput label="Celular" {...form.getInputProps('cellphone')} />
          <TextInput label="Dirección" {...form.getInputProps('address')} />
          <NumberInput
            label="Limite de Crédito"
            parser={currencyParser}
            formatter={currencyFormatter}
            {...form.getInputProps('creditLimit')}
          />
          <Group position="right" mt="md" spacing="md">
            <Button
              onClick={() => {
                onClose();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isCreating || isUpdating}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EntityFormModal;
