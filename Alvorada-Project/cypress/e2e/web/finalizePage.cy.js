describe('Finalize Document Page', () => {
  const baseUrl = 'http://localhost:8084'
  const docId = 'doc_reviewed'
  const token = 'my-secret-token'

  beforeEach(() => {
    cy.visit(baseUrl)

    cy.get('#docId').clear().type(docId)
    cy.get('#token').clear().type(token)
  })

  // ------------------------------------------------
  // 1. Test Click Finalize button with success
  // ------------------------------------------------
  it('Click "Finalize Document" button with success', () => {
    cy.contains('button', 'Finalize Document').click()

    cy.get('#output')
      .should('be.visible')
      .and('contain', 'finalized')
  })

  // ------------------------------------------------
  // 2. Test Click Finalize button two times
  // ------------------------------------------------
  it('Click "Finalize Document" button two times', () => {
    cy.contains('button', 'Finalize Document').click()
    cy.contains('button', 'Finalize Document').click()

    cy.get('#output')
      .should('be.visible')
      .and('contain', 'finalized')
  })
})