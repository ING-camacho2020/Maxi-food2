/**
 * @file login.page.ts
 * @description Componente encargado de la pantalla de bienvenida, inicio de sesión
 * y registro de nuevos usuarios junto con la información de su mascota.
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonItem,
  IonIcon,
  IonInput,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonChip,
  ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  pawOutline,
  personOutline,
  eyeOutline,
  eyeOffOutline,
  sparklesOutline,
  locationOutline,
  callOutline,
  heartOutline,
  shieldCheckmarkOutline,
  rocketOutline
} from 'ionicons/icons';
import { TiendaService } from '../../services/tienda.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonCard,
    IonCardContent,
    IonItem,
    IonIcon,
    IonInput,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonChip
  ]
})
export class LoginPage {
  // Controla qué pestaña del formulario se muestra: 'login' (Iniciar Sesión) o 'registro' (Crear Cuenta)
  modo: 'login' | 'registro' = 'login';

  // Permite alternar la visibilidad de la contraseña entre texto oculto y texto plano
  mostrarPassword = false;

  // Datos vinculados (ngModel) para el inicio de sesión
  correo: string = '';
  password: string = '';

  // Datos adicionales vinculados (ngModel) para el formulario de registro
  nombre: string = '';
  nombreMascota: string = '';
  tipoMascota: 'perro' | 'gato' | 'ambos' = 'perro';
  direccion: string = '';
  telefono: string = '';

  constructor(
    private router: Router,
    private tiendaService: TiendaService,
    private toastCtrl: ToastController
  ) {
    // Registro explícito de los íconos de Ionicons utilizados en la plantilla
    addIcons({
      mailOutline,
      lockClosedOutline,
      pawOutline,
      personOutline,
      eyeOutline,
      eyeOffOutline,
      sparklesOutline,
      locationOutline,
      callOutline,
      heartOutline,
      shieldCheckmarkOutline,
      rocketOutline
    });
  }

  /**
   * Cambia entre la vista de inicio de sesión y la de creación de cuenta
   * cuando el usuario interactúa con el `<ion-segment>`.
   */
  cambiarModo(event: any) {
    this.modo = event.detail.value;
  }

  /**
   * Muestra una notificación emergente (Toast) en la parte superior de la pantalla.
   */
  async mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2400,
      position: 'top',
      color
    });
    await toast.present();
  }

  /**
   * Valida que los campos obligatorios estén completos, inicia la sesión en `TiendaService`
   * y navega hacia la vista principal del catálogo (`/catalogo`).
   */
  async iniciarSesion() {
    if (!this.correo.trim() || !this.password.trim()) {
      await this.mostrarMensaje('Por favor ingresa tu correo y contraseña', 'warning');
      return;
    }

    const res = this.tiendaService.iniciarSesion(this.correo, this.password);
    if (!res.ok) {
      await this.mostrarMensaje(res.mensaje, 'danger');
      return;
    }

    await this.mostrarMensaje(res.mensaje, 'success');
    this.router.navigate(['/catalogo']);
  }

  /**
   * Permite ingresar con un solo clic usando una cuenta de demostración preconfigurada.
   */
  async accesoDemo() {
    this.correo = 'daniela@maxifood.co';
    this.password = 'maxi2026';
    const res = this.tiendaService.iniciarSesion(this.correo, this.password);
    await this.mostrarMensaje(res.mensaje, 'success');
    this.router.navigate(['/catalogo']);
  }

  /**
   * Registra un nuevo usuario junto con los datos de su mascota en `TiendaService`
   * y redirige inmediatamente al catálogo.
   */
  async registrarCuenta() {
    if (!this.nombre.trim() || !this.correo.trim() || !this.password.trim()) {
      await this.mostrarMensaje('Completa tu nombre, correo y contraseña para registrarte', 'warning');
      return;
    }

    const res = this.tiendaService.registrarUsuario({
      nombre: this.nombre.trim(),
      correo: this.correo.trim(),
      password: this.password,
      nombreMascota: this.nombreMascota.trim() || 'Firulais',
      tipoMascota: this.tipoMascota,
      direccion: this.direccion.trim() || 'Calle Principal # 10-20',
      telefono: this.telefono.trim() || '300 000 0000'
    });

    await this.mostrarMensaje(res.mensaje, 'success');
    this.router.navigate(['/catalogo']);
  }
}