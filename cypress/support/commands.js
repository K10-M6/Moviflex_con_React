// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login');
    cy.get('input[placeholder="Correo electrónico"]').type(email);
    cy.get('input[placeholder="Contraseña"]').type(password);
    
    cy.intercept('POST', '**/api/auth/login').as('loginReq');
    cy.get('button').contains('Iniciar Sesión').click();
    cy.wait('@loginReq');
    cy.url().should('include', '/dashboard/home');
});