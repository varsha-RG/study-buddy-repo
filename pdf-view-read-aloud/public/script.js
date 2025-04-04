// public/script.js

// Configure PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let pdfDoc = null,
    currentPage = 1,
    totalPages = 0,
    scale = 1.5,
    canvas = document.getElementById('pdfCanvas'),
    ctx = canvas.getContext('2d');

// Handle file input
document.getElementById('pdfInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file.type !== 'application/pdf') {
    alert('Please select a PDF file.');
    return;
  }
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const typedarray = new Uint8Array(this.result);
    loadPDF(typedarray);
  };
  fileReader.readAsArrayBuffer(file);
});

// Load PDF
function loadPDF(data) {
  pdfjsLib.getDocument(data).promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    totalPages = pdfDoc.numPages;
    document.getElementById('pageCount').textContent = totalPages;
    currentPage = 1;
    renderPage(currentPage);
  }).catch(err => {
    console.error('Error loading PDF: ' + err.message);
  });
}

// Render page
function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    const renderTask = page.render(renderContext);
    
    renderTask.promise.then(() => {
      document.getElementById('pageNum').textContent = num;
      page.getTextContent().then(textContent => {
        window.currentPageText = textContent.items.map(item => item.str).join(' ');
      });
    });
  });
}
// Populate voice options dynamically
function loadVoices() {
  let voices = speechSynthesis.getVoices();
  const voiceSelect = document.getElementById('voiceSelect');
  voiceSelect.innerHTML = ''; // Clear existing options

  voices.forEach((voice, index) => {
    let option = document.createElement('option');
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

// Load voices when available
speechSynthesis.onvoiceschanged = loadVoices;

// Read aloud function with selected voice
document.getElementById('readAloud').addEventListener('click', () => {
  const textToRead = window.currentPageText || 'No text available';
  const utterance = new SpeechSynthesisUtterance(textToRead);
  
  // Get selected voice
  let voices = speechSynthesis.getVoices();
  let selectedVoice = voices[document.getElementById('voiceSelect').value];
  utterance.voice = selectedVoice;

  utterance.rate = parseFloat(document.getElementById('speedRange').value);
  
  window.currentUtterance = utterance;
  speechSynthesis.speak(utterance);
});


// Navigation
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage <= 1) return;
  currentPage--;
  renderPage(currentPage);
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage >= totalPages) return;
  currentPage++;
  renderPage(currentPage);
});

// Read Aloud with Adjustable Speed
document.getElementById('readAloud').addEventListener('click', () => {
  const textToRead = window.currentPageText || 'No text available';
  
  const utterance = new SpeechSynthesisUtterance(textToRead);
  utterance.rate = parseFloat(document.getElementById('speedRange').value); // Use slider speed
  
  window.currentUtterance = utterance;
  speechSynthesis.speak(utterance);
});

// Stop speech
document.getElementById('stopSpeech').addEventListener('click', () => {
  speechSynthesis.cancel();
});

// Update speed display
document.getElementById('speedRange').addEventListener('input', function() {
  document.getElementById('speedValue').textContent = this.value + "x";
});
