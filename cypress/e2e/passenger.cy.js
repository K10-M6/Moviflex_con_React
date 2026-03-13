describe("MOVIFLEXX_PASAJERO", () => {
  const PASSENGER_EMAIL = "carloss@gmail.com";
  const PASSENGER_PASSWORD = "Diana123#";
  const DEFAULT_TIMEOUT = 20000;

  const loginAsPassenger = () => {
    cy.viewport(1123, 729);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/login");

    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(PASSENGER_EMAIL);

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(PASSENGER_PASSWORD);

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.url({ timeout: 30000 }).should("include", "/user-home");
    cy.contains("Gestiona tus viajes y pagos en MoviFlex", {
      timeout: DEFAULT_TIMEOUT,
    }).should("be.visible");
  };

  beforeEach(() => {
    loginAsPassenger();
  });

  it("1. Dashboard Gastos, Comisiones y Filtros -- Debe mostrar gráficos y filtros dinámicos", () => {
    // Verifica textos principales del dashboard
    cy.contains("Hábitos de Gasto", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );
    cy.contains("Frecuencia de Viajes", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );
    cy.contains("Resumen de Actividad", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );
    cy.contains("Pagos Recientes", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    // Cambiar de periodo en los filtros (Día / Mes / Año)
    cy.contains("span", "Día").click();
    cy.contains("span", "Mes").click();
    cy.contains("span", "Año").click();
  });

  it("2. Historial Detalle de Viaje mediante Modal -- Debe abrir historial y detalle de un viaje", () => {
    // Abrir modal de viajes desde 'Ver Todos'
    cy.contains("Viajes Recientes", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    cy.contains("button", "Ver Todos", { timeout: DEFAULT_TIMEOUT }).click();

    // En el modal de 'Mis Viajes' usar el filtro de estado
    cy.contains("Mis Viajes", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    cy.get("select", { timeout: DEFAULT_TIMEOUT })
      .first()
      .select("FINALIZADO", { force: true });

    // Si hay filas, hacer clic en la primera para ver el detalle
    cy.get("div")
      .contains("Viaje #", { matchCase: false })
      .first()
      .click({ force: true });

    // Detalle de viaje en modal
    cy.contains("Detalle del Viaje", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    cy.contains("button", "Cerrar", { timeout: DEFAULT_TIMEOUT }).click();
  });

  it("3. Perfil Verificación de Datos de Pasajero -- Debe navegar al perfil y volver", () => {
    // Abrir menú de usuario en el navbar
    cy.get("#dropdown-user", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();

    // Ir a 'Editar Perfil' (perfil de pasajero)
    cy.contains("Editar Perfil", { timeout: DEFAULT_TIMEOUT }).click();

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/profile");

    cy.contains("Mi Perfil de Pasajero", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    // Volver al inicio de pasajero
    cy.contains("button", "Volver al Inicio", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/user-home");
  });
});
