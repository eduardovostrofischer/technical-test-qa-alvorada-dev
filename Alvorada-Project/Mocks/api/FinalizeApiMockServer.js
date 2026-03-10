const http = require("http");

const PORT = 3003;
const VALID_TOKEN = "my-secret-token";

// ---------- CORS ----------

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Max-Age", "86400");
}

// ---------- in-memory store ----------
// reviewStatus: "pending" | "completed"
// status:       "draft" | "finalized"

const documents = new Map([
  [
    "doc_8f3a92k",
    {
      documentId: "doc_8f3a92k",
      reviewStatus: "pending",
      status: "draft",
      finalizedAt: null,
      extractedData: {
        documentType: "invoice",
        invoiceNumber: "INV-2026-8841",
        issueDate: "2026-02-18",
        totalAmount: 1540.75,
        currency: "BRL",
        vendor: { name: "ACME Ltda", taxId: "12.345.678/0001-90" },
        customer: { name: "Empresa XYZ", taxId: "98.765.432/0001-10" },
      },
    },
  ],
  [
    "doc_reviewed",
    {
      documentId: "doc_reviewed",
      reviewStatus: "completed",
      status: "draft",
      finalizedAt: null,
      extractedData: {
        documentType: "invoice",
        invoiceNumber: "INV-2026-8841",
        issueDate: "2026-02-18",
        totalAmount: 1500.0,
        currency: "BRL",
        vendor: { name: "ACME LTDA", taxId: "12.345.678/0001-90" },
        customer: { name: "Empresa XYZ", taxId: "98.765.432/0001-10" },
      },
    },
  ],
]);

// ---------- helpers ----------

function sendJSON(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function checkAuth(req, res) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== VALID_TOKEN) {
    sendJSON(res, 401, {
      error: "unauthorized",
      message: "Invalid or missing authentication token",
    });
    return false;
  }

  return true;
}

function notFound(res) {
  sendJSON(res, 404, { error: "not_found", message: "Route not found" });
}

// ---------- route handlers ----------

// POST /v1/documents/:documentId/finalize
function handleFinalize(req, res, documentId) {
  if (!checkAuth(req, res)) return;

  const doc = documents.get(documentId);
  if (!doc) {
    return sendJSON(res, 404, {
      error: "not_found",
      message: "Document not found",
    });
  }

  // Already finalized (idempotent behavior)
  if (doc.status === "finalized") {
    return sendJSON(res, 200, {
      documentId,
      status: "finalized",
      finalizedAt: doc.finalizedAt,
      message: "Data already finalized",
    });
  }

  // Not reviewed yet
  if (doc.reviewStatus !== "completed") {
    return sendJSON(res, 409, {
      error: "conflict",
      message: "Document must be reviewed before finalization",
    });
  }

  // Finalize document
  const finalizedAt = new Date().toISOString();
  const updated = { ...doc, status: "finalized", finalizedAt };
  documents.set(documentId, updated);

  return sendJSON(res, 200, {
    documentId,
    status: "finalized",
    finalizedAt,
    message: "Data finalized and ready for downstream workflows",
  });
}

// GET /v1/documents/:documentId/final-data
function handleFinalData(req, res, documentId) {
  if (!checkAuth(req, res)) return;

  const doc = documents.get(documentId);
  if (!doc) {
    return sendJSON(res, 404, {
      error: "not_found",
      message: "Document not found",
    });
  }

  if (doc.status !== "finalized") {
    return sendJSON(res, 400, {
      error: "invalid_request",
      message: "Document has not been finalized yet",
    });
  }

  return sendJSON(res, 200, {
    documentId,
    status: "finalized",
    finalizedAt: doc.finalizedAt,
    finalData: doc.extractedData,
  });
}

// ---------- router ----------

const server = http.createServer((req, res) => {
  const { method, url } = req;
  console.log(`${new Date().toISOString()}  ${method} ${url}`);

  setCORS(res);

  // ✅ CORS Preflight
  if (method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // POST /v1/documents/:documentId/finalize
  const finalizeMatch = url.match(/^\/v1\/documents\/([^/]+)\/finalize$/);
  if (method === "POST" && finalizeMatch) {
    return handleFinalize(req, res, finalizeMatch[1]);
  }

  // GET /v1/documents/:documentId/final-data
  const finalDataMatch = url.match(/^\/v1\/documents\/([^/]+)\/final-data$/);
  if (method === "GET" && finalDataMatch) {
    return handleFinalData(req, res, finalDataMatch[1]);
  }

  notFound(res);
});

// ---------- start server ----------

server.listen(PORT, () => {
  console.log(`\n🚀 Mock Finalize Document API running`);
  console.log(`   Base URL: http://localhost:${PORT}`);
  console.log(``);
  console.log(`   POST /v1/documents/:documentId/finalize`);
  console.log(`   GET  /v1/documents/:documentId/final-data`);
  console.log(``);
  console.log(`   Valid token  : "${VALID_TOKEN}"`);
  console.log(`   Known doc IDs: ${[...documents.keys()].join(", ")}`);
  console.log(``);
  console.log(`   ⚠ doc_8f3a92k → pending review (409 on finalize)`);
  console.log(`   ✅ doc_reviewed → ready to finalize (200)\n`);
});