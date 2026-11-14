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

import { Component, OnInit, OnDestroy } from '@angular/core';
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
  ToastController,
  AlertController
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
  timeOutline,
  logoGoogle,
  logoFacebook,
  keyOutline,
  sunnyOutline,
  rainyOutline,
  cloudyOutline,
  copyOutline,
  shieldCheckmark,
  cubeOutline
} from 'ionicons/icons';
import { TiendaService, Producto, Usuario } from '../../services/tienda.service';
import { AuthService, JWTDecodificado } from '../../services/auth.service';
import { TercerosService, ClimaMascota } from '../../services/terceros.service';

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
export class CatalogoPage implements OnInit, OnDestroy {
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

  // --- APIs de Terceros y Arquitectura JWT ---
  climaMascota: ClimaMascota | null = null;
  jwtAuditoria: JWTDecodificado | null = null;
  ultimoPedidoConfirmado: any = null;
  mostrarSeccionJWT: boolean = false;

  // Temporizador para cuenta regresiva en vivo de expiración del Token JWT (2 minutos)
  private intervaloJWT: any = null;

  constructor(
    public tienda: TiendaService,
    public authService: AuthService,
    public terceros: TercerosService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
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
      timeOutline,
      logoGoogle,
      logoFacebook,
      keyOutline,
      sunnyOutline,
      rainyOutline,
      cloudyOutline,
      copyOutline,
      shieldCheckmark,
      cubeOutline
    });
  }

  /**
   * Ciclo de vida inicial: carga productos, sincroniza sesión, consulta la API de Clima
   * e inicia la cuenta regresiva en tiempo real del Token JWT (2 minutos de vigencia).
   */
  async ngOnInit() {
    this.aplicarFiltros();
    this.sincronizarDatosUsuario();
    this.actualizarAuditoriaJWT();
    await this.cargarClimaEnTiempoReal();

    // Actualiza la cuenta regresiva del token cada segundo y comprueba si expiró
    this.intervaloJWT = setInterval(() => {
      this.actualizarAuditoriaJWT();
      if (!this.authService.estaAutenticado()) {
        clearInterval(this.intervaloJWT);
        this.intervaloJWT = null;
        this.mostrarToast('⏳ Tu Token JWT (2 min) ha expirado. Por favor inicia sesión nuevamente.', 'warning', 4000);
        this.router.navigate(['/login']);
      }
    }, 1000);
  }

  /**
   * Limpia el temporizador al salir de la pantalla.
   */
  ngOnDestroy() {
    if (this.intervaloJWT) {
      clearInterval(this.intervaloJWT);
      this.intervaloJWT = null;
    }
  }

  /**
   * Copia los datos del usuario autenticado hacia los formularios de dirección de envío y edición de perfil.
   */
  sincronizarDatosUsuario() {
    if (this.tienda.usuarioActual) {
      this.direccionEntregaInput = this.tienda.usuarioActual.direccion || '';
      this.perfilEdit = { ...this.tienda.usuarioActual };
    } else {
      this.direccionEntregaInput = '';
      this.perfilEdit = {
        nombre: 'Usuario Demo',
        correo: 'demo@maxifood.co',
        nombreMascota: '',
        tipoMascota: 'perro',
        direccion: '',
        telefono: ''
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
   * Consulta la API pública de Open-Meteo para obtener temperatura y generar el consejo nutricional.
   */
  async cargarClimaEnTiempoReal() {
    try {
      this.climaMascota = await this.terceros.consultarClimaYConsejo();
    } catch (e) {
      console.warn('Error al obtener clima:', e);
    }
  }

  /**
   * Actualiza los datos de inspección del Token JWT para auditoría técnica.
   */
  actualizarAuditoriaJWT() {
    this.jwtAuditoria = this.authService.decodificarToken();
  }

  /**
   * Copia el Token JWT al portapapeles del dispositivo para que el docente o evaluador
   * pueda verificarlo directamente en herramientas como jwt.io.
   */
  async copiarTokenJWT() {
    const token = this.jwtAuditoria?.raw || this.authService.obtenerToken();
    if (!token) {
      await this.mostrarToast('No hay Token JWT activo en este momento.', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(token);
      await this.mostrarToast('📋 ¡Token JWT copiado! Puedes pegarlo en https://jwt.io', 'success', 3000);
    } catch {
      await this.mostrarToast(`Token: ${token.substring(0, 24)}...`, 'medium', 3000);
    }
  }

  /**
   * Procesa la compra actual, genera un ID de compra único, muestra alerta de confirmación
   * y abre el modal de perfil para visualizar el historial actualizado.
   */
  async confirmarPedido() {
    if (this.tienda.carrito.length === 0) return;

    const pedido = this.tienda.crearPedido(
      this.metodoPagoSeleccionado,
      this.direccionEntregaInput
    );
    this.ultimoPedidoConfirmado = pedido;
    this.mostrarModalCarrito = false;

    // Alerta interactiva para destacar en el video el ID de compra único generado
    const alert = await this.alertCtrl.create({
      header: '🎉 ¡Compra Confirmada!',
      subHeader: `ID de Compra Único: ${pedido.id}`,
      message: `Tu orden por $${pedido.total.toLocaleString('es-CO')} COP ha sido registrada exitosamente.\n\nMétodo de Pago: ${pedido.metodoPago}\nDirección de Entrega: ${pedido.direccion}\nEstado: ${pedido.estado}`,
      buttons: [
        {
          text: 'Ver en Mis Pedidos',
          handler: () => {
            this.mostrarModalPerfil = true;
          }
        }
      ]
    });
    await alert.present();

    await this.mostrarToast(
      `🎉 ¡Compra confirmada! ID Único: ${pedido.id}`,
      'success',
      4000
    );
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