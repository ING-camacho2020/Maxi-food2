/**
 * @file terceros.service.ts
 * @description Servicio para el consumo de APIs Externas de Terceros en la lógica de negocio de Maxi-Food:
 * - API de Clima en Tiempo Real (Open-Meteo REST API) con Recomendación Nutricional Inteligente para mascotas.
 */

import { Injectable } from '@angular/core';

export interface ClimaMascota {
  temperatura: number;
  humedad: number;
  condicion: string;
  icono: string;
  consejoNutricional: string;
  ciudad: string;
}

@Injectable({
  providedIn: 'root'
})
export class TercerosService {
  constructor() {}

  // =========================================================================
  // API DE CLIMA Y NUTRICIÓN INTELIGENTE (Open-Meteo REST API)
  // =========================================================================

  /**
   * Consume la API pública de Open-Meteo para obtener temperatura y humedad en tiempo real
   * y generar un consejo nutricional veterinario contextual para la mascota.
   */
  public async consultarClimaYConsejo(lat: number = 4.6761, lon: number = -74.0483): Promise<ClimaMascota> {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code`;
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Error al conectar con Open-Meteo');

      const data = await resp.json();
      const current = data.current || {};
      const temp = Math.round(current.temperature_2m ?? 19);
      const hum = Math.round(current.relative_humidity_2m ?? 65);
      const code = current.weather_code ?? 0;

      let condicion = 'Despejado / Agradable';
      let icono = '☀️';
      let consejo = 'Día agradable para pasear y disfrutar con tu mascota.';

      if (temp >= 24) {
        condicion = 'Cálido / Soleado';
        icono = '☀️';
        consejo = '💧 Clima cálido: Aumenta la hidratación de tu mascota. Te recomendamos Dieta BARF o Snacks Cremosos con alto contenido de agua.';
      } else if (temp <= 14 || code >= 50) {
        condicion = code >= 50 ? 'Lluvioso / Húmedo' : 'Fresco / Frío';
        icono = code >= 50 ? '🌧️' : '🧥';
        consejo = '⚡ Clima fresco: Las mascotas consumen más calorías para conservar su temperatura. Es un momento ideal para alimento con proteína premium.';
      } else {
        condicion = 'Templado / Óptimo';
        icono = '🌤️';
        consejo = '🐾 Clima perfecto para actividad física. Refuerza el entrenamiento con nuestras Galletas Horneadas Maxi-Bites.';
      }

      return {
        temperatura: temp,
        humedad: hum,
        condicion,
        icono,
        consejoNutricional: consejo,
        ciudad: 'Bogotá D.C.'
      };
    } catch (e) {
      console.warn('Fallback de clima local:', e);
      return {
        temperatura: 19,
        humedad: 68,
        condicion: 'Templado',
        icono: '🌤️',
        consejoNutricional: '🐾 Clima óptimo: Cuida la nutrición equilibrada de tu mascota con croquetas ricas en Omega 3 y proteína natural.',
        ciudad: 'Bogotá D.C.'
      };
    }
  }
}
