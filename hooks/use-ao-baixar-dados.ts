import { useEffect, useRef } from 'react';

import { aoBaixarDados } from '@/services/baixarDados';

export function useAoBaixarDados(recarregar: () => void): void {
  const ref = useRef(recarregar);

  useEffect(() => {
    ref.current = recarregar;
  });

  useEffect(() => aoBaixarDados(() => ref.current()), []);
}
