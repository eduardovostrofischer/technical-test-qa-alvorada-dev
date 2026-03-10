const http = require("http");

const PORT = 3001;
const VALID_TOKEN = "my-secret-token";

// ------------------ In-memory stores ------------------

// Known uploaded documents
const knownDocuments = new Set(["doc_8f3a92k"]);

// jobId -> job state
const jobs = new Map();

// documentId -> last successful result (cache)
const completedCache = new Map();

// documentId -> jobId currently processing
const activeProcessing = new Map();

// ------------------ Helpers ------------------

function sendJSON(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
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

function generateJobId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "job_";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function mockExtractedData() {
  return {
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
  };
}

// ------------------ Route Handlers ------------------

// POST /v1/documents/:documentId/process
function handleProcess(req, res, documentId) {
  if (!checkAuth(req, res)) return;

  if (!documentId || documentId.trim() === "") {
    return sendJSON(res, 400, {
      error: "invalid_request",
      message: "Invalid documentId",
    });
  }

  if (!knownDocuments.has(documentId)) {
    return sendJSON(res, 404, {
      error: "not_found",
      message: "Document not found",
    });
  }

  // 1️⃣ If already processing → reject
  if (activeProcessing.has(documentId)) {
    return sendJSON(res, 409, {
      error: "conflict",
      message: "file already being processed",
      jobId: activeProcessing.get(documentId),
    });
  }

  // 2️⃣ If already processed → return cached result
  if (completedCache.has(documentId)) {
    const cached = completedCache.get(documentId);
    return sendJSON(res, 200, {
      cached: true,
      jobId: cached.jobId,
      documentId,
      status: "completed",
      completedAt: cached.completedAt,
      extractedData: cached.extractedData,
    });
  }

  // 3️⃣ Start new processing job
  const jobId = generateJobId();
  const processingDelayMs = 5000;

  const job = {
    jobId,
    documentId,
    status: "processing",
    startedAt: new Date().toISOString(),
  };

  jobs.set(jobId, job);
  activeProcessing.set(documentId, jobId);

  console.log(`🔄 Job ${jobId} started for ${documentId}`);

  // Simulate async processing
  setTimeout(() => {
    const completedJob = {
      ...job,
      status: "completed",
      completedAt: new Date().toISOString(),
      extractedData: mockExtractedData(),
    };

    jobs.set(jobId, completedJob);
    completedCache.set(documentId, completedJob);
    activeProcessing.delete(documentId);

    console.log(`✅ Job ${jobId} completed`);
  }, processingDelayMs);

  return sendJSON(res, 202, {
    jobId,
    documentId,
    status: "processing",
  });
}

// GET /v1/processing/:jobId
function handleStatus(req, res, jobId) {
  if (!checkAuth(req, res)) return;

  if (!jobId || jobId.trim() === "") {
    return sendJSON(res, 400, {
      error: "invalid_request",
      message: "Invalid jobId",
    });
  }

  const job = jobs.get(jobId);
  if (!job) {
    return sendJSON(res, 404, {
      error: "not_found",
      message: "Job not found",
    });
  }

  if (job.status === "processing") {
    return sendJSON(res, 200, {
      jobId,
      status: "processing",
      startedAt: job.startedAt,
    });
  }

  return sendJSON(res, 200, {
    jobId,
    status: "completed",
    completedAt: job.completedAt,
    extractedData: job.extractedData,
  });
}

// ------------------ Router ------------------

const server = http.createServer((req, res) => {
  setCORS(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const { method, url } = req;
  console.log(`${new Date().toISOString()}  ${method} ${url}`);

  // POST /v1/documents/:documentId/process
  const processMatch = url.match(/^\/v1\/documents\/([^/]+)\/process$/);
  if (method === "POST" && processMatch) {
    return handleProcess(req, res, processMatch[1]);
  }

  // GET /v1/processing/:jobId
  const statusMatch = url.match(/^\/v1\/processing\/([^/]+)$/);
  if (method === "GET" && statusMatch) {
    return handleStatus(req, res, statusMatch[1]);
  }

  sendJSON(res, 404, { error: "not_found", message: "Route not found" });
});

// ------------------ Start Server ------------------

server.listen(PORT, () => {
  console.log(`\n🚀 Mock Document Processing API running`);
  console.log(`📍 Base URL: http://localhost:${PORT}`);
  console.log(``);
  console.log(`POST /v1/documents/:documentId/process`);
  console.log(`GET  /v1/processing/:jobId`);
  console.log(``);
  console.log(`🔐 Valid token: Bearer ${VALID_TOKEN}`);
  console.log(`📄 Known documents: ${[...knownDocuments].join(", ")}`);
  console.log(``);
});