import { useEffect, useRef } from 'react';

export const useIsMounted = () => {
  const isMounted = useRef();

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  return () => isMounted.current;
};
