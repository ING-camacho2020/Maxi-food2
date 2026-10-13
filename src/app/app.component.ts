/**
 * @file app.component.ts
 * @description Componente raíz de la aplicación.
 * Envuelve toda la interfaz dentro de `<ion-app>` y renderiza las páginas activas
 * a través de `<ion-router-outlet>`.
 */

import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {}
}
