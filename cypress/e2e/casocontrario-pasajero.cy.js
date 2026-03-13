describe("Casos Contrarios — Pasajero", () => {
  const PASSENGER_EMAIL = "carloss@gmail.com";
  const DEFAULT_TIMEOUT = 20000;

  it("1. Login con contraseña incorrecta (pasajero)", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(PASSENGER_EMAIL);

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("ContraseñaMala999#");

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.get(".alert-danger", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.url().should("include", "/login");
  });

  it("2. Login con email no registrado", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("pasajero_falso_99999@gmail.com");

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("CualquierPass123#");

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.get(".alert-danger", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.url().should("include", "/login");
  });

  it("3. Login con campos vacíos no permite enviar", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();

    // El formulario no se envía gracias al atributo required de HTML
    cy.url().should("include", "/login");
    cy.get(".alert-danger").should("not.exist");
  });

  it("4. Acceso a ruta protegida sin sesión redirige a login", () => {
    cy.viewport(1280, 720);

    // Intentar ir directo al home de pasajero sin estar logueado
    cy.visit("/user-home", { timeout: DEFAULT_TIMEOUT });

    // Debe redirigir al login o a la home pública
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("satisfy", (url) => {
      return url.includes("/login") || url.endsWith("/");
    });
  });

  it("5. Pasajero no puede acceder al dashboard de admin", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    // Login como pasajero
    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(PASSENGER_EMAIL);

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("Diana123#");

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.url({ timeout: 30000 }).should("include", "/user-home");

    // Intentar navegar al dashboard de admin
    cy.visit("/dashboard/home", { timeout: DEFAULT_TIMEOUT });

    // No debe mostrar contenido de admin; debe redirigir
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("not.include", "/dashboard/home");
  });
});
