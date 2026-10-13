/**
 * @file app.routes.ts
 * @description Definición de las rutas de navegación de Maxi-Food.
 * Utiliza carga perezosa (Lazy Loading) mediante `loadComponent` para que cada
 * pantalla se descargue únicamente cuando el usuario la necesita.
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    // Ruta raíz: redirige automáticamente a la pantalla de inicio de sesión (/login)
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    // Pantalla de autenticación y registro de usuarios/mascotas
    path: 'login',
    loadComponent: () => import('./paginas/login/login.page').then((m) => m.LoginPage),
  },
  {
    // Pantalla principal de la tienda: catálogo de productos, carrito, detalle y perfil
    path: 'catalogo',
    loadComponent: () => import('./paginas/catalogo/catalogo.page').then((m) => m.CatalogoPage),
  },
  {
    // Ruta base de respaldo generada por la plantilla de Ionic
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
];