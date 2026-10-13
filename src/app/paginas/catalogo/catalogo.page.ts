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
  productosFiltrados: Producto[] = [];
  categoriaActual: 'todos' | 'perro' | 'gato' | 'snack' | 'favoritos' = 'todos';
  ordenActual: 'destacados' | 'precio-asc' | 'precio-desc' | 'rating' = 'destacados';
  textoBusqueda: string = '';

  // Estado Modal Detalle de Producto
  productoDetalle: Producto | null = null;
  pesoDetalleSeleccionado: string = '';
  cantidadDetalle: number = 1;

  // Estado Modal Carrito y Checkout
  mostrarModalCarrito: boolean = false;
  codigoCuponInput: string = '';
  metodoPagoSeleccionado: string = 'Contraentrega';
  direccionEntregaInput: string = '';

  // Estado Modal Perfil y Pedidos
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

  ngOnInit() {
    this.aplicarFiltros();
    this.sincronizarDatosUsuario();
  }

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

  seleccionarCategoria(cat: 'todos' | 'perro' | 'gato' | 'snack' | 'favoritos') {
    this.categoriaActual = cat;
    this.aplicarFiltros();
  }

  cambiarOrden(orden: 'destacados' | 'precio-asc' | 'precio-desc' | 'rating') {
    this.ordenActual = orden;
    this.aplicarFiltros();
  }

  filtrar(event: any) {
    this.textoBusqueda = (event.target?.value ?? event.detail?.value ?? '').toLowerCase().trim();
    this.aplicarFiltros();
  }

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

  abrirDetalle(producto: Producto) {
    this.productoDetalle = producto;
    this.pesoDetalleSeleccionado = producto.pesos[1]?.etiqueta ?? producto.pesos[0].etiqueta;
    this.cantidadDetalle = 1;
  }

  cerrarDetalle() {
    this.productoDetalle = null;
  }

  get precioDetalleActual(): number {
    if (!this.productoDetalle) return 0;
    return this.tienda.calcularPrecioPorPeso(this.productoDetalle, this.pesoDetalleSeleccionado);
  }

  cambiarCantidadDetalle(delta: number) {
    const nueva = this.cantidadDetalle + delta;
    if (nueva >= 1 && nueva <= 20) {
      this.cantidadDetalle = nueva;
    }
  }

  async agregarRapido(producto: Producto, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    const pesoDefault = producto.pesos[1]?.etiqueta ?? producto.pesos[0].etiqueta;
    this.tienda.agregarAlCarrito(producto, pesoDefault, 1);
    await this.mostrarToast(`🛒 ${producto.nombre} (${pesoDefault}) agregado al carrito`, 'success');
  }

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

  async aplicarCuponPromo(codigo: string) {
    this.codigoCuponInput = codigo;
    const res = this.tienda.aplicarCupon(codigo);
    await this.mostrarToast(res.mensaje, res.ok ? 'success' : 'warning');
  }

  async canjearCuponModal() {
    if (!this.codigoCuponInput.trim()) {
      await this.mostrarToast('Escribe un código de cupón (Ej. MAXI10)', 'warning');
      return;
    }
    const res = this.tienda.aplicarCupon(this.codigoCuponInput);
    await this.mostrarToast(res.mensaje, res.ok ? 'success' : 'warning');
  }

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

  abrirModalPerfil() {
    this.sincronizarDatosUsuario();
    this.mostrarModalPerfil = true;
  }

  async guardarCambiosPerfil() {
    this.tienda.actualizarPerfil(this.perfilEdit);
    this.direccionEntregaInput = this.perfilEdit.direccion;
    await this.mostrarToast('✅ Datos de perfil y mascota actualizados', 'success');
  }

  async cerrarSesion() {
    this.mostrarModalPerfil = false;
    this.mostrarModalCarrito = false;
    this.productoDetalle = null;
    this.tienda.cerrarSesion();
    await this.mostrarToast('Has cerrado sesión correctamente', 'medium');
    this.router.navigate(['/login']);
  }

  get porcentajeMetaEnvioGratis(): number {
    const meta = 120000;
    return Math.min(100, Math.round((this.tienda.subtotalCarrito / meta) * 100));
  }

  get faltanteEnvioGratis(): number {
    return Math.max(0, 120000 - this.tienda.subtotalCarrito);
  }

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