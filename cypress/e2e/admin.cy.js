describe("MOVIFLEXX_ADMINISTRADOR", () => {
  const ADMIN_EMAIL = "Janierjceron2044@gmail.com";
  const ADMIN_PASSWORD = "Arc11037!";
  const DEFAULT_TIMEOUT = 120000;

  const loginAsAdmin = () => {
    cy.viewport(1239, 729);
    // Ir directamente a la página de login usando baseUrl de Cypress
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/login");

    // Completar formulario de acceso
    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(ADMIN_EMAIL);

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(ADMIN_PASSWORD);

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    // Esperar a que cargue el dashboard del administrador
    cy.url({ timeout: 
        30000 }).should("include", "/dashboard/home");
    cy.contains("Gestión global de la plataforma MoviFlex", {
      timeout: DEFAULT_TIMEOUT,
    }).should("be.visible");
  };

  beforeEach(() => {
    loginAsAdmin();
  });

  it("1. Autenticación y Acceso -- Debe iniciar sesión correctamente como administrador", () => {
    cy.url().should("include", "/dashboard/home");
    cy.contains("Gestión global de la plataforma MoviFlex", {
      timeout: DEFAULT_TIMEOUT,
    }).should("be.visible");
  });

  it("2. Gestión de Usuarios y Entidades -- Debe visualizar Viajeros, Conductores, Usuarios y Vehículos", () => {
    // Viajeros
    cy.contains("button", "Viajeros", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/admin/viajeros");
    cy.contains("h1", "Lista de Viajeros", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Conductores
    cy.contains("button", "Conductores", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/admin/conductores");
    cy.contains("h1", "Lista de Conductores", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Usuarios
    cy.contains("button", "Usuarios", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/admin/usuarios");
    cy.contains("h1", "Lista de Usuarios", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Vehículos
    cy.contains("button", "Vehículos", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/admin/vehiculos");
    cy.contains("h1", "Lista de Vehículos", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
  });

  it("3. Procesos de Aprobación y Documentos -- Debe revisar Documentos y Solicitudes de Vehículos", () => {
    // Documentos
    cy.contains("button", "Documentos", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/admin/documentos");

    // La tabla/listado puede tardar, esperamos a que haya contenido o mensaje vacío
    cy.get("table", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Solicitudes de cambio / registro de vehículos
    cy.contains("button", "Solicitudes", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/admin/solicitudes-vehiculos");

    // Esperar a que cargue la tabla o mensaje de que no hay solicitudes
    cy.get("table", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
  });

  it("4. Reportes y Finalización -- Debe filtrar Reportes de Pago y cerrar sesión", () => {
    // Ir a reportes de pago
    cy.contains("button", "Reportes de Pago", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/admin/reportes-pago");

    // Esperar a que la vista de reportes se renderice
    cy.contains("Reportes de Pago", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Aplicar filtros básicos (estado y mes) para validar que los controles responden
    cy.get('select', { timeout: DEFAULT_TIMEOUT }).first().select("PENDIENTE");

    cy.get('input[type="month"]', { timeout: DEFAULT_TIMEOUT })
      .clear()
      .type("2026-08");

    // Botón de limpiar filtros (si existe) debería estar visible
    cy.contains("button", "Limpiar filtros", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Cerrar sesión desde el header (botón CERRAR SESIÓN en sidebar o menú de usuario)
    cy.contains("button", "CERRAR SESIÓN", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();

    // Debería regresar a la pantalla pública (home o login)
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("satisfy", (url) => {
      return url.includes("/login") || url.endsWith("/");
    });
  });
});
