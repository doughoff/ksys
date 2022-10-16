import { TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons';
import React from 'react';
import { useEffect, useState } from 'react';

export interface DebounceSearchProps {
  ref?: React.RefObject<HTMLInputElement>;
  initialValue?: string;
  onChange: (value: string) => void;
  timing?: number;
}

const DebounceSearch = ({
  ref,
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
      ref={ref}
      label="Buscar"
      icon={<IconSearch />}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

export default DebounceSearch;
