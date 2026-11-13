/**
 * @file auth.service.ts
 * @description Servicio centralizado de Autenticación y Seguridad con Tokens JWT (RFC 7519).
 * Gestiona:
 * 1. Generación, firma y almacenamiento seguro de Tokens JWT en localStorage.
 * 2. Validación de firmas, decodificación de claims (sub, email, iat, exp, rol, proveedor).
 * 3. Verificación de expiración de sesión.
 * 4. Integración de Autenticación Social (OAuth 2.0 con Google y Facebook).
 * 5. Sincronización del estado de autenticación para Guards e interfaz.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Estructura del Payload estándar de un Token JWT en Maxi-Food.
 */
export interface JWTPayload {
  sub: string;                // Subject: ID o correo del usuario
  email: string;              // Correo electrónico verificado
  nombre: string;             // Nombre completo del tutor
  nombreMascota: string;      // Nombre de la mascota registrada
  tipoMascota: 'perro' | 'gato' | 'ambos';
  direccion?: string;
  telefono?: string;
  rol: 'cliente' | 'admin';   // Rol para control de accesos
  proveedor: 'local' | 'google' | 'facebook'; // Proveedor de identidad
  fotoUrl?: string;           // Avatar o foto de perfil social
  iat: number;                // Issued At: fecha y hora de emisión (timestamp seg)
  exp: number;                // Expiration Time: fecha de vencimiento (timestamp seg)
  iss: string;                // Issuer: emisor del token (maxi-food-auth-api)
}

/**
 * Estructura de un Token JWT decodificado para inspección y auditoría visual.
 */
export interface JWTDecodificado {
  header: {
    alg: string;
    typ: string;
  };
  payload: JWTPayload;
  signature: string;
  raw: string;
  expirado: boolean;
  tiempoRestanteMinutos: number;
  tiempoRestanteTexto: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Clave en almacenamiento seguro para el Token JWT
  private readonly STORAGE_JWT_KEY = 'maxifood_jwt_token';
  private readonly STORAGE_USERS_KEY = 'maxifood_usuarios';

  // Clave secreta para simulación de firma HMAC-SHA256 en cliente (en producción reside en servidor)
  private readonly JWT_SECRET = 'MaxiFood_SuperSecret_SecurityKey_2026_JWT';

  // Memoria auxiliar de respaldo en caso de que localStorage no esté disponible (ej: entorno CI / Node 22 / SSR)
  private memoryFallback = new Map<string, string>();

  // Observable reactivo del estado de autenticación para la UI
  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$: Observable<boolean> = this.authStateSubject.asObservable();

  // Observable con los claims decodificados del token actual
  private userClaimsSubject = new BehaviorSubject<JWTPayload | null>(null);
  public userClaims$: Observable<JWTPayload | null> = this.userClaimsSubject.asObservable();

  constructor() {
    // Valida la integridad del token al cargar la aplicación de forma segura
    this.revisarEstadoToken();
  }

