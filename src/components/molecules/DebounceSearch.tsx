import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import { useEffect, useState } from 'react';

interface DebounceSearchProps {
  initialValue?: string;
  onChange: (value: string) => void;
  timing?: number;
}

const DebounceSearch = ({
  initialValue = '',
  onChange,
  timing = 300,
}: DebounceSearchProps) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, timing);
    return () => clearTimeout(timeout);
  }, [onChange, timing, value]);

  return (
    <TextInput
      label="Buscar"
      icon={<IconSearch />}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default DebounceSearch;
