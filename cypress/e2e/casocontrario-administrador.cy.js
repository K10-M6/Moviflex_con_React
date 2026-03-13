describe("Casos Contrarios — Administrador", () => {
  const ADMIN_EMAIL = "Janierjceron2044@gmail.com";
  const DEFAULT_TIMEOUT = 20000;

  it("1. Login con contraseña incorrecta (admin)", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(ADMIN_EMAIL);

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("ContraseñaMala999!");

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
      .type("admin_falso_99999@gmail.com");

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("CualquierPass123!");

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

    // HTML required previene el envío
    cy.url().should("include", "/login");
    cy.get(".alert-danger").should("not.exist");
  });

  it("4. Acceso a ruta protegida de admin sin sesión redirige a login", () => {
    cy.viewport(1280, 720);

    // Intentar ir directo al dashboard sin estar logueado
    cy.visit("/dashboard/home", { timeout: DEFAULT_TIMEOUT });

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("satisfy", (url) => {
      return url.includes("/login") || url.endsWith("/");
    });
  });

  it("5. Conductor no puede acceder al dashboard de admin", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    // Login como conductor
    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("yo@gmail.com");

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("Diana123#");

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.url({ timeout: 30000 }).should("include", "/driver-home");

    // Intentar navegar al dashboard de admin
    cy.visit("/dashboard/home", { timeout: DEFAULT_TIMEOUT });

    // No debe quedarse en el dashboard de admin
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("not.include", "/dashboard/home");
  });
});
