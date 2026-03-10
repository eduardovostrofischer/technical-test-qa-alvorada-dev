# Document Processing & Data Extraction API — Design Specification

## 1. Overview

This API processes an uploaded document and automatically extracts structured data from it.

* **Protocol:** HTTPS
* **Architecture Style:** RESTful
* **Data Format:** JSON
* **Authentication:** Token-based (Bearer)
* **Processing Mode:** Asynchronous

---

## 2. Endpoint

### Process Document

```
POST /v1/documents/{documentId}/process
```

**Description:**
Triggers document processing and structured data extraction for a previously uploaded document.

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

### 3.2 Path Parameters

| Parameter  | Type   | Required | Description                            |
| ---------- | ------ | -------- | -------------------------------------- |
| documentId | String | Yes      | Unique identifier of uploaded document |

---

### 3.3 Body

For simplicity purposes I will make the assumption that there is no data needed in body


## 4. Response

### 4.1 Success — 202 Accepted

**Description:** Processing started successfully.

```json
{
  "jobId": "job_73ks9a",
  "documentId": "doc_8f3a92k",
  "status": "processing",
}
```

---

## 5. Check Processing Status

### Endpoint

```
GET /v1/processing/{jobId}
```

**Description:**
Returns processing status and extracted data when complete.

---

### 5.1 Success — Processing Complete (200 OK)

```json
{
  "jobId": "job_73ks9a",
  "status": "completed",
  "completedAt": "2026-03-08T19:11:03Z",
  "extractedData": {
    "documentType": "invoice",
    "invoiceNumber": "INV-2026-8841",
    "issueDate": "2026-02-18",
    "totalAmount": 1540.75,
    "currency": "BRL",
    "vendor": {
      "name": "ACME Ltda",
      "taxId": "12.345.678/0001-90"
    },
    "customer": {
      "name": "Empresa XYZ",
      "taxId": "98.765.432/0001-10"
    }
  }
}
```

---

### 5.2 Success — Still Processing (200 OK)

```json
{
  "jobId": "job_73ks9a",
  "status": "processing"
}
```

---

### 5.3 Client Errors

#### 400 Bad Request

```json
{
  "error": "invalid_request",
  "message": "Invalid documentId"
}
```

#### 401 Unauthorized

```json
{
  "error": "unauthorized",
  "message": "Invalid or missing authentication token"
}
```

#### 404 Not Found

```json
{
  "error": "not_found",
  "message": "Document or job not found"
}
```

---

### 5.4 Server Errors

#### 500 Internal Server Error

```json
{
  "error": "internal_error",
  "message": "Unexpected server error"
}
```

