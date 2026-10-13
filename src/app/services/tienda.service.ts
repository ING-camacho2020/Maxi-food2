import { Injectable } from '@angular/core';

export interface PesoOpcion {
  etiqueta: string;
  multiplicador: number;
}

export interface Producto {
  id: number;
  nombre: string;
  marca: string;
  categoria: 'perro' | 'gato' | 'snack';
  etapa: string;
  precio: number;
  precioAnterior?: number;
  descuento?: number;
  descripcion: string;
  descripcionLarga: string;
  imagen: string;
  rating: number;
  reviews: number;
  pesos: PesoOpcion[];
  nutricion: {
    proteina: string;
    grasa: string;
    fibra: string;
    humedad: string;
  };
  ingredientes: string[];
  beneficios: string[];
  destacado?: boolean;
}

export interface ItemCarrito {
  producto: Producto;
  pesoSeleccionado: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Usuario {
  nombre: string;
  correo: string;
  password?: string;
  nombreMascota: string;
  tipoMascota: 'perro' | 'gato' | 'ambos';
  direccion: string;
  telefono: string;
}

export interface Pedido {
  id: string;
  fecha: string;
  items: ItemCarrito[];
  total: number;
  metodoPago: string;
  direccion: string;
  estado: 'En preparación' | 'En camino' | 'Entregado';
}

@Injectable({
  providedIn: 'root'
})
export class TiendaService {
  private readonly STORAGE_USER_KEY = 'maxifood_usuario_actual';
  private readonly STORAGE_USERS_LIST_KEY = 'maxifood_usuarios';
  private readonly STORAGE_CART_KEY = 'maxifood_carrito';
  private readonly STORAGE_FAV_KEY = 'maxifood_favoritos';
  private readonly STORAGE_ORDERS_KEY = 'maxifood_pedidos';

