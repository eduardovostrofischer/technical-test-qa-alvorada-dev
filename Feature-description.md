This document has the purpose of explaining the test strategy for the feature we are currently developing

# Feature Document Upload & Data Extraction
Users Can:
- Upload PDF files containing technical documents 
- The system processes the document and automatically extracts structured data
- The user can review and edit the extracted data
- The data is saved and used in downstream product workflows

## Breaking Stories into Tasks
It's important that the information that we received about the functionalities are as clear and simple as possible. So it's important to breakdown the Stories we have into smaller tasks or subtasks.
Below there is a numbered list with acceptance Criteria for every user story
The acceptance criteria is 

### User Story 01 - Upload PDF files containing technical documents, Acceptance criterias

#### WEB
There is no display of the front web here but main acceptance criterias are listed
1. User should be able to upload only PDF files, other files should display error "invalid file type, upload PDFs only"
2. Upload should function with drag and drop
3. Upload should work with Browse + Choose File option
4. Upload Button should have text "Upload document"
5. Upload Button should have color Red and design aligned with button in Figma
6. After executing upload, File should be available to process
7. All files uploaded should be displayed in list manner.

##### API
Complete API design is displayed in API-design/DocumentUploadAPI-Design.md, main acceptance criterias displayed here

1. API must follow RESTful principles
2. API must use HTTPS
3. API must accept and return JSON
4. API must expose endpoint POST /v1/documents
5. API must require an Authorization header with Bearer token
6. API must accept PDFDocument as a Base64-encoded string in the request body
7. API must validate that the decoded content is a valid PDF file
8. API must return 201 Created with a JSON response when upload succeeds
9. API must return error codes and text as described in in the design document

###  User Story 02 - The system processes the document and automatically extracts structured data
#### WEB

1. Process Button should appear next to all documents that have been uploaded.
2. Loading Bar with progress should be displayed after clicking Process Button.
3. Data should be extracted from PDF and displayed in a new page "data extracted".
4. In case of error a re-process button should appear
5. In case of success new button to go to page 'data extracted' should appear

#### API
Complete API design is displayed in DocumentProcessingAndDataExtractionAPI-design, main acceptance criterias displayed here

1. API must follow RESTful principles
2. API must use HTTPS
3. API must accept and return JSON
4. API must expose endpoint `POST /v1/documents/{documentId}/process`
5. API must require an Authorization header with Bearer token
6. API must start processing asynchronously and return **202 Accepted**
7. API must return a `jobId` to track processing
8. API status should return according to documentation 

### User Story 03 - The user can review and edit the extracted data
#### WEB
1. Page must require authenticated user access
2. Page must display extracted structured data clearly
3. Extracted fields must be editable through form inputs
4. Page must validate user inputs before submission
5. Page must show validation errors clearly
6. Page must allow user to save or submit edits
7. Page must show success confirmation after saving
8. Page must reflect updated data after submission

##### API
Complete description of the API is available in DocumentReviewAndEditAPI-Design.md
Here are the main acceptance criteria
1. API must follow RESTful principles
2. API must use HTTPS
3. API must accept and return JSON
4. API must require authentication via Bearer token
5. API must provide endpoint to retrieve extracted data
6. API must provide endpoint to submit edited data
7. API must validate edited fields before saving
8. API must persist the updated structured data successfully

### User Story 04 - The data is saved and used in downstream product workflows
#### WEB

1. Web app must allow the user to finalize reviewed data
2. Web app must display a clear confirmation step before finalization
3. Web app must prevent finalization if the review is incomplete
4. Web app must show a loading state while finalization is in progress
5. Web app must display a success message when finalization completes
6. Web app must lock fields to prevent further edits after finalization
7. Web app must display the finalized status clearly on the document
8. Web app must inform the user that finalized data will be used in downstream workflows

##### API
Complete description of the API is available in DocumentFinalizeDataAPI-Design.md
1. API must securely persist the reviewed and edited structured data
2. API must ensure saved data is linked to the correct document and user
3. API must confirm successful save with a success response
4. API must make saved data retrievable by downstream services
5. API must expose endpoint(s) for downstream workflow consumption
6. API must ensure data consistency (no partial or corrupted saves)
7. API must enforce authentication and authorization for access
8. API must log save events for audit and traceability