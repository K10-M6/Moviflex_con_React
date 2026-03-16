# Moviflex Frontend - Guía de Inicio Rápido

## 🎨 Descripción
Este es el cliente web de **Moviflex**, desarrollado con **React** y **Vite**. La aplicación permite a los usuarios buscar viajes, registrar vehículos, validar placas mediante IA y gestionar su perfil de forma interactiva.

## 🛠️ Tecnologías Principales
- **Framework:** React 18
- **Herramienta de Construcción:** Vite
- **Estilos:** Bootstrap y React-Bootstrap
- **Iconos:** Lucide-React y React-Icons
- **Mapas:** Leaflet y React-Leaflet
- **Comunicación API:** Axios
- **Tiempo Real:** Socket.io-client
- **Pruebas E2E:** Cypress

## 📋 Requisitos Previos
- Node.js (v18 o superior)
- El backend de Moviflex en ejecución para la funcionalidad completa.

## 🔧 Instalación y Configuración

1. **Navegar a la carpeta del proyecto:**
   ```bash
   cd Moviflex_con_React
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configuración de variables de entorno:**
   Crea un archivo `.env` (si es necesario para apuntar al backend):
   ```env
   VITE_API_URL=http://localhost:3000
   ```

## 🚀 Cómo Correr el Proyecto

- **Modo Desarrollo:**
  ```bash
  npm run dev
  ```
  La aplicación estará disponible usualmente en `http://localhost:5173`.

- **Construir para Producción:**
  ```bash
  npm run build
  ```

- **Previsualizar construcción:**
  ```bash
  npm run start
  ```

## 🧪 Pruebas E2E con Cypress
Para ejecutar las pruebas de interfaz:

- **Abrir la interfaz de Cypress:**
  ```bash
  npm run cypress:open
  ```

- **Ejecutar pruebas en la terminal:**
  ```bash
  npm run cypress:run
  ```

## 📂 Estructura Principal
- `src/components/`: Componentes reutilizables.
- `src/pages/`: Vistas principales de la aplicación.
- `src/services/`: Configuración de Axios para llamadas al backend.
- `cypress/`: Pruebas de integración y fin a fin.
- `public/`: Archivos estáticos.
