describe('Finalize Document API', () => {
  const baseUrl = 'http://localhost:3003'
  const validToken = 'my-secret-token'
  const validDocumentId = 'doc_reviewed'   // reviewed → can finalize
  const invalidDocumentId = 'doc_invalid'

  const authHeaders = {
    Authorization: `Bearer ${validToken}`
  }

  // 1. Mark data as final and available
  it('1. POST /v1/documents/{documentId}/finalize — success', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/v1/documents/${validDocumentId}/finalize`,
      headers: authHeaders
    }).then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body.documentId).to.eq(validDocumentId)
      expect(res.body.status).to.eq('finalized')
      expect(res.body).to.have.property('finalizedAt')
      expect(res.body.message).to.contain('finalized')
    })
  })

  // 2. Test with invalid documentId
  it('2. POST /v1/documents/{documentId}/finalize — invalid documentId', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/v1/documents/${invalidDocumentId}/finalize`,
      headers: authHeaders,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404)
      expect(res.body.error).to.eq('not_found')
      expect(res.body.message).to.contain('not found')
    })
  })

  // 3. Test with invalid auth token
  it('3. POST /v1/documents/{documentId}/finalize — invalid auth token', () => {
    cy.request({
      method: 'POST',
      url: `${baseUrl}/v1/documents/${validDocumentId}/finalize`,
      headers: {
        Authorization: 'Bearer wrong-token'
      },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body.error).to.eq('unauthorized')
      expect(res.body.message).to.contain('authentication token')
    })
  })
})