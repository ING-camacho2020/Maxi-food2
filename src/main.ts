/**
 * @file main.ts
 * @description Punto de entrada principal de la aplicación Maxi-Food.
 * Se encarga de inicializar (bootstrap) la aplicación Angular utilizando componentes
 * standalone, configurando el proveedor de Ionic y el sistema de rutas.
 */

import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
  PreloadAllModules
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    // Estrategia de reutilización de rutas propia de Ionic para conservar animaciones y estado entre vistas
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },

    // Inicializa la configuración global de componentes visuales de Ionic 9
    provideIonicAngular(),

    // Configura las rutas de la aplicación y precarga todos los módulos en segundo plano para mayor fluidez
    provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
  ],
});