  productos: Producto[] = [
    {
      id: 1,
      nombre: 'Croquetas Maxi Cachorro Premium',
      marca: 'Maxi-Food Gold',
      categoria: 'perro',
      etapa: 'Cachorro (2-12 meses)',
      precio: 85000,
      precioAnterior: 102000,
      descuento: 17,
      descripcion: 'Fórmula completa con DHA, pollo real y calcio para un crecimiento sano y huesos fuertes.',
      descripcionLarga: 'Alimento súper premium especialmente formulado para cachorros en etapa de crecimiento. Contiene DHA proveniente del aceite de salmón para el desarrollo cerebral y visual, además de prebióticos naturales que fortalecen su sistema digestivo e inmunológico.',
      imagen: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reviews: 128,
      pesos: [
        { etiqueta: '1.5 kg', multiplicador: 0.45 },
        { etiqueta: '4 kg', multiplicador: 1 },
        { etiqueta: '10 kg', multiplicador: 2.15 }
      ],
      nutricion: { proteina: '30%', grasa: '18%', fibra: '3.2%', humedad: '10%' },
      ingredientes: ['Carne de pollo deshidratada', 'Arroz integral', 'Aceite de salmón (DHA)', 'Pulpa de remolacha', 'Vitaminas A, D3, E'],
      beneficios: ['Desarrollo cognitivo óptimo', 'Huesos y dientes fuertes', 'Pelaje brillante y suave'],
      destacado: true
    },
    {
      id: 2,
      nombre: 'Alimento Felino Adulto Hairball Control',
      marca: 'Maxi-Cat Care',
      categoria: 'gato',
      etapa: 'Adulto (1-7 años)',
      precio: 72000,
      precioAnterior: 85000,
      descuento: 15,
      descripcion: 'Control avanzado de bolas de pelo con fibras naturales, salmón nórdico y taurina.',
      descripcionLarga: 'Receta balanceada con salmón fresco y fibras vegetales seleccionadas que ayudan a prevenir y eliminar las bolas de pelo de forma natural. Enriquecido con taurina esencial para la salud cardíaca y visual de tu gato.',
      imagen: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reviews: 96,
      pesos: [
        { etiqueta: '1.5 kg', multiplicador: 0.5 },
        { etiqueta: '3 kg', multiplicador: 1 },
        { etiqueta: '7.5 kg', multiplicador: 2.1 }
      ],
      nutricion: { proteina: '34%', grasa: '14%', fibra: '5.5%', humedad: '9%' },
      ingredientes: ['Salmón fresco', 'Fibra de guisante', 'Taurina', 'Arándanos rojos', 'Extracto de yuca'],
      beneficios: ['Reduce bolas de pelo en 80%', 'Cuidado del tracto urinario (pH óptimo)', 'Alta palatabilidad'],
      destacado: true
    },
    {
      id: 3,
      nombre: 'Snacks Dentales Caninos FreshMint',
      marca: 'Maxi-Bites',
      categoria: 'snack',
      etapa: 'Adulto y Senior',
      precio: 25000,
      descripcion: 'Bastones masticables con menta y clorofila que reducen el sarro y refrescan el aliento.',
      descripcionLarga: 'Premios funcionales con textura porosa diseñada para limpiar hasta los dientes más difíciles de alcanzar. Libres de azúcares añadidos y bajos en calorías para consentir a tu perro todos los días.',
      imagen: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      rating: 4.7,
      reviews: 64,
      pesos: [
        { etiqueta: 'Bolsa 250g (7 uds)', multiplicador: 1 },
        { etiqueta: 'Mega Pack 750g (21 uds)', multiplicador: 2.5 }
      ],
      nutricion: { proteina: '14%', grasa: '3.5%', fibra: '2.0%', humedad: '14%' },
      ingredientes: ['Harina de arroz', 'Extracto de menta natural', 'Clorofila', 'Perejil', 'Hexametafosfato de sodio'],
      beneficios: ['Aliento fresco inmediato', 'Hasta 70% menos placa bacteriana', 'Textura flexible segura']
    },
    {
      id: 4,
      nombre: 'Pâté Salmón & Camarón Gourmet',
      marca: 'Maxi-Cat Cuisine',
      categoria: 'gato',
      etapa: 'Todas las edades',
      precio: 15000,
      precioAnterior: 18500,
      descuento: 19,
      descripcion: 'Alimento húmedo gourmet en textura mousse con trozos reales de salmón al vapor.',
      descripcionLarga: 'Una experiencia culinaria irresistible para los gatos más exigentes. Elaborado con ingredientes 100% naturales cocinados lentamente en su propio jugo para conservar todo el sabor y aportar hidratación diaria.',
      imagen: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      reviews: 215,
      pesos: [
        { etiqueta: 'Pack x 3 latas (85g c/u)', multiplicador: 1 },
        { etiqueta: 'Caja x 12 latas (85g c/u)', multiplicador: 3.6 }
      ],
      nutricion: { proteina: '12%', grasa: '5.0%', fibra: '0.8%', humedad: '78%' },
      ingredientes: ['Filete de salmón (60%)', 'Camarones del Pacífico', 'Caldo de pescado', 'Aceite de girasol', 'Taurina'],
      beneficios: ['Aporte extra de hidratación', '100% libre de granos (Grain-Free)', 'Sin conservantes artificiales'],
      destacado: true
    },
    {
      id: 5,
      nombre: 'Maxi Adulto Razas Medianas & Grandes',
      marca: 'Maxi-Food Gold',
      categoria: 'perro',
      etapa: 'Adulto (1-7 años)',
      precio: 118000,
      precioAnterior: 138000,
      descuento: 14,
      descripcion: 'Con condroitina, glucosamina y cordero para proteger las articulaciones y mantener la energía.',
      descripcionLarga: 'Nutrición superior para perros de razas medianas y grandes. Su fórmula con proteína de cordero e hidrolizado de pollo favorece la masa muscular magra y cuida las articulaciones sometidas a mayor esfuerzo físico.',
      imagen: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reviews: 154,
      pesos: [
        { etiqueta: '4 kg', multiplicador: 0.55 },
        { etiqueta: '8 kg', multiplicador: 1 },
        { etiqueta: '15 kg', multiplicador: 1.75 }
      ],
      nutricion: { proteina: '28%', grasa: '16%', fibra: '3.0%', humedad: '10%' },
      ingredientes: ['Carne de cordero', 'Pollo fresco', 'Glucosamina y Condroitina', 'Semillas de chía', 'Omega 3 y 6'],
      beneficios: ['Protección articular intensiva', 'Alta digestibilidad', 'Energía sostenida todo el día']
    },
    {
      id: 6,
      nombre: 'Galletas Horneadas Pollo & Manzana',
      marca: 'Maxi-Bites',
      categoria: 'snack',
      etapa: 'Todas las edades',
      precio: 19500,
      descripcion: 'Bocaditos crujientes horneados artesanalmente con pechuga de pollo y manzana verde.',
      descripcionLarga: 'Ideales para el entrenamiento y refuerzo positivo de tu mascota. Horneadas lentamente sin colorantes ni saborizantes artificiales, aportando antioxidantes naturales y un sabor que les encanta.',
      imagen: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      rating: 4.8,
      reviews: 82,
      pesos: [
        { etiqueta: '200 g', multiplicador: 1 },
        { etiqueta: '500 g', multiplicador: 2.1 }
      ],
      nutricion: { proteina: '18%', grasa: '8.0%', fibra: '2.5%', humedad: '9%' },
      ingredientes: ['Pechuga de pollo', 'Manzana deshidratada', 'Avena en hojuelas', 'Miel de abejas', 'Romero'],
      beneficios: ['Perfectas para entrenamiento', 'Ingredientes 100% naturales', 'Fácil digestión']
    },
    {
      id: 7,
      nombre: 'Gatitos Baby & Mother Care',
      marca: 'Maxi-Cat Care',
      categoria: 'gato',
      etapa: 'Gatito (1-12 meses)',
      precio: 68000,
      descripcion: 'Micro-croquetas fáciles de masticar con calostro, DHA y proteínas de alta absorción.',
      descripcionLarga: 'Diseñado para el destete de gatitos y gatas gestantes o lactantes. Sus micro-croquetas rehidratables facilitan la transición de la leche al alimento sólido mientras refuerzan sus defensas naturales.',
      imagen: 'https://images.unsplash.com/photo-1595433707802-6b2626ef1c91?auto=format&fit=crop&w=800&q=80',
      rating: 4.9,
      reviews: 73,
      pesos: [
        { etiqueta: '1.5 kg', multiplicador: 0.6 },
        { etiqueta: '3 kg', multiplicador: 1 }
      ],
      nutricion: { proteina: '36%', grasa: '20%', fibra: '2.2%', humedad: '8%' },
      ingredientes: ['Pavo deshidratado', 'Leche descremada', 'Calostro bovino', 'Aceite de pescado (DHA)', 'Prebióticos FOS/MOS'],
      beneficios: ['Refuerzo inmune con calostro', 'Croqueta ultra pequeña', 'Óptimo crecimiento muscular']
    },
    {
      id: 8,
      nombre: 'Tiritas Cremosas Tuna & Crab',
      marca: 'Maxi-Bites',
      categoria: 'snack',
      etapa: 'Todas las edades',
      precio: 22000,
      precioAnterior: 27000,
      descuento: 18,
      descripcion: 'Puré cremoso en sobres individuales de atún y cangrejo para consentir e hidratar.',
      descripcionLarga: 'El snack interactivo favorito de gatos y perros pequeños. Puedes dárselo directamente del sobre para fortalecer el vínculo con tu mascota o usarlo como topper sobre sus croquetas habituales.',
      imagen: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?auto=format&fit=crop&w=800&q=80',
      rating: 5.0,
      reviews: 190,
      pesos: [
        { etiqueta: 'Pack x 6 tubos (14g c/u)', multiplicador: 1 },
        { etiqueta: 'Mega Pack x 20 tubos', multiplicador: 2.8 }
      ],
      nutricion: { proteina: '8.5%', grasa: '1.2%', fibra: '0.3%', humedad: '88%' },
      ingredientes: ['Atún salvaje', 'Extracto de cangrejo', 'Té verde', 'Vitamina E', 'Taurina'],
      beneficios: ['Bajo en calorías', 'Alto contenido de humedad', 'Vínculo interactivo con tu mascota']
    }
  ];

