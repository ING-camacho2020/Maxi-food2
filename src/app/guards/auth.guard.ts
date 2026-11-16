/**
 * @file auth.guard.ts
 * @description Guardianes de rutas funcionales (CanActivateFn) de Angular.
 * authGuard protege el catálogo y las vistas privadas de Maxi-Food validando la existencia
 * y vigencia del Token JWT, restaurado desde Capacitor Preferences al iniciar la app.
 * loginGuard evita que un usuario con sesión activa vuelva a la pantalla de login.
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastController } from '@ionic/angular';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastCtrl = inject(ToastController);

  if (authService.estaAutenticado()) {
    return true;
  }

  // Si no está autenticado o el token JWT expiró, muestra feedback y redirige a /login
  const toast = await toastCtrl.create({
    message: ' Acceso restringido: debes iniciar sesión con tu Token JWT.',
    duration: 3000,
    position: 'top',
    color: 'warning'
  });
  await toast.present();

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

export const loginGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.estaAutenticado()
    ? router.createUrlTree(['/catalogo'])
    : true;
};