describe('Processing API — Required Test Cases', () => {
  const baseUrl = 'http://localhost:3001'
  const validToken = 'my-secret-token'
  const knownDocumentId = 'doc_8f3a92k'

  const authHeaders = {
    Authorization: `Bearer ${validToken}`
  }

  // Helper to start a job
  function startJob() {
    return cy.request({
      method: 'POST',
      url: `${baseUrl}/v1/documents/${knownDocumentId}/process`,
      headers: authHeaders
    })
  }

  // -----------------------------
  // 1. POST process — happy path
  // -----------------------------
  it('1. POST /documents/{document_id}/process', () => {
    startJob().then((res) => {
      expect(res.status).to.eq(202)
      expect(res.body).to.have.property('jobId')
      expect(res.body.status).to.eq('processing')
      expect(res.body.documentId).to.eq(knownDocumentId)
    })
  })

  // -------------------------------------------------------
  // 2. POST process after previous job has been processed
  // -------------------------------------------------------
  it('2. POST /documents/{document_id}/process after job processed', () => {
    startJob().then((firstRes) => {
      const firstJobId = firstRes.body.jobId

      // wait for completion (mock = 5s)
      cy.wait(5500)

      // start again after completion
      startJob().then((secondRes) => {
        expect(secondRes.status).to.eq(202)
        expect(secondRes.body).to.have.property('jobId')
        expect(secondRes.body.jobId).to.not.eq(firstJobId)
        expect(secondRes.body.status).to.eq('processing')
      })
    })
  })

  // -----------------------------------------------
  // 3. GET processing status after job is processed
  // -----------------------------------------------
  it('3. GET /v1/processing/{jobId} after job processed', () => {
    startJob().then((res) => {
      const jobId = res.body.jobId

      cy.wait(5500)

      cy.request({
        method: 'GET',
        url: `${baseUrl}/v1/processing/${jobId}`,
        headers: authHeaders
      }).then((statusRes) => {
        expect(statusRes.status).to.eq(200)
        expect(statusRes.body.status).to.eq('completed')
        expect(statusRes.body).to.have.property('completedAt')
        expect(statusRes.body).to.have.property('extractedData')
      })
    })
  })

  // ---------------------------------------------
  // 4. GET processing status during job execution
  // ---------------------------------------------
  it('4. GET /v1/processing/{jobId} during processing', () => {
    startJob().then((res) => {
      const jobId = res.body.jobId

      cy.request({
        method: 'GET',
        url: `${baseUrl}/v1/processing/${jobId}`,
        headers: authHeaders
      }).then((statusRes) => {
        expect(statusRes.status).to.eq(200)
        expect(statusRes.body.status).to.eq('processing')
      })
    })
  })

  // ---------------------------
  // 5. Invalid authentication
  // ---------------------------
  it('5. Requests without valid auth', () => {
    // POST without auth
    cy.request({
      method: 'POST',
      url: `${baseUrl}/v1/documents/${knownDocumentId}/process`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body.error).to.eq('unauthorized')
    })

    // GET without auth
    cy.request({
      method: 'GET',
      url: `${baseUrl}/v1/processing/someJobId`,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(401)
      expect(res.body.error).to.eq('unauthorized')
    })
  })

  // 6. Missing fields in body
  it('6. Missing fields in request body', () => {
    // POST with empty body
    cy.request({
      method: 'POST',
      url: `${baseUrl}/v1/documents/${knownDocumentId}/process`,
      headers: authHeaders,
      body: {},
      failOnStatusCode: false
    }).then((res) => {
      // API ignores body → should still work
      expect(res.status).to.eq(202)
      expect(res.body.status).to.eq('processing')
    })

    // POST with malformed JSON
    cy.request({
      method: 'POST',
      url: `${baseUrl}/v1/documents/${knownDocumentId}/process`,
      headers: authHeaders,
      body: null,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(202)
      expect(res.body.status).to.eq('processing')
    })

    // GET with body (should be ignored)
    cy.request({
      method: 'GET',
      url: `${baseUrl}/v1/processing/job_fake`,
      headers: authHeaders,
      body: {},
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.be.oneOf([400, 404])
    })
  })

  // ----------------------
  // 7. Invalid IDs
  // ----------------------
  it('7. Invalid jobId or documentId', () => {
    // Unknown documentId
    cy.request({
      method: 'POST',
      url: `${baseUrl}/v1/documents/doc_invalid/process`,
      headers: authHeaders,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404)
      expect(res.body.error).to.eq('not_found')
    })

    // Unknown jobId
    cy.request({
      method: 'GET',
      url: `${baseUrl}/v1/processing/job_invalid`,
      headers: authHeaders,
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(404)
      expect(res.body.error).to.eq('not_found')
    })
  })
})