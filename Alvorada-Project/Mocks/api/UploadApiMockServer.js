const http = require("http");

const PORT = 3000;
const MAX_PAYLOAD_BYTES = 10 * 1024 * 1024; // 10 MB
const VALID_TOKEN = "my-secret-token";

// ---------- CORS ----------

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// ---------- helpers ----------

function sendJSON(res, status, body) {
  const payload = JSON.stringify(body, null, 2);

  setCORSHeaders(res);

  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });

  res.end(payload);
}

function isValidBase64(str) {
  if (typeof str !== "string" || str.trim() === "") return false;
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  return base64Regex.test(str.replace(/\s/g, ""));
}

function isValidPDF(base64Str) {
  try {
    const buf = Buffer.from(base64Str, "base64");
    return buf.slice(0, 4).toString("ascii") === "%PDF";
  } catch {
    return false;
  }
}

function generateDocumentId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "doc_";
  for (let i = 0; i < 7; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// ---------- request handler ----------

function handleUpload(req, res) {
  // 1. Auth check
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token || token !== VALID_TOKEN) {
    return sendJSON(res, 401, {
      error: "unauthorized",
      message: "Invalid or missing authentication token",
    });
  }

  // 2. Content-Type check
  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    return sendJSON(res, 415, {
      error: "unsupported_media_type",
      message: "Content-Type must be application/json",
    });
  }

  // 3. Collect body with size guard
  let rawBody = "";
  let bodySize = 0;

  req.on("data", (chunk) => {
    bodySize += chunk.length;
    if (bodySize > MAX_PAYLOAD_BYTES) {
      req.destroy();
    }
    rawBody += chunk.toString();
  });

  req.on("close", () => {
    if (bodySize > MAX_PAYLOAD_BYTES) {
      return sendJSON(res, 413, {
        error: "file_too_large",
        message: "Maximum file size is 10MB",
      });
    }
  });

  req.on("end", () => {
    if (bodySize > MAX_PAYLOAD_BYTES) return;

    // 4. Parse JSON
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return sendJSON(res, 400, {
        error: "invalid_request",
        message: "Request body is not valid JSON",
      });
    }

    const { PDFDocument, fileName } = body;

    // 5. Field presence validation
    if (!PDFDocument) {
      return sendJSON(res, 400, {
        error: "invalid_request",
        message: "PDFDocument field is required",
      });
    }
    if (!fileName) {
      return sendJSON(res, 400, {
        error: "invalid_request",
        message: "fileName field is required",
      });
    }

    // 6. fileName validation
    if (typeof fileName !== "string" || fileName.length > 255) {
      return sendJSON(res, 400, {
        error: "invalid_request",
        message: "fileName must be a string with max 255 characters",
      });
    }
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      return sendJSON(res, 400, {
        error: "invalid_request",
        message: "fileName must end with .pdf",
      });
    }

    // 7. Base64 validation
    if (!isValidBase64(PDFDocument)) {
      return sendJSON(res, 400, {
        error: "invalid_request",
        message: "PDFDocument must be valid Base64",
      });
    }

    // 8. PDF magic bytes validation
    if (!isValidPDF(PDFDocument)) {
      return sendJSON(res, 415, {
        error: "unsupported_media_type",
        message: "Only PDF documents are supported",
      });
    }

    // 9. Success
    return sendJSON(res, 201, {
      documentId: generateDocumentId(),
      fileName,
      status: "uploaded",
      uploadedAt: new Date().toISOString(),
    });
  });

  req.on("error", () => {
    sendJSON(res, 500, {
      error: "internal_error",
      message: "Unexpected server error",
    });
  });
}

// ---------- router ----------

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()}  ${req.method} ${req.url}`);

  // CORS preflight
  setCORSHeaders(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.method === "POST" && req.url === "/v1/pdfDocuments") {
    return handleUpload(req, res);
  }

  sendJSON(res, 404, { error: "not_found", message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Mock Document Upload API running at http://localhost:${PORT}`);
  console.log(`   POST /v1/pdfDocuments`);
  console.log(`   Valid token: "${VALID_TOKEN}"\n`);
});