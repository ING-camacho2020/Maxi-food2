/**
 * @file catalogo.page.ts
 * @description Controlador de la pantalla principal del catálogo de Maxi-Food.
 * Coordina:
 * 1. El filtrado combinado por categoría ('todos', 'perro', 'gato', 'snack', 'favoritos') y búsqueda por texto.
 * 2. El ordenamiento dinámico de productos (destacados, menor/mayor precio, mejor calificación).
 * 3. El modal de detalle de producto con cálculo de precio según el peso seleccionado.
 * 4. El modal del carrito de compras, canje de cupones y confirmación del pedido (Checkout).
 * 5. El modal de perfil de usuario/mascota e historial de pedidos.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonBadge,
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonModal,
  IonItem,
  IonInput,
  IonFooter,
  ToastController
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  cartOutline,
  heartOutline,
  heart,
  star,
  pawOutline,
  personCircleOutline,
  logOutOutline,
  closeOutline,
  addOutline,
  removeOutline,
  trashOutline,
  checkmarkCircleOutline,
  sparklesOutline,
  pricetagOutline,
  locationOutline,
  cardOutline,
  cashOutline,
  phonePortraitOutline,
  bagCheckOutline,
  eyeOutline,
  nutritionOutline,
  shieldCheckmarkOutline,
  timeOutline
} from 'ionicons/icons';
import { TiendaService, Producto, Usuario } from '../../services/tienda.service';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonBadge,
    IonContent,
    IonSearchbar,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonLabel,
    IonModal,
    IonItem,
    IonInput,
    IonFooter
  ]
})
export class CatalogoPage implements OnInit {
  // Lista de productos que se renderiza actualmente en la cuadrícula tras aplicar filtros y orden
  productosFiltrados: Producto[] = [];

  // Filtros activos de categoría, criterio de ordenamiento y término de búsqueda
  categoriaActual: 'todos' | 'perro' | 'gato' | 'snack' | 'favoritos' = 'todos';
  ordenActual: 'destacados' | 'precio-asc' | 'precio-desc' | 'rating' = 'destacados';
  textoBusqueda: string = '';

  // --- Estado del Modal 1: Detalle de Producto ---
  productoDetalle: Producto | null = null;
  pesoDetalleSeleccionado: string = '';
  cantidadDetalle: number = 1;

  // --- Estado del Modal 2: Carrito de Compras y Checkout ---
  mostrarModalCarrito: boolean = false;
  codigoCuponInput: string = '';
  metodoPagoSeleccionado: string = 'Contraentrega';
  direccionEntregaInput: string = '';

  // --- Estado del Modal 3: Perfil de Usuario e Historial de Pedidos ---
  mostrarModalPerfil: boolean = false;
  perfilEdit: Usuario = {
    nombre: '',
    correo: '',
    nombreMascota: '',
    tipoMascota: 'perro',
    direccion: '',
    telefono: ''
  };

  constructor(
    public tienda: TiendaService,
    private router: Router,
    private toastCtrl: ToastController
  ) {
    // Registro de todos los íconos de Ionicons utilizados en la plantilla del catálogo y sus modales
    addIcons({
      cartOutline,
      heartOutline,
      heart,
      star,
      pawOutline,
      personCircleOutline,
      logOutOutline,
      closeOutline,
      addOutline,
      removeOutline,
      trashOutline,
      checkmarkCircleOutline,
      sparklesOutline,
      pricetagOutline,
      locationOutline,
      cardOutline,
      cashOutline,
      phonePortraitOutline,
      bagCheckOutline,
      eyeOutline,
      nutritionOutline,
      shieldCheckmarkOutline,
      timeOutline
    });
  }

  /**
   * Ciclo de vida inicial: carga la lista inicial de productos y sincroniza los datos del usuario.
   */
  ngOnInit() {
    this.aplicarFiltros();
    this.sincronizarDatosUsuario();
  }

  /**
   * Copia los datos del usuario autenticado (o valores por defecto de invitado)
   * hacia los formularios de dirección de envío y edición de perfil.
   */
  sincronizarDatosUsuario() {
    if (this.tienda.usuarioActual) {
      this.direccionEntregaInput = this.tienda.usuarioActual.direccion || 'Calle 100 # 15-20, Bogotá';
      this.perfilEdit = { ...this.tienda.usuarioActual };
    } else {
      this.direccionEntregaInput = 'Calle 100 # 15-20, Bogotá';
      this.perfilEdit = {
        nombre: 'Invitado Maxi-Food',
        correo: 'invitado@maxifood.co',
        nombreMascota: 'Max',
        tipoMascota: 'perro',
        direccion: 'Calle 100 # 15-20, Bogotá',
        telefono: '300 123 4567'
      };
    }
  }

  /**
   * Cambia la categoría activa ('todos', 'perro', 'gato', 'snack' o 'favoritos') y actualiza la vista.
   */
  seleccionarCategoria(cat: 'todos' | 'perro' | 'gato' | 'snack' | 'favoritos') {
    this.categoriaActual = cat;
    this.aplicarFiltros();
  }

  /**
   * Cambia el criterio de ordenamiento y vuelve a ordenar la lista visible.
   */
  cambiarOrden(orden: 'destacados' | 'precio-asc' | 'precio-desc' | 'rating') {
    this.ordenActual = orden;
    this.aplicarFiltros();
  }

  /**
   * Captura el texto escrito en el `<ion-searchbar>` y ejecuta el filtrado en tiempo real.
   */
  filtrar(event: any) {
    this.textoBusqueda = (event.target?.value ?? event.detail?.value ?? '').toLowerCase().trim();
    this.aplicarFiltros();
  }

  /**
   * Filtra el catálogo combinando la categoría seleccionada y el texto de búsqueda,
   * y posteriormente ordena el resultado según `ordenActual`.
   */
  aplicarFiltros() {
    let lista = this.tienda.productos.filter(p => {
      const coincideCategoria =
        this.categoriaActual === 'todos'
          ? true
          : this.categoriaActual === 'favoritos'
          ? this.tienda.esFavorito(p.id)
          : p.categoria === this.categoriaActual;

      const coincideTexto =
        !this.textoBusqueda ||
        p.nombre.toLowerCase().includes(this.textoBusqueda) ||
        p.marca.toLowerCase().includes(this.textoBusqueda) ||
        p.descripcion.toLowerCase().includes(this.textoBusqueda) ||
        p.etapa.toLowerCase().includes(this.textoBusqueda);

      return coincideCategoria && coincideTexto;
    });

    // Ordenamiento de la lista filtrada
    if (this.ordenActual === 'precio-asc') {
      lista = [...lista].sort((a, b) => a.precio - b.precio);
    } else if (this.ordenActual === 'precio-desc') {
      lista = [...lista].sort((a, b) => b.precio - a.precio);
    } else if (this.ordenActual === 'rating') {
      lista = [...lista].sort((a, b) => b.rating - a.rating);
    } else {
      lista = [...lista].sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
    }

    this.productosFiltrados = lista;
  }

  /**
   * Marca o desmarca un producto como favorito.
   * Se usa `event.stopPropagation()` para evitar que al tocar el corazón se abra el modal de detalle.
   */
  async toggleFavorito(producto: Producto, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const agregado = this.tienda.toggleFavorito(producto.id);
    if (this.categoriaActual === 'favoritos') {
      this.aplicarFiltros();
    }
    await this.mostrarToast(
      agregado
        ? `❤️ ${producto.nombre} guardado en tus favoritos`
        : `${producto.nombre} eliminado de favoritos`,
      agregado ? 'danger' : 'medium'
    );
  }

  /**
   * Abre el modal de detalle para el producto seleccionado y preselecciona su presentación estándar.
   */
  abrirDetalle(producto: Producto) {
    this.productoDetalle = producto;
    this.pesoDetalleSeleccionado = producto.pesos[1]?.etiqueta ?? producto.pesos[0].etiqueta;
    this.cantidadDetalle = 1;
  }

  /**
   * Cierra el modal de detalle de producto.
   */
  cerrarDetalle() {
    this.productoDetalle = null;
  }

  /**
   * Calcula dinámicamente el precio unitario del producto abierto en el modal según el peso elegido.
   */
  get precioDetalleActual(): number {
    if (!this.productoDetalle) return 0;
    return this.tienda.calcularPrecioPorPeso(this.productoDetalle, this.pesoDetalleSeleccionado);
  }

  /**
   * Incrementa o disminuye la cantidad a comprar dentro del modal de detalle (entre 1 y 20 unidades).
   */
  cambiarCantidadDetalle(delta: number) {
    const nueva = this.cantidadDetalle + delta;
    if (nueva >= 1 && nueva <= 20) {
      this.cantidadDetalle = nueva;
    }
  }

  /**
   * Agrega 1 unidad del producto directamente desde la tarjeta del catálogo usando su presentación estándar.
   */
  async agregarRapido(producto: Producto, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const pesoDefault = producto.pesos[1]?.etiqueta ?? producto.pesos[0].etiqueta;
    this.tienda.agregarAlCarrito(producto, pesoDefault, 1);
    await this.mostrarToast(`🛒 ${producto.nombre} (${pesoDefault}) agregado al carrito`, 'success');
  }

  /**
   * Agrega al carrito el producto desde el modal de detalle con el peso y cantidad personalizados.
   */
  async agregarDesdeDetalle() {
    if (!this.productoDetalle) return;
    this.tienda.agregarAlCarrito(
      this.productoDetalle,
      this.pesoDetalleSeleccionado,
      this.cantidadDetalle
    );
    const nombre = this.productoDetalle.nombre;
    this.cerrarDetalle();
    await this.mostrarToast(`🛒 ${this.cantidadDetalle}x ${nombre} agregado al carrito`, 'success');
  }

  /**
   * Activa el cupón promocional directamente desde el botón del banner principal.
   */
  async aplicarCuponPromo(codigo: string) {
    this.codigoCuponInput = codigo;
    const res = this.tienda.aplicarCupon(codigo);
    await this.mostrarToast(res.mensaje, res.ok ? 'success' : 'warning');
  }

  /**
   * Canjea el código de cupón escrito manualmente dentro del modal del carrito.
   */
  async canjearCuponModal() {
    if (!this.codigoCuponInput.trim()) {
      await this.mostrarToast('Escribe un código de cupón (Ej. MAXI10)', 'warning');
      return;
    }
    const res = this.tienda.aplicarCupon(this.codigoCuponInput);
    await this.mostrarToast(res.mensaje, res.ok ? 'success' : 'warning');
  }

  /**
   * Procesa la compra actual, registra el pedido en el historial y abre el modal de perfil para mostrarlo.
   */
  async confirmarPedido() {
    if (this.tienda.carrito.length === 0) return;

    const pedido = this.tienda.crearPedido(
      this.metodoPagoSeleccionado,
      this.direccionEntregaInput
    );
    this.mostrarModalCarrito = false;
    await this.mostrarToast(
      `🎉 ¡Pedido ${pedido.id} confirmado! Total: $${pedido.total.toLocaleString('es-CO')} COP`,
      'success',
      3500
    );
    this.mostrarModalPerfil = true;
  }

  /**
   * Abre el modal de perfil cargando previamente los datos actuales del usuario.
   */
  abrirModalPerfil() {
    this.sincronizarDatosUsuario();
    this.mostrarModalPerfil = true;
  }

  /**
   * Guarda los cambios realizados en el formulario de perfil y mascota.
   */
  async guardarCambiosPerfil() {
    this.tienda.actualizarPerfil(this.perfilEdit);
    this.direccionEntregaInput = this.perfilEdit.direccion;
    await this.mostrarToast('✅ Datos de perfil y mascota actualizados', 'success');
  }

  /**
   * Cierra todos los modales abiertos, finaliza la sesión en `TiendaService` y redirige a `/login`.
   */
  async cerrarSesion() {
    this.mostrarModalPerfil = false;
    this.mostrarModalCarrito = false;
    this.productoDetalle = null;
    this.tienda.cerrarSesion();
    await this.mostrarToast('Has cerrado sesión correctamente', 'medium');
    this.router.navigate(['/login']);
  }

  /**
   * Calcula el porcentaje de avance (0% a 100%) hacia la meta de envío gratis ($120.000 COP).
   */
  get porcentajeMetaEnvioGratis(): number {
    const meta = 120000;
    return Math.min(100, Math.round((this.tienda.subtotalCarrito / meta) * 100));
  }

  /**
   * Calcula cuánto dinero falta en el carrito para alcanzar el envío gratis.
   */
  get faltanteEnvioGratis(): number {
    return Math.max(0, 120000 - this.tienda.subtotalCarrito);
  }

  /**
   * Método auxiliar para presentar notificaciones tipo Toast en la parte superior.
   */
  private async mostrarToast(
    message: string,
    color: 'success' | 'warning' | 'danger' | 'medium' = 'success',
    duration: number = 2000
  ) {
    const toast = await this.toastCtrl.create({
      message,
      duration,
      position: 'top',
      color
    });
    await toast.present();
  }
}