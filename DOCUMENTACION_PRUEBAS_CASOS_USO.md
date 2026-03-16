# Documentación de Pruebas y Casos de Uso - Frontend Moviflex

## 🧪 Estrategia de Pruebas (Frontend)

El frontend utiliza **Cypress** para realizar pruebas de extremo a extremo (E2E), asegurando que el flujo del usuario sea correcto desde la interfaz.

### Pruebas E2E (Cypress)
Las pruebas están diseñadas para validar la experiencia del usuario final:

- **Flujos de Usuario:**
    - Prueba de registro de usuario completo, incluyendo la navegación entre pasos.
    - Inicio de sesión con validación de redirección al dashboard.
- **Interfaz de Mapas:**
    - Visualización de rutas en Leaflet.
    - Selección automática de paradas al interactuar con el mapa.
- **Interactividad:**
    - Funcionalidad de los buscadores de viajes.
    - Responsive design (validación de carga en diferentes tamaños de pantalla).

**Comandos de ejecución:**
```bash
# Abrir panel interactivo
npm run cypress:open

# Ejecutar en modo headless (consola)
npm run cypress:run
```

---

## 📋 Casos de Uso de Usuario Final

### 1. Experiencia del Pasajero
- **CU01 - Búsqueda de Viajes:** Filtrado de viajes por origen, destino y fecha.
- **CU02 - Selección de Paradas:** El pasajero puede elegir puntos de subida y bajada específicos dentro de una ruta.
- **CU03 - Seguimiento de Viaje:** Visualización en tiempo real del estado del viaje y la ubicación estimada de las paradas.

### 2. Experiencia del Conductor
- **CU04 - Panel de Control (Dashboard):** Visualización de estadísticas de viajes realizados y ganancias estimadas.
- **CU05 - Gestión de Vehículos:** Interfaz para subir fotos y documentos para la validación de seguridad.
- **CU06 - Publicación de Ofertas:** Formulario intuitivo para crear nuevos viajes basados en rutas predefinidas.

### 3. Interacción y Feedback
- **CU07 - Chat de Viaje:** Interfaz de mensajería fluida para coordinar con el conductor/pasajero.
- **CU08 - Calificación del Servicio:** Formulario de evaluación con estrellas y comentarios al finalizar la experiencia.
- **CU09 - Notificaciones en App:** Recepción de alertas sobre cambios de estado en las reservas o nuevos mensajes.