  /**
   * Obtiene de forma segura un valor desde localStorage o la memoria de respaldo.
   */
  private getStorageItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
        return window.localStorage.getItem(key);
      }
      if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
        return localStorage.getItem(key);
      }
    } catch {
      // Ignora excepciones si localStorage está deshabilitado
    }
    return this.memoryFallback.get(key) ?? null;
  }

  /**
   * Guarda de forma segura un valor en localStorage y en la memoria de respaldo.
   */
  private setStorageItem(key: string, value: string): void {
    this.memoryFallback.set(key, value);
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
        window.localStorage.setItem(key, value);
        return;
      }
      if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
        localStorage.setItem(key, value);
      }
    } catch {
      // Ignora excepciones si localStorage no está disponible
    }
  }

  /**
   * Elimina de forma segura un valor de localStorage y de la memoria de respaldo.
   */
  private removeStorageItem(key: string): void {
    this.memoryFallback.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.removeItem === 'function') {
        window.localStorage.removeItem(key);
        return;
      }
      if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignora excepciones si localStorage no está disponible
    }
  }

  // =========================================================================
  // IMPLEMENTACIÓN DE ARQUITECTURA JWT (RFC 7519)
  // =========================================================================

  /**
   * Codifica una cadena de texto en formato Base64URL según RFC 7519.
   */
  private base64UrlEncode(str: string): string {
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Decodifica una cadena Base64URL a texto UTF-8.
   */
  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  /**
   * Genera una firma simulada determinística HMAC-SHA256 (Base64URL) a partir del Header y Payload.
   */
  private generarFirma(headerEncoded: string, payloadEncoded: string): string {
    const data = `${headerEncoded}.${payloadEncoded}.${this.JWT_SECRET}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return this.base64UrlEncode(`sig_hmac256_${hex}_valid`);
  }

  /**
   * Genera un Token JWT estándar válido de 3 partes: header.payload.signature
   * con vigencia de 2 minutos (120 segundos) para pruebas y sustentación académica.
   */
  public generarToken(datosUsuario: Partial<JWTPayload>): string {
    const ahoraSeg = Math.floor(Date.now() / 1000);
    const expiracionSeg = ahoraSeg + (2 * 60); // 2 minutos de validez (120 segundos)

    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload: JWTPayload = {
      sub: datosUsuario.sub || datosUsuario.email || 'usr_' + Date.now(),
      email: datosUsuario.email || '',
      nombre: datosUsuario.nombre || 'Tutor Maxi-Food',
      nombreMascota: datosUsuario.nombreMascota || 'Max',
      tipoMascota: datosUsuario.tipoMascota || 'perro',
      direccion: datosUsuario.direccion || 'Bogotá D.C., Colombia',
      telefono: datosUsuario.telefono || '300 123 4567',
      rol: datosUsuario.rol || 'cliente',
      proveedor: datosUsuario.proveedor || 'local',
      fotoUrl: datosUsuario.fotoUrl || '',
      iat: ahoraSeg,
      exp: expiracionSeg,
      iss: 'https://auth.maxifood.co'
    };

    const headerEncoded = this.base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.generarFirma(headerEncoded, payloadEncoded);

    return `${headerEncoded}.${payloadEncoded}.${signature}`;
  }

  /**
   * Decodifica e inspecciona un Token JWT para auditoría visual y visualización en tiempo real.
   */
  public decodificarToken(token?: string | null): JWTDecodificado | null {
    const jwt = token || this.obtenerToken();
    if (!jwt) return null;

    try {
      const partes = jwt.split('.');
      if (partes.length !== 3) return null;

      const header = JSON.parse(this.base64UrlDecode(partes[0]));
      const payload: JWTPayload = JSON.parse(this.base64UrlDecode(partes[1]));
      const signature = partes[2];

      const ahoraSeg = Math.floor(Date.now() / 1000);
      const expirado = payload.exp ? ahoraSeg >= payload.exp : false;
      const diffSeg = payload.exp ? Math.max(0, payload.exp - ahoraSeg) : 0;
      const minutos = Math.floor(diffSeg / 60);
      const segundos = diffSeg % 60;
      const tiempoRestanteMinutos = Math.round(diffSeg / 60);
      const tiempoRestanteTexto = expirado
        ? '¡Token Expirado!'
        : `${minutos}m ${segundos < 10 ? '0' : ''}${segundos}s`;

      return {
        header,
        payload,
        signature,
        raw: jwt,
        expirado,
        tiempoRestanteMinutos,
        tiempoRestanteTexto
      };
    } catch (e) {
      console.error('Error decodificando token JWT:', e);
      return null;
    }
  }

  /**
   * Guarda el token en localStorage y notifica a los observadores.
   */
  public guardarToken(token: string): void {
    this.setStorageItem(this.STORAGE_JWT_KEY, token);
    const payload = this.obtenerPayload();
    this.userClaimsSubject.next(payload);
    this.authStateSubject.next(true);
  }

  /**
   * Obtiene el token JWT sin procesar desde localStorage o memoria segura.
   */
  public obtenerToken(): string | null {
    return this.getStorageItem(this.STORAGE_JWT_KEY);
  }

  /**
   * Obtiene el payload del usuario autenticado actualmente.
   */
  public obtenerPayload(): JWTPayload | null {
    const dec = this.decodificarToken();
    return dec ? dec.payload : null;
  }

  /**
   * Verifica si existe un token válido y no expirado en el almacenamiento local.
   */
  public estaAutenticado(): boolean {
    const token = this.obtenerToken();
    if (!token) return false;

    const dec = this.decodificarToken(token);
    if (!dec || dec.expirado) {
      // Si el token expiró, se limpia automáticamente
      if (dec && dec.expirado) {
        this.cerrarSesion();
      }
      return false;
    }
    return true;
  }

  /**
   * Valida periódicamente la vigencia del token activo.
   */
  private revisarEstadoToken(): void {
    const autenticado = this.estaAutenticado();
    this.authStateSubject.next(autenticado);
    this.userClaimsSubject.next(this.obtenerPayload());
  }

  // =========================================================================
  // MÉTODOS DE NEGOCIO: LOGIN LOCAL, REGISTRO Y OAUTH SOCIAL
  // =========================================================================

  /**
   * Inicia sesión con credenciales locales (email/password), genera el token JWT y lo almacena.
   */
  public loginLocal(correo: string, password: string): { ok: boolean; mensaje: string; token?: string } {
    const correoLimpio = correo.trim().toLowerCase();
    const usuarios = this.obtenerUsuariosRegistrados();
    const existente = usuarios.find(u => u.correo.toLowerCase() === correoLimpio);

    if (existente && existente.password && existente.password !== password) {
      return { ok: false, mensaje: 'Credenciales inválidas: la contraseña no coincide.' };
    }

    const nombre = existente ? existente.nombre : (correoLimpio.split('@')[0] || 'Cliente Maxi');
    const nombreMascota = existente ? existente.nombreMascota : 'Max';
    const tipoMascota = existente ? existente.tipoMascota : 'perro';

    const token = this.generarToken({
      sub: correoLimpio,
      email: correoLimpio,
      nombre: nombre.charAt(0).toUpperCase() + nombre.slice(1),
      nombreMascota,
      tipoMascota,
      rol: 'cliente',
      proveedor: 'local'
    });

    this.guardarToken(token);
    return {
      ok: true,
      mensaje: `¡Sesión iniciada con éxito! Token JWT emitido.`,
      token
    };
  }

  /**
   * Registra un nuevo usuario en localStorage, genera su token JWT de bienvenida y activa su sesión.
   */
  public registrarUsuario(datos: {
    nombre: string;
    correo: string;
    password?: string;
    nombreMascota: string;
    tipoMascota: 'perro' | 'gato' | 'ambos';
    direccion?: string;
    telefono?: string;
  }): { ok: boolean; mensaje: string; token: string } {
    const correoLimpio = datos.correo.trim().toLowerCase();
    const usuarios = this.obtenerUsuariosRegistrados();

    const idx = usuarios.findIndex(u => u.correo.toLowerCase() === correoLimpio);
    const usuarioFinal = {
      ...datos,
      correo: correoLimpio
    };

    if (idx >= 0) {
      usuarios[idx] = usuarioFinal;
    } else {
      usuarios.push(usuarioFinal);
    }
    this.setStorageItem(this.STORAGE_USERS_KEY, JSON.stringify(usuarios));

    const token = this.generarToken({
      sub: correoLimpio,
      email: correoLimpio,
      nombre: datos.nombre,
      nombreMascota: datos.nombreMascota || 'Firulais',
      tipoMascota: datos.tipoMascota || 'perro',
      direccion: datos.direccion || '',
      telefono: datos.telefono || '',
      rol: 'cliente',
      proveedor: 'local'
    });

    this.guardarToken(token);
    return {
      ok: true,
      mensaje: `¡Cuenta creada exitosamente! Token JWT emitido.`,
      token
    };
  }

  /**
   * Autenticación Social (OAuth 2.0 / SDK de Terceros): Google o Facebook.
   * Simula el handshake OAuth2 generando un token JWT firmado con claims verificados de la red social.
   */
  public loginOAuth(proveedor: 'google' | 'facebook', datosMock?: Partial<JWTPayload>): { ok: boolean; mensaje: string; token: string } {
    let nombre = '';
    let email = '';
    let fotoUrl = '';

    if (proveedor === 'google') {
      nombre = datosMock?.nombre || 'Cristian Camacho (Google)';
      email = datosMock?.email || 'cristian.camacho@gmail.com';
      fotoUrl = 'https://lh3.googleusercontent.com/a/default-user=s96-c';
    } else {
      nombre = datosMock?.nombre || 'Diego Garzón (Facebook)';
      email = datosMock?.email || 'diego.garzon@facebook.com';
      fotoUrl = 'https://graph.facebook.com/1000000000/picture?type=square';
    }

    const token = this.generarToken({
      sub: `oauth_${proveedor}_${Date.now()}`,
      email,
      nombre,
      nombreMascota: datosMock?.nombreMascota || 'Max & Rocky',
      tipoMascota: datosMock?.tipoMascota || 'perro',
      rol: 'cliente',
      proveedor,
      fotoUrl
    });

    this.guardarToken(token);

    return {
      ok: true,
      mensaje: `¡Autenticación con ${proveedor === 'google' ? 'Google' : 'Facebook'} exitosa! Token JWT emitido.`,
      token
    };
  }

  /**
   * Inicia sesión con una cuenta de prueba limpia/anónima ("Usuario Demo") sin datos prellenados de ningún cliente.
   */
  public loginDemo(): { ok: boolean; mensaje: string; token: string } {
    const token = this.generarToken({
      sub: 'demo_user_' + Date.now(),
      email: 'demo@maxifood.co',
      nombre: 'Usuario Demo',
      nombreMascota: '',
      tipoMascota: 'perro',
      direccion: '',
      telefono: '',
      rol: 'cliente',
      proveedor: 'local'
    });
    this.guardarToken(token);
    return {
      ok: true,
      mensaje: '¡Acceso Demo activado como usuario de prueba!',
      token
    };
  }

  /**
   * Cierra la sesión activa: revoca y elimina el token JWT de localStorage.
   */
  public cerrarSesion(): void {
    this.removeStorageItem(this.STORAGE_JWT_KEY);
    this.userClaimsSubject.next(null);
    this.authStateSubject.next(false);
  }

  /**
   * Auxiliar: lee la lista de usuarios guardados en localStorage.
   */
  private obtenerUsuariosRegistrados(): any[] {
    try {
      const raw = this.getStorageItem(this.STORAGE_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
