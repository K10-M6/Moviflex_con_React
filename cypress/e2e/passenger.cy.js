describe('Passenger E2E Flows', () => {
    const passengerEmail = 'carloss@gmail.com';
    const passengerPassword = 'Diana123#';

    beforeEach(() => {
        cy.viewport('iphone-x');
        cy.visit('/');
    });

    it('1. Dashboard: Gastos, Frecuencia y Filtros Dinámicos', () => {
        cy.login(passengerEmail, passengerPassword);

        // Verificar cards de resumen
        cy.contains('Total Gastado').should('be.visible');
        cy.contains('Viajes Totales').should('be.visible');

        // Probar Filtros y verificar cambios en el texto del periodo
        cy.get('button').contains('Mes').click();
        cy.contains(/Mes|Ene|Feb|Mar|Abr|May|Jun|Jul|Ago|Sep|Oct|Nov|Dic/).should('be.visible');
        
        cy.get('button').contains('Año').click();
        cy.contains(new Date().getFullYear().toString()).should('be.visible');

        cy.get('button').contains('Día').click();
        cy.contains('Hoy').should('be.visible');
    });

    it('2. Historial: Detalle de Viaje mediante Modal', () => {
        cy.login(passengerEmail, passengerPassword);

        // Esperar a que la lista de viajes cargue
        cy.contains('Viajes Recientes').should('be.visible');

        // Click en un viaje de la lista
        cy.get('div[style*="cursor: pointer"]').first().click();

        // Verificar contenido del modal
        cy.get('.modal-content').should('be.visible');
        cy.get('.modal-title').contains('Detalle del Viaje');
        cy.contains('Información del Trayecto').should('be.visible');
        
        // Cerrar el modal
        cy.get('button').contains('Cerrar').click();
        cy.get('.modal-content').should('not.exist');
    });

    it('3. Perfil: Verificación y Edición de Datos', () => {
        cy.login(passengerEmail, passengerPassword);
        cy.visit('/user/profile');

        cy.contains('Mi Perfil').should('be.visible');
        
        // Verificar que los campos no estén vacíos
        cy.get('input[placeholder="Nombre Completo"]').should('have.value', 'Carlos Pasajero');
        
        // Intentar editar el nombre
        cy.get('input[placeholder="Nombre Completo"]').clear().type('Carlos Editado Cypress');
        // cy.get('button').contains('Guardar Cambios').click();
        // cy.contains('Perfil actualizado').should('be.visible');
    });
});
