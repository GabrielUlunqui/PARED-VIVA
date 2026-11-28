/**
 * Sesión del panel de administración: clave en tiempo constante, token aleatorio
 * en memoria del servidor (expira 8 h), cookie httpOnly sameSite=strict.
 */
import { randomBytes, timingSafeEqual } from 'node:crypto';

export const DURACION_SESION_MS = 8 * 60 * 60 * 1000;
export const NOMBRE_COOKIE = 'pv_admin';

interface Sesion {
  expira: number;
}

const sesiones = new Map<string, Sesion>();

// Rate limit del login: 10 intentos por hora por IP.
const VENTANA_MS = 60 * 60 * 1000;
const MAX_INTENTOS = 10;
const intentos = new Map<string, number[]>();

export function loginLimitado(ip: string): boolean {
  const ahora = Date.now();
  const lista = (intentos.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  const superado = lista.length >= MAX_INTENTOS;
  if (!superado) lista.push(ahora);
  intentos.set(ip, lista);
  return superado;
}

/** Comparación en tiempo constante; clave incorrecta o ausente devuelve false. */
export function claveCorrecta(claveIngresada: string, claveReal: string): boolean {
  if (!claveIngresada || !claveReal) return false;
  const a = Buffer.from(claveIngresada);
  const b = Buffer.from(claveReal);
  if (a.length !== b.length) {
    // timingSafeEqual exige igual largo: comparar consigo mismo para no filtrar el largo.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export function crearSesion(): string {
  const token = randomBytes(32).toString('hex');
  sesiones.set(token, { expira: Date.now() + DURACION_SESION_MS });
  // limpieza oportunista de sesiones vencidas
  const ahora = Date.now();
  for (const [t, s] of sesiones) if (s.expira <= ahora) sesiones.delete(t);
  return token;
}

export function cerrarSesion(token: string): void {
  sesiones.delete(token);
}

export function tokenDePeticion(request: Request): string | null {
  const encabezado = request.headers.get('cookie') ?? '';
  for (const parte of encabezado.split(';')) {
    const [nombre, ...resto] = parte.trim().split('=');
    if (nombre === NOMBRE_COOKIE) return resto.join('=') || null;
  }
  return null;
}

export function sesionValida(request: Request): boolean {
  const token = tokenDePeticion(request);
  if (!token) return false;
  const sesion = sesiones.get(token);
  if (!sesion) return false;
  if (sesion.expira <= Date.now()) {
    sesiones.delete(token);
    return false;
  }
  return true;
}

export function cookieDeSesion(token: string): string {
  return `${NOMBRE_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${DURACION_SESION_MS / 1000}`;
}

export function cookieDeCierre(): string {
  return `${NOMBRE_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

/**
 * Desafíos de un solo uso para entrar con billetera: el servidor propone un texto
 * aleatorio, la billetera lo firma y el login lo consume. Expiran en 2 minutos.
 */
const DURACION_DESAFIO_MS = 2 * 60 * 1000;

interface Desafio {
  expira: number;
}

const desafios = new Map<string, Desafio>();

export function crearDesafio(host: string): string {
  const nonce = randomBytes(16).toString('hex');
  const texto = `Pared Viva admin · ${host} · ${nonce} · ${new Date().toISOString()}`;
  desafios.set(texto, { expira: Date.now() + DURACION_DESAFIO_MS });
  // limpieza oportunista de desafíos vencidos
  const ahora = Date.now();
  for (const [t, d] of desafios) if (d.expira <= ahora) desafios.delete(t);
  return texto;
}

/** Desafíos activos (no vencidos), para verificar una firma contra cada uno. */
export function desafiosActivos(): string[] {
  const ahora = Date.now();
  const activos: string[] = [];
  for (const [texto, d] of desafios) {
    if (d.expira <= ahora) desafios.delete(texto);
    else activos.push(texto);
  }
  return activos;
}

/** Consume un desafío una vez usado con éxito: no se puede reutilizar. */
export function consumirDesafio(texto: string): void {
  desafios.delete(texto);
}
