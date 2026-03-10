describe('PDF Upload API Tests', () => {
  const baseUrl = 'http://localhost:3000/v1/pdfDocuments'
  const validToken = 'my-secret-token'

  // Minimal valid PDF in Base64 ("%PDF")
  const validBase64PDF = 'JVBERi0='

  const validBody = {
    PDFDocument: validBase64PDF,
    fileName: 'test.pdf'
  }

  it('1. API Happy Path', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      },
      body: validBody
    }).then((res) => {
      expect(res.status).to.eq(201)
      expect(res.body).to.have.property('documentId')
      expect(res.body).to.have.property('fileName', 'test.pdf')
      expect(res.body).to.have.property('status', 'uploaded')
      expect(res.body).to.have.property('uploadedAt')
    })
  })

  it('2. Missing field PDFDocument', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        fileName: 'test.pdf'
      }
    }).then((res) => {
      expect(res.status).to.eq(400)
      expect(res.body.error).to.eq('invalid_request')
      expect(res.body.message).to.contain('PDFDocument')
    })
  })

  it('3. Missing field fileName', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        PDFDocument: validBase64PDF
      }
    }).then((res) => {
      expect(res.status).to.eq(400)
      expect(res.body.error).to.eq('invalid_request')
      expect(res.body.message).to.contain('fileName')
    })
  })

  it('4. Missing auth token', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      failOnStatusCode: false,
      headers: {
        'Content-Type': 'application/json'
      },
      body: validBody
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body.error).to.eq('unauthorized')
    })
  })

  it('5. Wrong field types', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        PDFDocument: 12345,
        fileName: true
      }
    }).then((res) => {
      expect(res.status).to.eq(400)
      expect(res.body.error).to.eq('invalid_request')
    })
  })

  it('6. Invalid string in PDFDocument field', () => {
    cy.request({
      method: 'POST',
      url: baseUrl,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${validToken}`,
        'Content-Type': 'application/json'
      },
      body: {
        PDFDocument: 'not-a-valid-base64@@@',
        fileName: 'test.pdf'
      }
    }).then((res) => {
      expect(res.status).to.eq(400)
      expect(res.body.error).to.eq('invalid_request')
      expect(res.body.message).to.contain('Base64')
    })
  })
})