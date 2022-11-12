import React, { useEffect, useState } from 'react';

export interface NoSSRProps {
   children: React.ReactNode;
}

const NoSSR: React.FunctionComponent<NoSSRProps> = ({ children }) => {
   const [mounted, setMounted] = useState(false);

   useEffect(() => {
      setMounted(true);
   }, []);

   if (!mounted) {
      return <></>;
   }

   return <>{children}</>;
};

export default NoSSR;
