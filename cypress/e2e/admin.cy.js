describe('Admin E2E Flows', () => {
    const adminEmail = 'Janierjceron2044@gmail.com';
    const adminPassword = 'Arc11037!';

    beforeEach(() => {
        cy.viewport(1440, 900);
        cy.visit('/');
    });

    it('1. Dashboard Global y Usuarios', () => {
        cy.login(adminEmail, adminPassword);
        
        // Estadísticas
        cy.contains('Ganancias Totales Plataforma').should('be.visible');
        
        // Gestión de Usuarios: Desactivar/Reactivar
        cy.visit('/admin/usuarios');
        cy.get('input[placeholder*="Buscar"]').type('carloss@gmail.com');
        
        cy.get('table').contains('carloss@gmail.com').parents('tr').within(() => {
            cy.get('button').first().click(); // Botón de estado/editar
        });

        // Simular cambio de estado en el modal o menú
        cy.contains(/Desactivar|Inactivar/).click();
        // cy.contains('Usuario actualizado').should('be.visible');
        
        // Reactivar
        cy.get('table').contains('carloss@gmail.com').parents('tr').within(() => {
            cy.get('button').first().click();
        });
        cy.contains(/Activar/).click();
    });

    it('2. Aprobación Profunda de Vehículos (Modal + Obs)', () => {
        cy.login(adminEmail, adminPassword);
        cy.visit('/admin/vehicle-requests');

        // Si hay solicitudes, interactuamos con la primera
        cy.get('body').then(($body) => {
            if ($body.find('button:contains("Revisar")').length > 0) {
                cy.get('button').contains('Revisar').first().click();
                
                // Interactuar con el modal de revisión
                cy.get('.modal-title').contains('Detalle de Modificación').should('be.visible');
                cy.get('textarea[placeholder*="motivo"]').type('Aprobado mediante pruebas automatizadas Cypress');
                
                // Aprobar
                cy.get('button').contains('Aprobar y Aplicar').click();
                cy.wait(1000);
            } else {
                cy.log('No hay solicitudes de vehículos pendientes para probar.');
            }
        });
    });

    it('3. Validación de Documentos: Tabla y Modal de Imagen', () => {
        cy.login(adminEmail, adminPassword);
        cy.visit('/admin/documents');

        // Usar filtros de búsqueda
        cy.get('input[placeholder*="Buscar"]').type('Cedula');
        cy.wait(500);

        // Abrir imagen
        cy.get('button').contains('Ver Imagen').first().click();
        cy.get('.modal-body img').should('be.visible');
        cy.get('button').contains('Cerrar').click();

        // Cambiar estado desde la tabla
        cy.get('table tbody tr').first().within(() => {
            cy.get('button').contains(/Aprobar|Rechazar/).click();
        });
        // cy.contains('Documento actualizado').should('be.visible');
    });

    it('4. Reportes de Pago y Navegación', () => {
        cy.login(adminEmail, adminPassword);
        cy.visit('/admin/reportes-pago');
        cy.contains('Reportes de Pago').should('be.visible');
        cy.get('table').should('exist');
    });
});
