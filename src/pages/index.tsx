import { Title } from '@mantine/core';
import { useState } from 'react';
import useBearStore from '~/stores/bearStore';
import { NextPageWithLayout } from './_app';

const IndexPage: NextPageWithLayout = () => {
   const [name, setName] = useState<string>();
   const bearStore = useBearStore();

   return (
      <>
         <Title>Home Page</Title>
         <input value={name} onChange={(e) => setName(e.target.value)} />
         <br />
         <button onClick={() => name && bearStore.addBear(name)}>
            Add Bear
         </button>
         <br />
         <button onClick={() => bearStore.removeAllBears()}>Remove Bear</button>
         <ul>
            {bearStore.bears.map((bear) => (
               <li key={bear.id}>{bear.name}</li>
            ))}
         </ul>
      </>
   );
};

export default IndexPage;
