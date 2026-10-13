import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { cartOutline } from 'ionicons/icons';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonIcon
  ]
})
export class CatalogoPage {
  constructor() {
    addIcons({ cartOutline });
  }

  productos = [
    { id: 1, nombre: 'Croquetas Maxi Cachorro', categoria: 'perro', etapa: 'Cachorro', precio: 85000, descripcion: 'Fórmula completa' },
    { id: 2, nombre: 'Alimento Felino Adulto', categoria: 'gato', etapa: 'Adulto', precio: 72000, descripcion: 'Control de bolas de pelo' },
    { id: 3, nombre: 'Snacks Dentales Caninos', categoria: 'perro', etapa: 'Adulto', precio: 25000, descripcion: 'Limpia sarro' },
    { id: 4, nombre: 'Pâté Salmón Gourmet', categoria: 'gato', etapa: 'Todas las edades', precio: 15000, descripcion: 'Alimento húmedo' }
  ];

  productosFiltrados = [...this.productos];
  categoriaActual = 'todos';

  cambiarCategoria(event: any) {
    this.categoriaActual = event.detail.value;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(p => {
      return this.categoriaActual === 'todos' || p.categoria === this.categoriaActual;
    });
  }

  filtrar(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.productosFiltrados = this.productos.filter(p => {
      const matchCat = this.categoriaActual === 'todos' || p.categoria === this.categoriaActual;
      return matchCat && p.nombre.toLowerCase().includes(query);
    });
  }
}