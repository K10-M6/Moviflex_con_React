describe("Casos Contrarios — Conductor", () => {
  const DEFAULT_TIMEOUT = 20000;

  it("1. Login con contraseña incorrecta", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("yo@gmail.com");

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("ContraseñaMala999#");

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    // Debe mostrar alerta de error y quedarse en /login
    cy.get(".alert-danger", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.url().should("include", "/login");
  });

  it("2. Login con email no registrado", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    cy.get('input[placeholder="Correo electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("noexiste99999@gmail.com");

    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .clear()
      .type("CualquierPass123#");

    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.enabled")
      .click();

    // Debe mostrar alerta de error y quedarse en /login
    cy.get(".alert-danger", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.url().should("include", "/login");
  });

  it("3. Login con campos vacíos no permite enviar", () => {
    cy.viewport(1280, 720);
    cy.visit("/login", { timeout: DEFAULT_TIMEOUT });

    // Sin llenar nada, el botón existe pero HTML required previene submit
    cy.contains("button", "Iniciar Sesión", { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .click();

    // El formulario no debe enviar; seguimos en /login
    cy.url().should("include", "/login");

    // No debe aparecer alerta de error (porque el form nunca se envió)
    cy.get(".alert-danger").should("not.exist");
  });

  it("4. Registro — correo ya registrado", () => {
    cy.viewport(1280, 720);
    cy.visit("/register", { timeout: DEFAULT_TIMEOUT });

    // Interceptar OTP request para simular que el correo ya existe
    cy.intercept("POST", "**/api/auth/request-pre-otp", {
      statusCode: 400,
      body: { error: "El usuario ya existe con ese correo electrónico." },
    }).as("otpDuplicado");

    cy.get('input[placeholder="Correo Electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .type("yo@gmail.com");

    cy.contains("button", "Enviar Código", { timeout: DEFAULT_TIMEOUT }).click();

    cy.wait("@otpDuplicado");

    // Debe mostrar toast de error — verificamos que no avance al paso 2
    cy.contains("Paso 1 de 6", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
  });

  it("5. Registro — OTP incorrecto", () => {
    cy.viewport(1280, 720);
    cy.visit("/register", { timeout: DEFAULT_TIMEOUT });

    // Mock: OTP request exitoso
    cy.intercept("POST", "**/api/auth/request-pre-otp", {
      statusCode: 200,
      body: { mensaje: "Código enviado (mock)" },
    }).as("otpRequest");

    // Mock: OTP verificación falla
    cy.intercept("POST", "**/api/auth/verify-pre-otp", {
      statusCode: 400,
      body: { error: "Código incorrecto o expirado." },
    }).as("otpVerifyFail");

    const testEmail = `test_negativo_${Date.now()}@example.com`;

    cy.get('input[placeholder="Correo Electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .type(testEmail);

    cy.contains("button", "Enviar Código", { timeout: DEFAULT_TIMEOUT }).click();
    cy.wait("@otpRequest");

    // Paso 2: ingresar OTP incorrecto
    cy.get('input[placeholder="000000"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .type("999999");

    cy.contains("button", "Verificar Email", { timeout: DEFAULT_TIMEOUT }).click();
    cy.wait("@otpVerifyFail");

    // Debe quedarse en paso 2 (no avanza al 3)
    cy.contains("Paso 2 de 6", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
  });

  it("6. Registro — contraseña débil (validación client-side)", () => {
    cy.viewport(1280, 720);
    cy.visit("/register", { timeout: DEFAULT_TIMEOUT });

    // Mock OTP request y verify para llegar rápido al paso 5
    cy.intercept("POST", "**/api/auth/request-pre-otp", {
      statusCode: 200,
      body: { mensaje: "Código enviado (mock)" },
    }).as("otpReq");

    cy.intercept("POST", "**/api/auth/verify-pre-otp", {
      statusCode: 200,
      body: { mensaje: "Verificación exitosa (mock)" },
    }).as("otpVerify");

    const testEmail = `test_pwd_${Date.now()}@example.com`;

    // Paso 1: email
    cy.get('input[placeholder="Correo Electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .type(testEmail);
    cy.contains("button", "Enviar Código").click();
    cy.wait("@otpReq");

    // Paso 2: OTP
    cy.get('input[placeholder="000000"]', { timeout: DEFAULT_TIMEOUT })
      .type("123456");
    cy.contains("button", "Verificar Email").click();
    cy.wait("@otpVerify");

    // Paso 3: datos personales
    cy.get('input[placeholder="Nombre Completo"]', { timeout: DEFAULT_TIMEOUT })
      .type("Test Negativo");
    cy.get('input[placeholder="Teléfono"]').type("3001234567");
    cy.contains("button", "Siguiente").click();

    // Paso 4: foto (mock cámara y capturar)
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
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFgwJ/lmXcSgAAAABJRU5ErkJggg=="
      );
    });

    cy.contains("button", "Tomar Foto", { timeout: DEFAULT_TIMEOUT }).click();
    cy.contains("button", "Capturar", { timeout: DEFAULT_TIMEOUT }).click();
    cy.contains("¡Foto tomada!", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.contains("button", "Siguiente", { timeout: DEFAULT_TIMEOUT }).click();

    // Paso 5: contraseña — probar con contraseña muy corta
    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .should("be.visible")
      .type("abc");

    cy.contains("Mínimo 8 caracteres", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // Limpiar y probar sin mayúscula
    cy.get('input[placeholder="Contraseña"]').clear().type("abcdefgh");
    cy.contains("Debe incluir una mayúscula", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // El botón "Siguiente" debe estar deshabilitado
    cy.contains("button", "Siguiente").should("be.disabled");
  });

  it("7. Registro — no acepta términos y condiciones", () => {
    cy.viewport(1280, 720);
    cy.visit("/register", { timeout: DEFAULT_TIMEOUT });

    // Mock OTP para llegar al paso 6 rápidamente
    cy.intercept("POST", "**/api/auth/request-pre-otp", {
      statusCode: 200,
      body: { mensaje: "Código enviado (mock)" },
    }).as("otpReq");

    cy.intercept("POST", "**/api/auth/verify-pre-otp", {
      statusCode: 200,
      body: { mensaje: "Verificación exitosa (mock)" },
    }).as("otpVerify");

    const testEmail = `test_terms_${Date.now()}@example.com`;

    // Paso 1
    cy.get('input[placeholder="Correo Electrónico"]', { timeout: DEFAULT_TIMEOUT })
      .type(testEmail);
    cy.contains("button", "Enviar Código").click();
    cy.wait("@otpReq");

    // Paso 2
    cy.get('input[placeholder="000000"]', { timeout: DEFAULT_TIMEOUT }).type("123456");
    cy.contains("button", "Verificar Email").click();
    cy.wait("@otpVerify");

    // Paso 3
    cy.get('input[placeholder="Nombre Completo"]', { timeout: DEFAULT_TIMEOUT })
      .type("Test Términos");
    cy.get('input[placeholder="Teléfono"]').type("3009876543");
    cy.contains("button", "Siguiente").click();

    // Paso 4 (foto)
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
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFgwJ/lmXcSgAAAABJRU5ErkJggg=="
      );
    });

    cy.contains("button", "Tomar Foto", { timeout: DEFAULT_TIMEOUT }).click();
    cy.contains("button", "Capturar", { timeout: DEFAULT_TIMEOUT }).click();
    cy.contains("¡Foto tomada!", { timeout: DEFAULT_TIMEOUT }).should("be.visible");
    cy.contains("button", "Siguiente", { timeout: DEFAULT_TIMEOUT }).click();

    // Paso 5 (contraseña válida)
    cy.get('input[placeholder="Contraseña"]', { timeout: DEFAULT_TIMEOUT })
      .type("ValidPass123#");
    cy.contains("button", "Siguiente").click();

    // Paso 6: Sin marcar checkbox de términos
    cy.contains("Paso 6 de 6", { timeout: DEFAULT_TIMEOUT }).should("be.visible");

    // El botón "Finalizar" debe estar deshabilitado sin aceptar términos
    cy.contains("button", "Finalizar", { timeout: DEFAULT_TIMEOUT }).should("be.disabled");
  });
});
