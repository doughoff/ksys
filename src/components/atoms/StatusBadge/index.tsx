import { Badge } from '@mantine/core';

export interface Props {
  status: 'ACTIVE' | 'DELETED';
}

const StatusBadge: React.FunctionComponent<Props> = ({ status }) => {
  const isActive = status === 'ACTIVE';

  return (
    <Badge color={isActive ? 'green' : 'red'} variant="filled">
      {isActive ? 'Activo' : 'Desactivado'}
    </Badge>
  );
};

export default StatusBadge;
