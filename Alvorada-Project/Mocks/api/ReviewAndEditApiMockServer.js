const http = require("http");

const PORT = 3002;
const VALID_TOKEN = "my-secret-token";

// ---------- in-memory store ----------

const documents = new Map([
  [
    "doc_8f3a92k",
    {
      documentId: "doc_8f3a92k",
      reviewStatus: "pending",
      extractedData: {
        documentType: "invoice",
        invoiceNumber: "INV-2026-8841",
        issueDate: "2026-02-18",
        totalAmount: 1540.75,
        currency: "BRL",
        vendor: {
          name: "ACME Ltda",
          taxId: "12.345.678/0001-90",
        },
        customer: {
          name: "Empresa XYZ",
          taxId: "98.765.432/0001-10",
        },
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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk.toString()));
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

// ---------- route handlers ----------

// GET /v1/documents/:documentId/extracted-data
function handleGet(req, res, documentId) {
  if (!checkAuth(req, res)) return;

  const doc = documents.get(documentId);
  if (!doc) {
    return sendJSON(res, 404, {
      error: "not_found",
      message: "Document not found",
    });
  }

  return sendJSON(res, 200, doc);
}

// PUT /v1/documents/:documentId/extracted-data
async function handlePut(req, res, documentId) {
  if (!checkAuth(req, res)) return;

  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    return sendJSON(res, 400, {
      error: "invalid_request",
      message: "Content-Type must be application/json",
    });
  }

  const doc = documents.get(documentId);
  if (!doc) {
    return sendJSON(res, 404, {
      error: "not_found",
      message: "Document not found",
    });
  }

  let body;
  try {
    const raw = await readBody(req);
    body = JSON.parse(raw);
  } catch {
    return sendJSON(res, 400, {
      error: "invalid_request",
      message: "Request body is not valid JSON",
    });
  }

  if (!body.extractedData || typeof body.extractedData !== "object") {
    return sendJSON(res, 400, {
      error: "invalid_request",
      message: "extractedData field is required and must be an object",
    });
  }

  // Persist the updated data in memory
  documents.set(documentId, {
    ...doc,
    reviewStatus: "completed",
    extractedData: body.extractedData,
  });

  return sendJSON(res, 200, {
    documentId,
    reviewStatus: "completed",
    message: "Extracted data updated successfully",
  });
}

// ---------- router ----------

const server = http.createServer(async (req, res) => {
  const { method, url } = req;
  console.log(`${new Date().toISOString()}  ${method} ${url}`);

  const routeMatch = url.match(/^\/v1\/documents\/([^/]+)\/extracted-data$/);

  if (routeMatch) {
    const documentId = routeMatch[1];

    if (method === "GET") return handleGet(req, res, documentId);
    if (method === "PUT") return handlePut(req, res, documentId);

    return sendJSON(res, 405, { error: "method_not_allowed", message: "Method not allowed" });
  }

  sendJSON(res, 404, { error: "not_found", message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`\n🚀  Mock Review & Edit API running at http://localhost:${PORT}`);
  console.log(`   GET /v1/documents/:documentId/extracted-data`);
  console.log(`   PUT /v1/documents/:documentId/extracted-data`);
  console.log(`   Valid token  : "${VALID_TOKEN}"`);
  console.log(`   Known doc IDs: ${[...documents.keys()].join(", ")}\n`);
});