  usuarioActual: Usuario | null = null;
  carrito: ItemCarrito[] = [];
  favoritosIds: number[] = [1, 4];
  pedidos: Pedido[] = [];
  cuponAplicado: string = '';
  porcentajeDescuentoCupon: number = 0;

  constructor() {
    this.cargarEstado();
  }

  private cargarEstado() {
    try {
      const userStr = localStorage.getItem(this.STORAGE_USER_KEY);
      if (userStr) {
        this.usuarioActual = JSON.parse(userStr);
      }

      const cartStr = localStorage.getItem(this.STORAGE_CART_KEY);
      if (cartStr) {
        this.carrito = JSON.parse(cartStr);
      }

      const favStr = localStorage.getItem(this.STORAGE_FAV_KEY);
      if (favStr) {
        this.favoritosIds = JSON.parse(favStr);
      }

      const ordersStr = localStorage.getItem(this.STORAGE_ORDERS_KEY);
      if (ordersStr) {
        this.pedidos = JSON.parse(ordersStr);
      }
    } catch {
      // Ignorar errores de almacenamiento local
    }
  }

  private guardarCarrito() {
    try {
      localStorage.setItem(this.STORAGE_CART_KEY, JSON.stringify(this.carrito));
    } catch {}
  }

  private guardarFavoritos() {
    try {
      localStorage.setItem(this.STORAGE_FAV_KEY, JSON.stringify(this.favoritosIds));
    } catch {}
  }

