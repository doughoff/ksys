import { useState } from 'react';
import useBearStore from '~/stores/bearStore';

const BearControls = () => {
  const [name, setName] = useState<string>();
  const { addBear, removeAllBears } = useBearStore();

  return (
    <div>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <br />
      <button onClick={() => name && addBear(name)}>Add Bear</button>
      <br />
      <button onClick={() => removeAllBears()}>Remove All Bears</button>
    </div>
  );
};

export default BearControls;
