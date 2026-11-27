import { fuenteMock } from './mock';
import { fuenteStellar } from './stellar';
import type { FuenteDatos } from './tipos';

export type { FuenteDatos } from './tipos';

export const usandoMock = import.meta.env.PUBLIC_USAR_MOCK !== 'false';

export const datos: FuenteDatos = usandoMock ? fuenteMock : fuenteStellar;
