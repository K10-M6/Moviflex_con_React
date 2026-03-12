describe('Driver E2E Flows', () => {
    const driverEmail = 'yo@gmail.com';
    const driverPassword = 'Diana123#';

    beforeEach(() => {
        cy.viewport(1280, 720);
        cy.visit('/');
    });

    it('1. Registro de Conductor (Flujo Completo con Cámara y OTP)', () => {
        cy.visit('/register');
        const testEmail = `driver_cypress_${Date.now()}@example.com`;

        // Paso 1: Email
        cy.get('input[placeholder="Correo Electrónico"]').type(testEmail);
        cy.intercept('POST', '**/api/auth/request-pre-otp').as('requestOtp');
        cy.get('button').contains('Enviar Código').click();
        cy.wait('@requestOtp');

        // Paso 2: OTP (Mokeado en backend o interceptado)
        cy.intercept('POST', '**/api/auth/verify-pre-otp').as('verifyOtp');
        cy.get('input[placeholder="000000"]').type('123456'); // Asumimos que el backend de prueba acepta 123456 o lo interceptamos
        cy.get('button').contains('Verificar Email').click();
        cy.wait('@verifyOtp');

        // Paso 3: Datos Personales
        cy.get('input[placeholder="Nombre Completo"]').type('Cypress Driver Profundo');
        cy.get('input[placeholder="Teléfono"]').type('3107654321');
        cy.get('button').contains('Siguiente').click();

        // Paso 4: Foto con Cámara Mokeada
        cy.window().then((win) => {
            const fakeStream = new MediaStream();
            const fakeTrack = { stop: () => { }, enabled: true, kind: 'video' };
            cy.stub(fakeStream, 'getTracks').returns([fakeTrack]);
            cy.stub(win.navigator.mediaDevices, 'getUserMedia').resolves(fakeStream);
            win.HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
        });

        cy.get('button').contains('Tomar Foto').click();
        cy.get('.modal-body').should('be.visible');
        cy.get('button').contains('Capturar').click({ force: true });
        cy.contains('¡Foto tomada!').should('be.visible');
        cy.get('button').contains('Siguiente').click();

        // Paso 5: Contraseña
        cy.get('input[placeholder="Contraseña"]').type('Driver123#');
        cy.get('button').contains('Siguiente').click();

        // Paso 6: Términos y Finalizar
        cy.get('input[type="checkbox"]').check();
        cy.get('button').contains('Finalizar').click();
        cy.url().should('include', '/login');
    });

    it('2. Dashboard: Ganancias, Comisiones y Filtros', () => {
        cy.login(driverEmail, driverPassword);

        // Verificar el toggle de disponibilidad
        cy.get('button').contains(/Conectado|Desconectado/).then($btn => {
            const initialText = $btn.text();
            cy.wrap($btn).click();
            cy.wait(500);
            cy.get('button').contains(/Conectado|Desconectado/).invoke('text').should('not.eq', initialText);
        });

        // Verificar Tarjetas de Ganancias
        cy.contains('Ganancias').should('be.visible');
        cy.contains('Comisión').should('be.visible');

        // Interactuar con Filtros de Tiempo
        cy.get('button').contains('Mes').click();
        cy.wait(500);
        cy.get('button').contains('Año').click();
        cy.wait(500);
        cy.get('button').contains('Día').click();
    });

    it('3. Registro de Vehículo y Documentos', () => {
        cy.login(driverEmail, driverPassword);
        cy.visit('/vehicle-registration');

        // Formulario de vehículo
        cy.get('input[placeholder*="Marca"]').type('Toyota');
        cy.get('input[placeholder*="Modelo"]').type('Hilux');
        cy.get('input[placeholder*="Placa"]').type('CYP123');
        cy.get('select').first().select('Camioneta');
        cy.get('input[placeholder*="Año"]').type('2024');
        cy.get('select').last().select('Negro');

        // Subida de Documentos (Mock de archivos)
        const dummyFile = { contents: 'dummy', fileName: 'test.pdf', mimeType: 'application/pdf' };
        cy.get('input[type="file"]').eq(0).selectFile(dummyFile, { force: true }); // SOAT
        cy.get('input[type="file"]').eq(1).selectFile(dummyFile, { force: true }); // Tarjeta
        cy.get('input[type="file"]').eq(2).selectFile(dummyFile, { force: true }); // Licencia

        cy.get('button').contains('Enviar Solicitud').click();
        // cy.contains('Solicitud enviada exitosamente').should('be.visible');
    });
});
