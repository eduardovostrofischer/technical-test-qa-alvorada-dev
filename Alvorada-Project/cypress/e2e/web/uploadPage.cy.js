import 'cypress-file-upload';

describe('PDF Upload Page', () => {
  const validPdf = 'sample.pdf'
  const invalidFile = 'not-a-pdf.txt'

  beforeEach(() => {
    cy.visit('http://localhost:8080') 
    // or cy.visit('/') if baseUrl is set
  })

  // -----------------------------
  // 1. Drag and Drop Upload
  // -----------------------------
  it('Upload PDF using drag and drop', () => {
    cy.fixture(validPdf, 'base64').then(fileContent => {
      cy.get('[data-testid="dropzone"]').attachFile(
        {
          fileContent,
          fileName: validPdf,
          mimeType: 'application/pdf',
          encoding: 'base64',
        },
        { subjectType: 'drag-n-drop' }
      )
    })

    cy.get('[data-testid="upload-button"]').click()

    cy.contains('Upload successful').should('be.visible')
  })

  // -----------------------------
  // 2. Choose File Upload
  // -----------------------------
  it('Upload PDF using file chooser', () => {
    cy.get('input[type="file"]').attachFile(validPdf)

    cy.get('[data-testid="upload-button"]').click()

    cy.contains('Upload successful').should('be.visible')
  })

  // -----------------------------
  // 3. Invalid File Type
  // -----------------------------
  it('Fail when uploading non-PDF file', () => {
    cy.get('input[type="file"]').attachFile(invalidFile)

    cy.get('[data-testid="upload-button"]').click()

    cy.contains('Error: missing PDF Document').should('be.visible')
  })

  // -----------------------------
  // 4. Missing File
  // -----------------------------
  it('Fail when uploading without selecting file', () => {
    cy.get('[data-testid="upload-button"]').click()

    cy.contains('Error: missing PDF Document').should('be.visible')
  })
})