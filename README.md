# 🐾 Maxi-Food — Solución Integral de Nutrición para Mascotas

**Maxi-Food** es una aplicación híbrida moderna enfocada en la nutrición especializada y el bienestar de las mascotas, ofreciendo una experiencia de comercio electrónico ágil, intuitiva y personalizada.

---

## 🚀 Solución Integral Maxi-Food

* **Motor Nutricional Inteligente:** Algoritmo que cruza parámetros biométricos (edad, especie, peso, alergias) con catálogo bromatológico.
* **Experiencia de Compra Fluida:** Catálogo, carrito persistente y confirmación de checkout sin salir de la misma aplicación móvil.
* **Arquitectura Híbrida Eficiente:** Desarrollada en Ionic + JavaScript, permitiendo ejecución nativa móvil en Android/iOS y distribución web.

---

## 👨‍💻 Autores

* **Cristian Camacho**
* **Diego Garzón**

---

## ✨ Funcionalidades Principales

* **Autenticación y Registro de Mascota:** Inicio de sesión, creación de cuenta con datos de la mascota (nombre, especie: perro/gato) y acceso rápido de demostración en 1 clic.
* **Catálogo Interactivo y Bromatológico:**
  * Búsqueda en tiempo real por nombre, marca, etapa o ingrediente.
  * Filtros por categoría (*Perros*, *Gatos*, *Snacks* y *Favoritos*) y ordenamiento dinámico (*Destacados*, *Menor precio*, *Mejor valorados*).
  * Ficha técnica en modal con análisis garantizado (*proteína*, *grasa*, *fibra*, *humedad*), ingredientes principales, beneficios y cálculo dinámico de precio según el peso del empaque (`1.5 kg`, `4 kg`, `10 kg`, etc.).
* **Carrito de Compras Persistente y Checkout:**
  * Almacenamiento persistente en `localStorage`.
  * Barra de progreso hacia **Envío Gratis** (compras $\ge \$120.000\text{ COP}$).
  * Canje de cupones promocionales (`MAXI10`, `MAXI20`).
  * Selección de método de pago (*Contraentrega*, *PSE / Nequi*, *Tarjeta*) e historial de pedidos dentro del perfil del usuario.

---

## 🛠️ Tecnologías Utilizadas

* **Framework UI:** [Ionic Framework v9](https://ionicframework.com/)
* **Frontend:** [Angular](https://angular.dev/) (Componentes *Standalone*) + TypeScript / JavaScript
* **Runtime Móvil:** [Capacitor](https://capacitorjs.com/) (Android / iOS / Web)
* **Estilos:** SCSS + Variables CSS personalizadas

---

## ⚙️ Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/ING-camacho2020/Maxi-food2.git
   cd Maxi-food2
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm start
   ```
   Luego abre en tu navegador: `http://localhost:4200/`

4. **Generar compilación de producción:**
   ```bash
   npm run build
   ```
