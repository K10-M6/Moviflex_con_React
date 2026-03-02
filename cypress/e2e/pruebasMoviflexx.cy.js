describe('Moviflex E2E', () => {
    const adminEmail = 'Janierjceron2044@gmail.com';
    const adminPassword = 'Arc11037!';

    beforeEach(() => {
        cy.viewport(1280, 720);
    });

    it('1. Abrir la página de inicio', () => {
        cy.visit('https://moviflexconreact-production.up.railway.app');
    });

    it('2. Iniciar Sesión y Verificar sesión', () => {
        cy.visit('/login');

        // Use correct selectors from production site
        cy.get('input[placeholder="Correo electrónico"]').type(adminEmail);
        cy.get('input[placeholder="Contraseña"]').type(adminPassword);

        cy.intercept('POST', '**/api/auth/login').as('loginRequest');

        cy.get('button').contains('Iniciar Sesión').click();

        cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

        cy.url().should('include', '/dashboard/home');
        cy.get('#dropdown-user').should('be.visible');
    });

    it('3. Realizar un registro mediante un formulario', () => {
        cy.visit('/register');


        cy.get('input[placeholder="Nombre Completo"]').type('Test User AI');
        cy.get('input[placeholder="Correo Electrónico"]').type(`test_ai_${Date.now()}@example.com`);
        cy.get('input[placeholder="Teléfono"]').type('3001234567');
        cy.get('button').contains('Siguiente').click();

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
        cy.get('input[placeholder="Contraseña"]').type('TestPass123!');
        cy.get('button').contains('Siguiente').click();


        cy.get('input[type="checkbox"]').check();
        cy.get('button').contains('Finalizar').should('be.visible');
    });

    it('4. Consultar un elemento registrado (Admin Usuarios)', () => {
        cy.visit('/login');
        cy.get('input[placeholder="Correo electrónico"]').type(adminEmail);
        cy.get('input[placeholder="Contraseña"]').type(adminPassword);
        cy.get('button').contains('Iniciar Sesión').click();

       
        cy.intercept('GET', '**/api/auth/**').as('getUsers');

        cy.visit('/admin/usuarios');

        cy.wait('@getUsers').its('response.statusCode').should('eq', 200);

        cy.get('table').should('be.visible');
        cy.get('tbody tr').should('have.length.at.least', 1);

        cy.contains('td', "test_ai_1772488120105@example.com").should('be.visible');
    });

    it('5. Cerrar la sesión', () => {
        cy.visit('/login');
        cy.get('input[placeholder="Correo electrónico"]').type(adminEmail);
        cy.get('input[placeholder="Contraseña"]').type(adminPassword);
        cy.get('button').contains('Iniciar Sesión').click();

        cy.url().should('include', '/dashboard/home');

        cy.get('#dropdown-user').should('be.visible').click();

           
        cy.get('.dropdown-item').contains('Cerrar sesión').click();

        cy.url().should('include', 'moviflexconreact-production.up.railway.app');
        cy.url().should('not.include', '/dashboard');
    });
});
