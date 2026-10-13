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
  modo: 'login' | 'registro' = 'login';
  mostrarPassword = false;

  // Campos de login
  correo: string = '';
  password: string = '';

  // Campos de registro
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

  cambiarModo(event: any) {
    this.modo = event.detail.value;
  }

  async mostrarMensaje(mensaje: string, color: 'success' | 'warning' | 'danger' = 'success') {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2400,
      position: 'top',
      color
    });
    await toast.present();
  }

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

  async accesoDemo() {
    this.correo = 'cliente@maxifood.co';
    this.password = 'maxi2026';
    const res = this.tiendaService.iniciarSesion(this.correo, this.password);
    await this.mostrarMensaje(res.mensaje, 'success');
    this.router.navigate(['/catalogo']);
  }

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