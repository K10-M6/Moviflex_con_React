describe('Initial Test', () => {
  it('Visits the app root url', () => {
    cy.visit('/')
    cy.contains('h1', 'Moviflex') // Example text to check
  })
})
