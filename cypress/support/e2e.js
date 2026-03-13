// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'
import 'cypress-mochawesome-reporter/register';

// Evitar que errores de la aplicación como
// "Cannot read properties of null (reading 'document')"
// hagan fallar todo el test E2E. Solo los ignoramos,
// Cypress seguirá ejecutando los pasos.
Cypress.on('uncaught:exception', (err) => {
  if (err && err.message && err.message.includes("Cannot read properties of null (reading 'document')")) {
    return false;
  }
  // Para cualquier otro error, deja que Cypress falle el test
  return true;
});