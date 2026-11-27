import { usandoMock } from '../datos';
import { usarDireccionDePrueba } from '../datos/mock';
import { emitir, escuchar } from '../eventos';
import { conectar, direccionActual } from './wallet';

function preparar(direccion: string | null): string | null {
  if (direccion && usandoMock) usarDireccionDePrueba(direccion);
  return direccion;
}

export async function conectarYAvisar(): Promise<string> {
  const direccion = await conectar();
  preparar(direccion);
  emitir('pv:wallet-cambiada', { direccion });
  return direccion;
}

export async function obtenerOConectar(): Promise<string> {
  return preparar(await direccionActual()) ?? conectarYAvisar();
}

export function alCambiarWallet(cb: (direccion: string | null) => void): void {
  direccionActual()
    .then((d) => cb(preparar(d)))
    .catch(() => cb(null));
  escuchar('pv:wallet-cambiada', ({ direccion }) => cb(preparar(direccion)));
}
