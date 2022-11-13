import { Button, Group, Modal, NumberInput, Stack } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import React from 'react';
import { z } from 'zod';
import { currencyFormatter, currencyParser } from '~/utils/formatters';
import { trpc } from '~/utils/trpc';

export interface Props {
   isOpen: boolean;
   onClose: () => void;
   entityId: number;
}

const PaymentModal: React.FunctionComponent<Props> = ({
   isOpen,
   onClose,
   entityId,
}) => {
   const trpcUtils = trpc.useContext();
   const form = useForm({
      initialValues: {
         amount: 0,
      },
      validate: zodResolver(
         z.object({
            amount: z.number().min(1),
         }),
      ),
   });

   const { mutateAsync, isLoading } = trpc.payments.create.useMutation({
      async onSuccess() {
         await trpcUtils.entity.byId.invalidate({ id: entityId });
         await trpcUtils.payments.byId.invalidate({ id: entityId });
         await trpcUtils.payments.list.invalidate();
      },
   });

   async function handleSubmit() {
      mutateAsync({ ...form.values, entityId })
         .then(() => {
            form.reset();
            onClose();
         })
         .catch((err) => {
            showNotification({
               title: 'Error',
               message: err?.message ?? 'Error al crear el pago',
               color: 'red',
            });
         });
   }

   const amountInputRef = React.useRef<HTMLInputElement>(null);
   // focus amount Input on open
   React.useEffect(() => {
      // wait for animation
      setTimeout(() => {
         if (isOpen) {
            amountInputRef.current?.focus();
         }
      }, 200);
   }, [isOpen]);

   return (
      <Modal
         title="Realizar Pago"
         opened={isOpen}
         onClose={onClose}
         transition="slide-down"
         size={'sm'}
      >
         <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
               <NumberInput
                  ref={amountInputRef}
                  label="Monto"
                  parser={currencyParser}
                  formatter={currencyFormatter}
                  {...form.getInputProps('amount')}
               />

               <Group position="right" mt="md" spacing="md">
                  <Button
                     color={'red'}
                     onClick={() => {
                        onClose();
                     }}
                  >
                     Cancelar
                  </Button>

                  <Button type="submit" loading={isLoading}>
                     Realizar Pago
                  </Button>
               </Group>
            </Stack>
         </form>
      </Modal>
   );
};

export default PaymentModal;
