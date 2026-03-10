# Review & Edit Extracted Data API — Simple Description

## Overview

This API allows users to:

1. View the structured data extracted from a processed document
2. Edit any incorrect fields
3. Save the corrected data

All requests require authentication.

---

## Base Rules

* **Protocol:** HTTPS
* **Style:** RESTful
* **Format:** JSON
* **Authentication:** Bearer Token

---

## 1. Get Extracted Data (For Review)

### Endpoint

```
GET /v1/documents/{documentId}/extracted-data
```

### Description

Returns the extracted structured data so the user can review it.

---

### Headers

```
Authorization: Bearer <auth_token>
Accept: application/json
```

---

### Success Response — 200 OK

```json
{
  "documentId": "doc_8f3a92k",
  "reviewStatus": "pending",
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

## 2. Submit Edited Data

### Endpoint

```
PUT /v1/documents/{documentId}/extracted-data
```

### Description

Saves user corrections to the extracted structured data.

---

### Headers

```
Authorization: Bearer <auth_token>
Content-Type: application/json
Accept: application/json
```

---

### Request Body

User sends the corrected version of the extracted data.

```json
{
  "extractedData": {
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

### Success Response — 200 OK

```json
{
  "documentId": "doc_8f3a92k",
  "reviewStatus": "completed",
  "message": "Extracted data updated successfully"
}
```

---

## Common Errors

### 400 Bad Request

Invalid data format

### 401 Unauthorized

Missing or invalid token

### 404 Not Found

Document not found

### 500 Internal Server Error

Unexpected failure

---