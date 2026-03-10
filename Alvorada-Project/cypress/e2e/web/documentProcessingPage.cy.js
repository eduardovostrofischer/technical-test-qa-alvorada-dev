describe('Document Processing Page', () => {
  const baseUrl = 'http://localhost:8081'
  const documentId = 'doc_8f3a92k'

  beforeEach(() => {
    cy.visit(baseUrl)
    cy.get('#documentId').clear().type(documentId)
  })

  function clickProcess() {
    cy.contains('button', 'Start Processing').click()
  }

  function getOutput() {
    return cy.get('#output')
  }

  // 1. Happy Path
  it('1. Process File (Happy Path)', () => {
    clickProcess()

    // Expect processing to start
    getOutput().should('contain', 'processing')

    // Wait for async processing to complete
    cy.wait(6000)

    // Check status
    cy.contains('button', 'Check Status').click()

    // Expect completed + extracted data
    getOutput().should('contain', 'completed')
    getOutput().should('contain', 'invoice')
    getOutput().should('contain', 'INV-2026-8841')
  })
})