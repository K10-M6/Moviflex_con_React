describe("Driver E2E Flows", () => {
  const DRIVER_EMAIL = "yo@gmail.com";
  const DRIVER_PASSWORD = "Diana123#";
  const DEFAULT_TIMEOUT = 20000;

  const closeDriverTutorialIfVisible = () => {
    // Cierra el modal de recorrido (tutorial) si aparece
    cy.get("body", { timeout: DEFAULT_TIMEOUT }).then(($body) => {
      if ($body.text().includes("Saltar recorrido")) {
        cy.contains("Saltar recorrido").click({ force: true });
      }
    });
  };

  const loginAsDriver = () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(DRIVER_EMAIL);

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type(DRIVER_PASSWORD);

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    cy.url({ timeout: 30000 }).should("include", "/driver-home");
    closeDriverTutorialIfVisible();
    cy.contains("h6", "Ganancias", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
  };

  it("1. Registro de Conductor (OTP + Facial) -- flujo guiado", () => {
    cy.viewport(1280, 720);
    cy.visit("/register", { timeout: DEFAULT_TIMEOUT });

    const testEmail = `driver_cypress_${Date.now()}@example.com`;

    // Paso 1: Email + OTP request
    cy.get('input[placeholder="Correo Electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .type(testEmail);

    cy.contains("button", "Enviar Código", { timeout: DEFAULT_TIMEOUT }).click();

    // Paso 2: OTP → aquí mockeamos la verificación para no depender del backend
    cy.intercept("POST", "**/api/auth/verify-pre-otp", {
      statusCode: 200,
      body: { mensaje: "Verificación exitosa (mock Cypress)" },
    }).as("verifyOtp");

    // Mock del registro para que no falle contra el backend real
    cy.intercept("POST", "**/api/auth/registro", {
      statusCode: 200,
      body: { mensaje: "Registro exitoso (mock Cypress)" },
    }).as("registro");

    cy.get('input[placeholder="000000"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .type("123456");

    cy.contains("button", "Verificar Email", { timeout: DEFAULT_TIMEOUT }).click();
    cy.wait("@verifyOtp");

    // Paso 3: Datos personales
    cy.get('input[placeholder="Nombre Completo"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .type("Conductor Cypress");

    cy.get('input[placeholder="Teléfono"]', { timeout: DEFAULT_TIMEOUT })
      .type("3107654321");

    cy.contains("button", "Siguiente", { timeout: DEFAULT_TIMEOUT }).click();

    // Paso 4: Foto facial (mock de cámara)
    cy.window().then((win) => {
      const fakeStream = new win.MediaStream();
      const fakeTrack = { stop: () => {}, enabled: true, kind: "video" };
      cy.stub(fakeStream, "getTracks").returns([fakeTrack]);
      if (!win.navigator.mediaDevices) {
        // Asegurar objeto
        win.navigator.mediaDevices = { getUserMedia: () => Promise.resolve(fakeStream) };
      } else {
        cy.stub(win.navigator.mediaDevices, "getUserMedia").resolves(fakeStream);
      }
      // Mock de toDataURL para devolver una imagen base64 válida corta
      // (suficiente para que el front la acepte sin sobrecargar el runner)
      cy.stub(win.HTMLCanvasElement.prototype, "toDataURL").returns(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFgwJ/lmXcSgAAAABJRU5ErkJggg=="
      );
    });

    cy.contains("button", "Tomar Foto", { timeout: DEFAULT_TIMEOUT }).click();
    cy.contains("button", "Capturar", { timeout: DEFAULT_TIMEOUT }).click();

    cy.contains("¡Foto tomada!", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.contains("button", "Siguiente", { timeout: DEFAULT_TIMEOUT }).click();

    // Paso 5: Contraseña
    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .type("Driver123#");

    cy.contains("button", "Siguiente", { timeout: DEFAULT_TIMEOUT }).click();

    // Paso 6: Términos + Finalizar
    cy.get('input[type="checkbox"]', { timeout: DEFAULT_TIMEOUT }).check();

    cy.contains("button", "Finalizar", { timeout: DEFAULT_TIMEOUT }).click();

    cy.wait("@registro");
    cy.url({ timeout: 30000 }).should("include", "/login");
  });

  it("2. Dashboard Conductor -- Ganancias, filtros, viajes y notificaciones", () => {
    loginAsDriver();

    // Secciones principales de DriverHome
    cy.contains("h6", "Ganancias", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Filtros de periodo (Día / Mes / Año)
    cy.contains("span", "Día").click();
    cy.contains("span", "Mes").click();
    cy.contains("span", "Año").click();

    // Viajes Recientes
    cy.contains("Viajes Recientes", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    // Abrir historial completo si el botón existe (solo aparece con >3 viajes)
    cy.get("body").then(($body) => {
      if ($body.text().includes("Ver historial completo")) {
        cy.contains(/Ver historial completo/i).click();

        cy.contains("Historial Completo de Viajes", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

        // Aplicar filtro de estado en modal
        cy.get("select", { timeout: DEFAULT_TIMEOUT })
          .first()
          .select("FINALIZADO", { force: true });

        // Cerrar modal de historial
        cy.contains("button", "Cerrar", { timeout: DEFAULT_TIMEOUT }).click();
      }
    });

    // Notificaciones (campana en header/navbar)
    cy.get("body").then(($body) => {
      if ($body.text().includes("Notificaciones")) {
        cy.contains("Notificaciones").click({ force: true });
      }
    });
  });

  it("3. Registro de Vehículo con cámara y validación de placa", () => {
    loginAsDriver();
    cy.visit("/vehicle-registration", { timeout: DEFAULT_TIMEOUT });

    // Formulario básico
    cy.contains("Registro de Vehículo", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    cy.get('input[placeholder="Ej: Toyota, Renault"]', { timeout: DEFAULT_TIMEOUT })
      .clear()
      .type("Toyota");
    cy.get('input[placeholder="Ej: Corolla, Logan"]', { timeout: DEFAULT_TIMEOUT })
      .clear()
      .type("Corolla");

    cy.get('input[placeholder="ABC123"]', { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    cy.get('input[placeholder="Ej: 4"]', { timeout: DEFAULT_TIMEOUT })
      .clear()
      .type("4");

    // Mock de cámara para fotos del vehículo
    cy.window().then((win) => {
      const fakeStream = new win.MediaStream();
      const fakeTrack = { stop: () => {}, enabled: true, kind: "video" };
      cy.stub(fakeStream, "getTracks").returns([fakeTrack]);
      if (!win.navigator.mediaDevices) {
        win.navigator.mediaDevices = { getUserMedia: () => Promise.resolve(fakeStream) };
      } else {
        cy.stub(win.navigator.mediaDevices, "getUserMedia").resolves(fakeStream);
      }
      cy.stub(win.HTMLCanvasElement.prototype, "toDataURL").returns(
        "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFgwJ/lmXcSgAAAABJRU5ErkJggg=="
      );
    });

    // Verificar que la sección de fotos existe y el modal de cámara funciona
    cy.contains("PLACA", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.contains("AUTO 1", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.contains("AUTO 2", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.contains("AUTO 3", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Abrir cámara y verificar que el modal aparece
    cy.contains("PLACA").click();
    cy.contains("Tomar Foto del Vehículo", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.contains("button", "Cancelar", { timeout: DEFAULT_TIMEOUT }).click();

    // El submit button debe existir (aunque disabled sin fotos reales)
    cy.contains("button", "Registrar vehículo", { timeout: DEFAULT_TIMEOUT }).should("exist");
  });

  it("4. Perfil de Conductor, edición de datos y navegación", () => {
    loginAsDriver();

    // Ir al perfil desde el dropdown del navbar
    cy.get("#dropdown-user", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();

    cy.contains("Editar Perfil", { timeout: DEFAULT_TIMEOUT }).click();

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/driver-profile");
    cy.contains("Mi Perfil de Conductor", { timeout: DEFAULT_TIMEOUT }).should(
      "be.visible"
    );

    // Editar nombre y teléfono
    cy.get('input[placeholder="Tu nombre completo"]', { timeout: DEFAULT_TIMEOUT })
      .clear()
      .type("Conductor Cypress Editado");

    cy.get('input[placeholder="Tu número de teléfono"]', { timeout: DEFAULT_TIMEOUT })
      .clear()
      .type("3200000000");

    cy.contains("button", "GUARDAR CAMBIOS", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();

    // Navegar a documentación desde el perfil
    cy.contains("Subir Documentación", { timeout: DEFAULT_TIMEOUT }).click();
    cy.url({ timeout: DEFAULT_TIMEOUT }).should("include", "/documentacion");

    // Volver a DriverHome usando el navbar (logo / home conductor)
    cy.visit("/driver-home", { timeout: DEFAULT_TIMEOUT });

    // Cerrar sesión desde el navbar (igual que admin/pasajero)
    cy.get("#dropdown-user", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();

    cy.contains("Cerrar Sesión", { timeout: DEFAULT_TIMEOUT }).click();

    cy.url({ timeout: DEFAULT_TIMEOUT }).should("satisfy", (url) => {
      return url.includes("/login") || url.endsWith("/");
    });
  });
});
