describe('Review & Edit Extracted Data API', () => {
  const baseUrl = 'http://localhost:3002'
  const validToken = 'my-secret-token'
  const validDocumentId = 'doc_8f3a92k'

  const authHeaders = {
    Authorization: `Bearer ${validToken}`,
    'Content-Type': 'application/json'
  }

  const editedData = {
    extractedData: {
      documentType: "invoice",
      invoiceNumber: "INV-EDIT-9999",
      issueDate: "2026-03-01",
      totalAmount: 999.99,
      currency: "BRL",
      vendor: { name: "Edited Vendor", taxId: "00.000.000/0001-00" },
      customer: { name: "Edited Customer", taxId: "11.111.111/0001-11" }
    }
  }

  // ================================
  // GET Extracted Data Test Cases
  // ================================

  it('GET 1. Extracted Data successful', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/v1/documents/${validDocumentId}/extracted-data`,
      headers: authHeaders
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.have.property('documentId', validDocumentId)
      expect(res.body).to.have.property('extractedData')
      expect(res.body.extractedData).to.be.an('object')
    })
  })

  it('GET 2. Extracted data with invalid documentId', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/v1/documents/doc_invalid/extracted-data`,
      headers: authHeaders,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404)
      expect(res.body.error).to.eq('not_found')
    })
  })

  it('GET 3. Authentication required', () => {
    cy.request({
      method: 'GET',
      url: `${baseUrl}/v1/documents/${validDocumentId}/extracted-data`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body.error).to.eq('unauthorized')
    })
  })

  // ================================
  // PUT Extracted Data Test Cases
  // ================================

  it('PUT 1. Save edited data successfully', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/v1/documents/${validDocumentId}/extracted-data`,
      headers: authHeaders,
      body: editedData
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.documentId).to.eq(validDocumentId)
      expect(res.body.reviewStatus).to.eq('completed')
      expect(res.body.message).to.contain('updated successfully')
    })
  })

  it('PUT 2. Try to save with invalid documentId', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/v1/documents/doc_invalid/extracted-data`,
      headers: authHeaders,
      body: editedData,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404)
      expect(res.body.error).to.eq('not_found')
    })
  })

  it('PUT 3. Save empty data (invalid — extractedData required)', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/v1/documents/${validDocumentId}/extracted-data`,
      headers: authHeaders,
      body: {},
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(400)
      expect(res.body.error).to.eq('invalid_request')
      expect(res.body.message).to.contain('extractedData')
    })
  })

  it('PUT 4. Authentication required', () => {
    cy.request({
      method: 'PUT',
      url: `${baseUrl}/v1/documents/${validDocumentId}/extracted-data`,
      body: editedData,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body.error).to.eq('unauthorized')
    })
  })
})