export interface Props {
  isOpen: boolean;
  onClose: () => void;
  entityId: number;
}

const PaymentModal: React.FunctionComponent<Props> = ({
  isOpen,
  onClose,
  entityId,
}) => {};

export default PaymentModal;
