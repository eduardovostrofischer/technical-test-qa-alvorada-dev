# Test Strategy
Feature to be tested is descripted in Feature-description.md

We have 4 web pages and 4 Rest APIs
Full coverage of these 4 is expected.

## Testing Scope
Testing scope will cover Web Frontend and APIs
Manly covering acceptance criterias, functional aspects and negative cases.

For FrontEnd and APIs we will cover using Cypress javascript. 
This decision was made for the following reasons:
1. The team is experient in javascript. 
2. Cypress can be used for both Front and API tests, so we don't need to use two tools. Keep it simple.
3. Cypress is open source and widely used tool.

## Types of testing that will be performed
Manual tests and exploration will also be done to polish feature to check for design aspects, acessibility, performance.

A suite of automated regression tests will be added.
- Automated tests for WEB using Cypress
- Automated tests for APIs using Cypress

No performance tests will be added for simplicity. 
No OWASP or other similar security tests will be executed for simplicity.

## Key Test scenarios (happy path + edge cases)

### Scenario 01 - Upload PDF
#### WEB
1. Test upload with PDF file drag and drop
    Expected: Upload is concluded with sucess
2. Test upload with PDF file with choose File
    Expected: Upload is concluded with sucess
3. Test upload with a file that is not PDF (FAIL)
    Expected: Upload should fail and error message on screen "Error: File is not PDF"
4. Test upload without selecting file (FAIL)
    Expected: Upload should fail and error message on screen "Error: missing PDF Document"

#### API
1. Test API Happy Path
    - Headers: Auth token bearer
    - Body: "PDF document" and "filename"
    - Should respond with 201, body should contain fields descripted in documentation.
2. Test missing field PDFDocument
    - Send requests missing "PDFDocument"
    - Should respond with 400 and error message
3. Test missing field "FileName"
    - Send requests missing "FileName"
    - Should respond with 400 and error message
4. Test missing auth token
    - Send request without auth token
    - Should respond with 401 and error message
5. Test sending wrong field type
    - Send request with PDFDocument or Filename with invalid format like Number or Boolean
    - Should respond with 400 and error message
6. Test sending Invalid string in PDFDocument field
    - Send request with invalid string in PDFDocument field
    - Should respond with 400 and error message

### Scenario 02 - Document Processing
#### WEB
1. Test Process File (Happy Path) Click Test Process Button
    Expected: PDF file is processed and data is on review page
2. Click two times on process button (FAIL)
    Expected: Second process button click should return message "file already being processed"
3. Click on process after fail
    Expected: PDF file is re-processed and returns sucess.
4. Click on process after sucess
    Expected: Should return cached results from previous sucess.

#### API
1. Test POST /documents/{document_id}/process
    - Send Post request with valid fields and auth token
    Expected: Should return 201 and message "processing", and jobID
2. Test POST /documents/{document_id}/process after request has been processed
    - Send Post request with valid fields and auth token, after job has been processed
    Expected: Should return 201 and messsage "Finished" and jobId
3. Test GET /v1/processing/{jobId} after job is processed
    - Send GET request with valid fields and auth token
    Expected: Should return status code 200 with extracted data
4. Test GET /v1/processing/{jobId} during job execution
    - Send GET request with valid fields and auth token while job is running
    Expected: Should return status code 200 with status "processing"
5. Test valid authentication
    - Send requests for both endpoints without valid auth
    Expected: Should return 401 Unauthorized
6. Test missing fields
    - Send requests for both endpoints with missing fields
    Expected: Should return 400 with error message "missing field X"
7. Test send invalid jobId
    - Send requests with invalid jobId or documentId
    Expected: Should return 400 with message "invalid jobId or documentId"

### Scenario 03 - Review and edit Document extracted data
#### WEB
1. Test User can edit text fields
2. Test Input validations (should match the expected types for fields)
3. Test if multiple edits can happen at the same time
4. Test Save sucesfull
5. Test Save with no changes
6. Test page refresh, check if data not saved is maintained in browser

#### API GET Extracted Data Test cases
1. Check Extracted Data is sucessfull
    - Send request GET /v1/documents/{documentId}/extracted-data
    Expected: Return status 200 with extracted data from document with documentId in body
2. Test Extracted data from invalid documentId
    - Send request GET /v1/documents/{documentId}/extracted-data where documentId is not valid
    Expected: Should return 404 with message "documentId not found"
3. Test authentication
    - Send request GET /v1/documents/{documentId}/extracted-data with invalid or missing auth token
    Expected: Should return 401 with message "invalid or missing token"

#### API PUT Extracted data Test cases
1. Test Save edited data succesfully
    - Send request PUT /v1/documents/{documentId}/extracted-data
    Expected: Should return 200 with message "data edited and saved sucessfully"
2. Test Try to save with invalid documentId
    - Send request PUT /v1/documents/{documentId}/extracted-data
    Expected: Should return 404 with message "documentId not found"
3. Test Save empty data sucesfully
    - Send request PUT /v1/documents/{documentId}/extracted-data with empty body
    Expected: Should return 200
