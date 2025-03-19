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

// Automatically generate QR code when input changes
document.getElementById('qr-input').addEventListener('input', function () {
  generateQRCode();
});

// Automatically generate QR code when color changes
document.getElementById('color-picker').addEventListener('change', function () {
  generateQRCode();
});

// Automatically generate QR code when logo is uploaded
document.getElementById('logo-upload').addEventListener('change', function () {
  generateQRCode();
});

function generateQRCode() {
  const input = document.getElementById('qr-input').value;
  const qrCodeDiv = document.getElementById('qr-code');
  const dummyQr = document.querySelector('.dummy-qr');
  const downloadBtn = document.getElementById('download-btn');
  const shareBtn = document.getElementById('share-btn');
  const color = document.getElementById('color-picker').value;
  const logoFile = document.getElementById('logo-upload').files[0];
  const scanningAnimation = document.getElementById('scanning-animation');

  if (input.trim() === '') {
    // Clear the QR code if input is empty
    qrCodeDiv.innerHTML = '';
    dummyQr.style.display = 'block';
    downloadBtn.disabled = true;
    shareBtn.disabled = true;
    return;
  }

  // Clear previous QR code
  qrCodeDiv.innerHTML = '';

  // Hide the dummy QR code
  dummyQr.style.display = 'none';

  // Show the scanning animation
  scanningAnimation.style.opacity = '1';

  // Wait for 5 seconds to simulate scanning
  setTimeout(() => {
    // Hide the scanning animation
    scanningAnimation.style.opacity = '0';

    // Generate QR code at fixed size (200x200)
    const qr = new QRCode(qrCodeDiv, {
      text: input,
      width: 200,
      height: 200,
      colorDark: color,
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });

    // Wait for QR code to be generated
    setTimeout(() => {
      const qrImage = qrCodeDiv.querySelector('img');
      if (qrImage) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;

        // Draw QR code on canvas
        ctx.drawImage(qrImage, 0, 0, 200, 200);

        // Load logo (uploaded file)
        if (logoFile) {
          const logo = new Image();
          logo.src = URL.createObjectURL(logoFile);
          logo.onload = () => {
            // Calculate logo size and position
            const logoSize = 40; // Logo size is 20% of QR code size (200 * 0.2 = 40)
            const logoX = (200 - logoSize) / 2;
            const logoY = (200 - logoSize) / 2;

            // Draw logo on canvas
            ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

            // Replace QR code image with canvas
            qrCodeDiv.innerHTML = '';
            qrCodeDiv.appendChild(canvas);

            // Unlock download and share buttons
            downloadBtn.disabled = false;
            shareBtn.disabled = false;

            // Update download functionality
            downloadBtn.onclick = function () {
              const link = document.createElement('a');
              link.href = canvas.toDataURL('image/png');
              link.download = 'qrcode_with_logo.png';
              link.click();
            };

            // Update share functionality
            shareBtn.onclick = function () {
              canvas.toBlob(function (blob) {
                const file = new File([blob], 'qrcode_with_logo.png', { type: 'image/png' });
                const shareData = {
                  files: [file],
                };
                if (navigator.canShare && navigator.canShare(shareData)) {
                  navigator.share(shareData)
                    .then(() => console.log('QR code shared successfully'))
                    .catch((error) => console.error('Error sharing QR code:', error));
                } else {
                  alert('Sharing not supported in this browser.');
                }
              });
            };
          };
        } else {
          // If no logo, show the QR code as is
          qrCodeDiv.classList.add('show');
          downloadBtn.disabled = false;
          shareBtn.disabled = false;

          downloadBtn.onclick = function () {
            const link = document.createElement('a');
            link.href = qrImage.src;
            link.download = 'qrcode.png';
            link.click();
          };

          shareBtn.onclick = function () {
            const link = document.createElement('a');
            link.href = qrImage.src;
            link.download = 'qrcode.png';
            const file = new File([link.href], 'qrcode.png', { type: 'image/png' });
            const shareData = {
              files: [file],
            };
            if (navigator.canShare && navigator.canShare(shareData)) {
              navigator.share(shareData)
                .then(() => console.log('QR code shared successfully'))
                .catch((error) => console.error('Error sharing QR code:', error));
            } else {
              alert('Sharing not supported in this browser.');
            }
          };
        }
      }
    }, 100); // Delay to ensure QR code is rendered
  }, 5000); // 5-second delay for the scanning animation
}