  private obtenerUsuariosRegistrados(): Usuario[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_USERS_LIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  iniciarSesion(correo: string, password: string): { ok: boolean; mensaje: string } {
    const correoLimpio = correo.trim().toLowerCase();
    const usuarios = this.obtenerUsuariosRegistrados();
    const existente = usuarios.find(u => u.correo.toLowerCase() === correoLimpio);

    if (existente) {
      if (existente.password && existente.password !== password) {
        return { ok: false, mensaje: 'La contraseña ingresada no coincide con la cuenta registrada.' };
      }
      this.usuarioActual = existente;
    } else {
      const nombreBase = correoLimpio.split('@')[0] || 'Cliente Maxi';
      const nombreFormateado = nombreBase.charAt(0).toUpperCase() + nombreBase.slice(1);
      this.usuarioActual = {
        nombre: nombreFormateado,
        correo: correoLimpio,
        nombreMascota: 'Max',
        tipoMascota: 'perro',
        direccion: 'Calle 100 # 15-20, Bogotá',
        telefono: '300 123 4567'
      };
    }

    localStorage.setItem(this.STORAGE_USER_KEY, JSON.stringify(this.usuarioActual));
    return { ok: true, mensaje: `¡Bienvenido de nuevo, ${this.usuarioActual.nombre}!` };
  }

  registrarUsuario(nuevo: Usuario): { ok: boolean; mensaje: string } {
    const correoLimpio = nuevo.correo.trim().toLowerCase();
    const usuarios = this.obtenerUsuariosRegistrados();

    const idx = usuarios.findIndex(u => u.correo.toLowerCase() === correoLimpio);
    const usuarioGuardado: Usuario = {
      ...nuevo,
      correo: correoLimpio
    };

    if (idx >= 0) {
      usuarios[idx] = usuarioGuardado;
    } else {
      usuarios.push(usuarioGuardado);
    }

    localStorage.setItem(this.STORAGE_USERS_LIST_KEY, JSON.stringify(usuarios));
    this.usuarioActual = usuarioGuardado;
    localStorage.setItem(this.STORAGE_USER_KEY, JSON.stringify(this.usuarioActual));

    return { ok: true, mensaje: `¡Cuenta creada con éxito! Bienvenido(a) ${usuarioGuardado.nombre}` };
  }

  actualizarPerfil(datos: Partial<Usuario>) {
    if (!this.usuarioActual) return;
    this.usuarioActual = { ...this.usuarioActual, ...datos };
    localStorage.setItem(this.STORAGE_USER_KEY, JSON.stringify(this.usuarioActual));

    const usuarios = this.obtenerUsuariosRegistrados();
    const idx = usuarios.findIndex(u => u.correo.toLowerCase() === this.usuarioActual!.correo.toLowerCase());
    if (idx >= 0) {
      usuarios[idx] = this.usuarioActual;
      localStorage.setItem(this.STORAGE_USERS_LIST_KEY, JSON.stringify(usuarios));
    }
  }

  cerrarSesion() {
    this.usuarioActual = null;
    localStorage.removeItem(this.STORAGE_USER_KEY);
  }

  esFavorito(productoId: number): boolean {
    return this.favoritosIds.includes(productoId);
  }

  toggleFavorito(productoId: number): boolean {
    const idx = this.favoritosIds.indexOf(productoId);
    let agregado = false;
    if (idx >= 0) {
      this.favoritosIds.splice(idx, 1);
    } else {
      this.favoritosIds.push(productoId);
      agregado = true;
    }
    this.guardarFavoritos();
    return agregado;
  }

  calcularPrecioPorPeso(producto: Producto, etiquetaPeso: string): number {
    const opcion = producto.pesos.find(p => p.etiqueta === etiquetaPeso);
    const mult = opcion ? opcion.multiplicador : 1;
    return Math.round((producto.precio * mult) / 500) * 500;
  }

  agregarAlCarrito(producto: Producto, pesoSeleccionado?: string, cantidad: number = 1) {
    const peso = pesoSeleccionado || (producto.pesos[1]?.etiqueta ?? producto.pesos[0].etiqueta);
    const precioUnitario = this.calcularPrecioPorPeso(producto, peso);

    const existente = this.carrito.find(
      item => item.producto.id === producto.id && item.pesoSeleccionado === peso
    );

    if (existente) {
      existente.cantidad += cantidad;
    } else {
      this.carrito.push({
        producto,
        pesoSeleccionado: peso,
        precioUnitario,
        cantidad
      });
    }
    this.guardarCarrito();
  }

  cambiarCantidad(index: number, delta: number) {
    const item = this.carrito[index];
    if (!item) return;
    item.cantidad += delta;
    if (item.cantidad <= 0) {
      this.carrito.splice(index, 1);
    }
    this.guardarCarrito();
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.guardarCarrito();
  }

  vaciarCarrito() {
    this.carrito = [];
    this.cuponAplicado = '';
    this.porcentajeDescuentoCupon = 0;
    this.guardarCarrito();
  }

  get totalItemsCarrito(): number {
    return this.carrito.reduce((acc, item) => acc + item.cantidad, 0);
  }

  get subtotalCarrito(): number {
    return this.carrito.reduce((acc, item) => acc + item.precioUnitario * item.cantidad, 0);
  }

  get costoEnvio(): number {
    const sub = this.subtotalCarrito;
    if (sub === 0) return 0;
    return sub >= 120000 ? 0 : 9500;
  }

  aplicarCupon(codigo: string): { ok: boolean; mensaje: string } {
    const limpio = codigo.trim().toUpperCase();
    if (limpio === 'MAXI10' || limpio === 'MASCOTA10') {
      this.cuponAplicado = limpio;
      this.porcentajeDescuentoCupon = 10;
      return { ok: true, mensaje: '¡Cupón del 10% de descuento aplicado!' };
    }
    if (limpio === 'MAXI20') {
      this.cuponAplicado = limpio;
      this.porcentajeDescuentoCupon = 20;
      return { ok: true, mensaje: '¡Súper cupón del 20% de descuento aplicado!' };
    }
    return { ok: false, mensaje: 'Cupón no válido. Prueba con MAXI10 o MAXI20.' };
  }

  get descuentoCupon(): number {
    return Math.round((this.subtotalCarrito * this.porcentajeDescuentoCupon) / 100);
  }

  get totalPagar(): number {
    return Math.max(0, this.subtotalCarrito - this.descuentoCupon + this.costoEnvio);
  }

  crearPedido(metodoPago: string, direccion: string): Pedido {
    const nuevoPedido: Pedido = {
      id: 'MF-' + Math.floor(100000 + Math.random() * 900000),
      fecha: new Date().toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: [...this.carrito],
      total: this.totalPagar,
      metodoPago,
      direccion: direccion || this.usuarioActual?.direccion || 'Dirección registrada',
      estado: 'En preparación'
    };

    this.pedidos.unshift(nuevoPedido);
    try {
      localStorage.setItem(this.STORAGE_ORDERS_KEY, JSON.stringify(this.pedidos));
    } catch {}

    this.vaciarCarrito();
    return nuevoPedido;
  }
}
