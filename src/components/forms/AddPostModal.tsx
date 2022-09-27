import { Button, Group, Modal, TextInput } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons';
import { z } from 'zod';
import { trpc } from '~/utils/trpc';

export interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const postSchema = z.object({
  title: z.string().min(3).max(50),
  text: z.string().min(8).max(1000),
});

const AddPostModal: React.FunctionComponent<Props> = ({ isOpen, onClose }) => {
  const trpcUtils = trpc.useContext();
  const form = useForm({
    initialValues: {
      title: '',
      text: '',
    },
    validate: zodResolver(postSchema),
  });

  const { mutateAsync, error, isLoading, isSuccess } =
    trpc.post.add.useMutation({
      async onSuccess() {
        await trpcUtils.post.list.invalidate();
      },
    });

  async function handleSubmit() {
    await mutateAsync(form.values);

    if (!error && isSuccess) {
      showNotification({
        title: 'Post added',
        message: 'Post has been added successfully',
        color: 'green',
        icon: <IconCheck />,
      });
      form.reset();
      onClose();
    } else {
      showNotification({
        title: 'Error',
        message: 'Something went wrong',
        color: 'red',
      });
    }
  }

  return (
    <Modal
      title="Add post"
      opened={isOpen}
      onClose={onClose}
      transition="slide-down"
      size="sm"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <TextInput label="Title" {...form.getInputProps('title')} />
        <TextInput label="Text" {...form.getInputProps('text')} />
        <Group position="right" mt="md">
          <Button type="submit" loading={isLoading}>
            Add
          </Button>
        </Group>
      </form>
    </Modal>
  );
};
export default AddPostModal;
