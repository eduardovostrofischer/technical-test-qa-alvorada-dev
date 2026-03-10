const fileInput = document.getElementById('fileInput')
const uploadBtn = document.getElementById('uploadBtn')
const statusBox = document.getElementById('status')
const fileInfo = document.getElementById('fileInfo')
const fileNameEl = document.getElementById('fileName')
const fileSizeEl = document.getElementById('fileSize')
const tokenInput = document.getElementById('tokenInput')
const dropzone = document.getElementById('dropzone')

let selectedFile = null

// ---------- Helpers ----------

function showStatus(message, type) {
  statusBox.textContent = message
  statusBox.className = `status ${type}`
  statusBox.classList.remove('hidden')
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
  })
}

function isPDF(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

function setFile(file) {
  if (!isPDF(file)) {
    showStatus('Error: File is not PDF', 'error')
    selectedFile = null
    fileInfo.classList.add('hidden')
    return
  }

  selectedFile = file
  fileNameEl.textContent = file.name
  fileSizeEl.textContent = `${(file.size / 1024).toFixed(2)} KB`
  fileInfo.classList.remove('hidden')
  statusBox.classList.add('hidden')
}

// ---------- Drag and Drop ----------

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzone.classList.add('dragover')
})

dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragover')
})

dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzone.classList.remove('dragover')
  const file = e.dataTransfer?.files[0]
  if (file) setFile(file)
})

dropzone.addEventListener('click', (e) => {
  if (e.target !== fileInput) {
    fileInput.click()
  }
})

// ---------- Events ----------

fileInput.addEventListener('change', () => {
  const file = fileInput.files[0]
  if (!file) return
  setFile(file)
})

uploadBtn.addEventListener('click', async () => {
  if (!selectedFile) {
    showStatus('Error: missing PDF Document', 'error')
    return
  }

  uploadBtn.disabled = true
  showStatus('Uploading...', 'success')

  try {
    const base64 = await toBase64(selectedFile)

    const response = await fetch('http://localhost:3000/v1/pdfDocuments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenInput.value}`
      },
      body: JSON.stringify({
        PDFDocument: base64,
        fileName: selectedFile.name
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Upload failed')
    }

    showStatus(`Upload successful! Document ID: ${data.documentId}`, 'success')
  } catch (err) {
    showStatus(`❌ ${err.message}`, 'error')
  } finally {
    uploadBtn.disabled = false
  }
})