4. Test authentication
    - Send request PUT /v1/documents/{documentId}/extracted-data with invalid or missing auth token
    Expected: Should return 401 with message "invalid or missing token"



### Scenario 04 - Finalize Data
#### WEB
1. Test Click Finalize button with sucess
    - Click "mark as final" button
    Expected: Should return "Data finalized and available"
2. Test Click Finalize button two times
    - Click "mark as final" button two times
    Expected: Should return "Data finalized and available"

#### API
1. Mark data as final and available
    - Send request POST /v1/documents/{documentId}/finalize
    Expected: Should return 200
2. Test with invalid documentId
    - Send request POST /v1/documents/{documentId}/finalize with invalid documentId
    Expected: Should return 404 with message "documentId not found"
3. Test with invalid auth token
    - Send request POST /v1/documents/{documentId}/finalize with invalid auth Token
    Expected: Should return 401 unauthorized with message "auth token not valid or missing"

## Test Data Strategy

A structured and reusable test data strategy will be adopted to ensure consistency, repeatability, and realistic coverage.

### Test Data Types

#### Valid Data

* PDF files:

  * Small file (≤1MB)
  * Medium file (5–10MB)
  * Large file (near system limit)
* PDF content types:

  * Simple text
  * Tables
  * Mixed layout (text + images)
  * Multi-page documents
* Valid filenames:

  * Standard names
  * Long filenames
  * Special characters

#### Invalid Data

* Wrong file types: `.txt`, `.jpg`, `.png`, `.docx`
* Corrupted PDF files
* Empty files (0 KB)
* Malformed Base64 strings (API)
* Invalid field types:

  * Boolean instead of string
  * Number instead of string
  * Null values
* Missing required fields

#### Edge Case Data

* Maximum allowed file size
* Extremely long text fields
* Special characters and UTF-8 content
* Duplicate uploads
* Reprocessing processed documents
* Concurrent edits on same document
* Empty extracted data payloads

### Test Data Management

* Test data will be:

  * Versioned with test code (Cypress fixtures)
  * Reusable across test suites
  * Isolated per test execution when required

* Dynamic data:

  * documentId and jobId generated at runtime
  * Tokens generated via authentication helper

* Data cleanup:

  * Delete test documents when API supports it
  * Otherwise use unique test identifiers

### Test Environments

Separate datasets per environment:

#### QA / Staging

* Dedicated credentials
* Synthetic documents only

#### Local

* Mocked APIs when needed
* Lightweight test files

No production data will be used.

---

## Testing Approach

A risk-based and layered testing approach will be applied.

### Test Levels

#### End-to-End (E2E) — Web + API Integration

Simulates real user workflows:

1. Upload document
2. Process document
3. Review & edit extracted data
4. Finalize data

Executed using Cypress browser automation.

#### API Testing

Direct REST validation using Cypress requests:

* Status codes
* Response schemas
* Business rules
* Error handling
* Authentication

#### Manual & Exploratory Testing

* UI/UX validation
* Accessibility checks
* Error message clarity


### Automation Strategy

**Tool:** Cypress

#### Automation Layers

* UI Automation
* API Automation
* Regression suite

#### CI/CD Integration

* Tests executed on pull requests
* Smoke tests on deployments
* Full regression on release candidates

---

## Quality / Release Readiness Criteria

The feature will be considered ready for release when:

### Test Completion Criteria

* 100% execution of planned test scenarios
* All critical and high defects resolved
* Medium defects reviewed and approved
* No open blocker defects

### Coverage Criteria

* All 4 Web pages covered
* All 4 APIs fully validated
* All acceptance criteria verified
* Happy paths and negative cases covered

### Automation Criteria

* Regression suite implemented
* All automated tests passing
* No flaky critical tests

---

## Identified Risks and Mitigation Strategies

### Risk 1 — PDF Processing Instability

**Description:** Processing may fail due to file complexity or parsing issues.
**Impact:** Core feature reliability affected.

**Mitigation:**

* Test diverse document structures
* Include retry and reprocess scenarios
* Validate fallback and error messaging

### Risk 2 — Async Processing Timing Issues

**Description:** Race conditions between processing status and UI updates.
**Impact:** Users may see inconsistent states.

**Mitigation:**

* State transition testing
* Polling validation tests
* Concurrency scenarios

### Risk 3 — Authentication Failures

**Description:** Token expiration or invalid token handling.
**Impact:** Feature becomes unusable.

**Mitigation:**

* Token lifecycle tests
* Invalid token scenarios
* Automated auth helpers

### Risk 4 — Data Loss During Editing

**Description:** Unsaved edits lost on refresh or navigation.
**Impact:** Poor user experience.

**Mitigation:**

* Browser storage validation
* Refresh and navigation tests
* Save-state verification

### Risk 5 — Regression Due to Rapid Iterations

**Description:** Frequent changes may break existing flows.
**Impact:** Feature instability.

**Mitigation:**

* Automated regression suite
* CI pipeline enforcement
* Smoke tests per deployment