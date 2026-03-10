# Document Upload API — Design Specification

## 1. Overview

This API allows authenticated clients to upload a PDF document to the server for storage and further processing.

* **Protocol:** HTTPS
* **Architecture Style:** RESTful
* **Data Format:** JSON
* **Authentication:** Token-based (Bearer)

---

## 2. Endpoint

### Upload Document

```
POST /v1/pdfDocuments
```

**Description:**
Uploads a PDF document encoded as a string.

---

## 3. Request

### 3.1 Headers

| Header        | Type   | Required | Description                                   |
| ------------- | ------ | -------- | --------------------------------------------- |
| Authorization | String | Yes      | Bearer authentication token                   |
| Content-Type  | String | Yes      | Must be `application/json`                    |
| Accept        | String | No       | Expected response format (`application/json`) |

**Example**

```
Authorization: Bearer <auth_token>
Content-Type: application/json
Accept: application/json
```

---

### 3.2 Body

**Content-Type:** `application/json`

| Field        | Type   | Required | Description                     |
| ------------ | ------ | -------- | ------------------------------- |
| PDFDocument  | String | Yes      | Base64-encoded PDF file content |
| fileName     | String | Yes      | Original file name              |

---

### 3.3 Example Request

```json
{
  "PDFDocument": "JVBERi0xLjQKJcfs...",
  "fileName": "contract_2026.pdf",
}
```

---

## 4. Response

### 4.1 Success — 201 Created

**Description:** Document uploaded successfully.

```json
{
  "documentId": "doc_8f3a92k",
  "fileName": "contract_2026.pdf",
  "status": "uploaded",
  "uploadedAt": "2026-03-08T18:22:31Z"
}
```

---

### 4.2 Client Errors

#### 400 Bad Request

Invalid or malformed request body.

```json
{
  "error": "invalid_request",
  "message": "PDFDocument field is required"
}
```

#### 401 Unauthorized

Missing or invalid authentication token.

```json
{
  "error": "unauthorized",
  "message": "Invalid or missing authentication token"
}
```

#### 413 Payload Too Large

File exceeds allowed size limit.

```json
{
  "error": "file_too_large",
  "message": "Maximum file size is 10MB"
}
```

#### 415 Unsupported Media Type

Uploaded file is not a valid PDF.

```json
{
  "error": "unsupported_media_type",
  "message": "Only PDF documents are supported"
}
```

---

### 4.3 Server Errors

#### 500 Internal Server Error

```json
{
  "error": "internal_error",
  "message": "Unexpected server error"
}
```

---

## 5. Validation Rules

| Field        | Rule                            |
| ------------ | ------------------------------- |
| PDFDocument  | Must be valid Base64            |
| PDFDocument  | Must decode to a valid PDF file |
| fileName     | Max length: 255 characters      |
| fileName     | Must end with `.pdf`            |
| Request size | Max payload: 10 MB              |

