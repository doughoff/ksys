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
import { trpc } from '~/utils/trpc';
import { documentTypeSchema, entityCreateSchema } from '~/validators/entity';

export interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EntityFormModal: React.FunctionComponent<Props> = ({
  isOpen,
  onClose,
}) => {
  const trpcUtils = trpc.useContext();
  const form = useForm({
    initialValues: {
      name: '',
      documentType: 'RUC',
      document: '',
      cellphone: '',
      address: '',
      creditLimit: 0,
    },
    validate: zodResolver(entityCreateSchema),
  });

  const { mutateAsync, isLoading } = trpc.entity.add.useMutation({
    async onSuccess() {
      await trpcUtils.entity.list.invalidate();
    },
  });

  async function handleSubmit() {
    const documentType = documentTypeSchema
      .optional()
      .parse(form.values.documentType);
    mutateAsync({
      ...form.values,
      documentType,
    })
      .then(() => {
        showNotification({
          title: 'Cliente agregado',
          message: 'Cliente agregado correctamente',
          color: 'green',
        });
        form.reset();
        onClose();
      })
      .catch((err) => {
        showNotification({
          title: 'Error',
          message: 'No se pudo agregar el cliente, intente nuevamente',
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
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing={'sm'}>
          <TextInput label="Nombre" {...form.getInputProps('name')} />
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
          {/* 
						TODO:  Create parsers and formatters for currency  
						https://mantine.dev/core/number-input/#currency 
					*/}
          <NumberInput
            label="Limite de Crédito"
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
            <Button type="submit" loading={isLoading}>
              Guardar
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default EntityFormModal;
