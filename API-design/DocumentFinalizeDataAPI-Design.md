# Finalize Document Data API — Design Specification

## 1. Overview

This API marks reviewed document data as final and makes it available for downstream product workflows.

Once finalized:

* The data becomes the official version
* No further edits are allowed (unless reopened by admin)
* Other systems can safely consume the data
* Automated workflows can use the data

All requests require authentication.

---

## 2. Base Rules

* **Protocol:** HTTPS
* **Architecture Style:** RESTful
* **Data Format:** JSON
* **Authentication:** Bearer Token
* **Access Type:** System and authenticated users

---

## 3. Finalize Reviewed Data

### Endpoint

```
POST /v1/documents/{documentId}/finalize
```

### Description

Marks the reviewed structured data as final and persists it for downstream usage.

This action:

* Locks the reviewed data
* Prevents further edits
* Marks the document as ready for product workflows

---

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

| Parameter  | Type   | Required | Description                       |
| ---------- | ------ | -------- | --------------------------------- |
| documentId | String | Yes      | Unique identifier of the document |

---

### 3.3 Request Body

No request body required.

---

### 3.4 Success Response — 200 OK

```json
{
  "documentId": "doc_8f3a92k",
  "status": "finalized",
  "finalizedAt": "2026-03-08T20:10:03Z",
  "message": "Data finalized and ready for downstream workflows"
}
```

---

## 4. Retrieve Final Structured Data

### Endpoint

```
GET /v1/documents/{documentId}/final-data
```

### Description

Returns the finalized structured data for downstream product workflows.

This endpoint is intended for system-to-system integration.

---

### 4.1 Headers

| Header        | Type   | Required | Description                                   |
| ------------- | ------ | -------- | --------------------------------------------- |
| Authorization | String | Yes      | Bearer authentication token                   |
| Accept        | String | No       | Expected response format (`application/json`) |

**Example**

```
Authorization: Bearer <auth_token>
Accept: application/json
```

---

### 4.2 Success Response — 200 OK

```json
{
  "documentId": "doc_8f3a92k",
  "status": "finalized",
  "finalizedAt": "2026-03-08T20:10:03Z",
  "finalData": {
    "documentType": "invoice",
    "invoiceNumber": "INV-2026-8841",
    "issueDate": "2026-02-18",
    "totalAmount": 1500.00,
    "currency": "BRL",
    "vendor": {
      "name": "ACME LTDA",
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

---

## 5. Common Errors

### 400 Bad Request

Invalid document state or malformed request

```json
{
  "error": "invalid_request",
  "message": "Document cannot be finalized"
}
```

---

### 401 Unauthorized

Missing or invalid authentication token

```json
{
  "error": "unauthorized",
  "message": "Invalid or missing authentication token"
}
```

---

### 404 Not Found

Document not found

```json
{
  "error": "not_found",
  "message": "Document not found"
}
```

---


### 500 Internal Server Error

Unexpected server failure

```json
{
  "error": "internal_error",
  "message": "Unexpected server error"
}
```

---