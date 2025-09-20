// Navigation functionality
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("active");
});

document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
  hamburger.classList.remove("active");
  navMenu.classList.remove("active");
  
  // Remove active class from all links
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.remove("active");
  });
  
  // Add active class to clicked link
  event.target.classList.add("active");
}));

// File upload functionality
document.getElementById('upload-btn').addEventListener('click', function () {
  document.getElementById('logo-upload').click();
});

document.getElementById('logo-upload').addEventListener('change', function (event) {
  const file = event.target.files[0];
  const fileName = document.getElementById('file-name');
  if (file && file.type.startsWith('image/')) {
    fileName.textContent = file.name;
  } else {
    fileName.textContent = 'No file chosen';
    alert('Please upload a valid image file.');
  }
});

// Toggle between QR and Barcode options
document.getElementById('code-type').addEventListener('change', function() {
  const codeType = this.value;
  const barcodeOptions = document.getElementById('barcode-options');
  const qrColorGroup = document.getElementById('qr-color-group');
  const logoUploadSection = document.getElementById('logo-upload-section');
  const codeContainer = document.getElementById('code-container');
  
  if (codeType === 'barcode') {
    barcodeOptions.style.display = 'block';
    logoUploadSection.style.display = 'none';
    codeContainer.classList.add('barcode-mode');
    document.getElementById('barcode').style.display = 'block';
    document.getElementById('qr-code').style.display = 'none';
  } else {
    barcodeOptions.style.display = 'none';
    logoUploadSection.style.display = 'block';
    codeContainer.classList.remove('barcode-mode');
    document.getElementById('barcode').style.display = 'none';
    document.getElementById('qr-code').style.display = 'block';
  }
});

let qrCodeInstance = null;

document.getElementById('generate-btn').addEventListener('click', function () {
  const codeType = document.getElementById('code-type').value;
  const input = codeType === 'qr' 
    ? document.getElementById('qr-input').value 
    : document.getElementById('barcode-input').value;
  
  const qrCodeDiv = document.getElementById('qr-code');
  const barcodeSvg = document.getElementById('barcode');
  const dummyQr = document.querySelector('.dummy-qr');
  const downloadBtn = document.getElementById('download-btn');
  const shareBtn = document.getElementById('share-btn');
  const color = document.getElementById('color-picker').value;
  const logoFile = document.getElementById('logo-upload').files[0];
  const scanningAnimation = document.getElementById('scanning-animation');

  if (input.trim() === '') {
    alert(`Please enter ${codeType === 'qr' ? 'text or a URL' : 'barcode data (numbers)'}.`);
    return;
  }

  // Clear previous instances
  if (qrCodeInstance) {
    qrCodeInstance.clear();
    qrCodeInstance = null;
  }
  qrCodeDiv.innerHTML = '';
  barcodeSvg.innerHTML = '';

  // Hide the dummy QR code
  dummyQr.style.display = 'none';

  // Show the scanning animation
  scanningAnimation.style.opacity = '1';
  this.disabled = true;

  setTimeout(() => {
    scanningAnimation.style.opacity = '0';

    if (codeType === 'qr') {
      generateQRCode(input, qrCodeDiv, color, logoFile, downloadBtn, shareBtn);
    } else {
      generateBarcode(input, barcodeSvg, color, downloadBtn, shareBtn);
    }

    this.disabled = false;
  }, 3000);
});

function generateQRCode(input, qrCodeDiv, color, logoFile, downloadBtn, shareBtn) {
  qrCodeInstance = new QRCode(qrCodeDiv, {
    text: input,
    width: 200,
    height: 200,
    colorDark: color,
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  });

  setTimeout(() => {
    const qrImage = qrCodeDiv.querySelector('img');
    if (qrImage) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 200;

      ctx.drawImage(qrImage, 0, 0, 200, 200);

      if (logoFile) {
        const logo = new Image();
        logo.src = URL.createObjectURL(logoFile);
        logo.onload = () => {
          const logoSize = 40;
          const logoX = (200 - logoSize) / 2;
          const logoY = (200 - logoSize) / 2;
          ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
          qrCodeDiv.innerHTML = '';
          qrCodeDiv.appendChild(canvas);
          setupDownloadAndShare(canvas, downloadBtn, shareBtn, 'qrcode_with_logo.png');
        };
      } else {
        qrCodeDiv.classList.add('show');
        setupDownloadAndShare(qrImage, downloadBtn, shareBtn, 'qrcode.png');
      }
    }
  }, 100);
}

function generateBarcode(input, barcodeSvg, color, downloadBtn, shareBtn) {
  try {
    // First generate the barcode to get its dimensions
    JsBarcode(barcodeSvg, input, {
      format: document.getElementById('barcode-type').value,
      lineColor: color,
      width: 2,
      height: 100,
      displayValue: true,
      margin: 10
    });

    // Get the actual width of the generated barcode
    const barcodeWidth = barcodeSvg.getBoundingClientRect().width;
    const barcodeHeight = barcodeSvg.getBoundingClientRect().height;

    // Create a canvas with proper dimensions
    const canvas = document.createElement('canvas');
    canvas.width = barcodeWidth;
    canvas.height = barcodeHeight;
    const ctx = canvas.getContext('2d');

    // Create an image from the SVG
    const svgData = new XMLSerializer().serializeToString(barcodeSvg);
    const img = new Image();

    img.onload = function() {
      // Draw the image on canvas
      ctx.drawImage(img, 0, 0, barcodeWidth, barcodeHeight);
      
      // Set up download and share with the correct dimensions
      setupDownloadAndShare(canvas, downloadBtn, shareBtn, 'barcode.png');
      
      // Adjust container size to fit the barcode
      const container = document.getElementById('code-container');
      container.style.width = barcodeWidth + 'px';
      container.style.height = barcodeHeight + 'px';
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    barcodeSvg.style.display = 'block';

  } catch (e) {
    alert('Invalid barcode data for selected type: ' + e.message);
    downloadBtn.disabled = true;
    shareBtn.disabled = true;
  }
}

function setupDownloadAndShare(element, downloadBtn, shareBtn, filename) {
  downloadBtn.disabled = false;
  shareBtn.disabled = false;

  downloadBtn.onclick = function() {
    const link = document.createElement('a');
    if (element instanceof HTMLCanvasElement) {
      link.href = element.toDataURL('image/png');
    } else if (element instanceof HTMLImageElement || element instanceof SVGElement) {
      link.href = element.src;
    }
    link.download = filename;
    link.click();
  };

  shareBtn.onclick = function() {
    if (element instanceof HTMLCanvasElement) {
      element.toBlob(function(blob) {
        shareFile(blob, filename);
      });
    } else if (element instanceof HTMLImageElement) {
      fetch(element.src)
        .then(res => res.blob())
        .then(blob => shareFile(blob, filename));
    }
  };
}

function shareFile(blob, filename) {
  const file = new File([blob], filename, { type: 'image/png' });
  const shareData = {
    files: [file],
  };
  
  if (navigator.canShare && navigator.canShare(shareData)) {
    navigator.share(shareData)
      .then(() => console.log('Code shared successfully'))
      .catch((error) => console.error('Error sharing code:', error));
  } else {
    alert('Sharing not supported in this browser.');
  }
}
