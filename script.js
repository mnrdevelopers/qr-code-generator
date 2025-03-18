document.getElementById('upload-btn').addEventListener('click', function () {
  document.getElementById('logo-upload').click();
});

document.getElementById('logo-upload').addEventListener('change', function (event) {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    alert('Logo uploaded successfully!');
  } else {
    alert('Please upload a valid image file.');
  }
});

document.getElementById('generate-btn').addEventListener('click', function () {
  const input = document.getElementById('qr-input').value;
  const qrCodeDiv = document.getElementById('qr-code');
  const downloadBtn = document.getElementById('download-btn');
  const color = document.getElementById('color-picker').value;
  const size = parseInt(document.getElementById('size-selector').value);
  const logoFile = document.getElementById('logo-upload').files[0];

  if (input.trim() === '') {
    alert('Please enter text or a URL.');
    return;
  }

  // Clear previous QR code
  qrCodeDiv.innerHTML = '';

  // Generate QR code
  const qr = new QRCode(qrCodeDiv, {
    text: input,
    width: size,
    height: size,
    colorDark: color,
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  });

  // Wait for QR code to be generated
  setTimeout(() => {
    const qrImage = qrCodeDiv.querySelector('img');
    if (qrImage && logoFile) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = size;
      canvas.height = size;

      // Draw QR code on canvas
      ctx.drawImage(qrImage, 0, 0, size, size);

      // Load logo image
      const logo = new Image();
      logo.src = URL.createObjectURL(logoFile);
      logo.onload = () => {
        // Calculate logo size and position
        const logoSize = size * 0.2; // Logo size is 20% of QR code size
        const logoX = (size - logoSize) / 2;
        const logoY = (size - logoSize) / 2;

        // Draw logo on canvas
        ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

        // Replace QR code image with canvas
        qrCodeDiv.innerHTML = '';
        qrCodeDiv.appendChild(canvas);

        // Show download button
        downloadBtn.style.display = 'block';

        // Update download functionality
        downloadBtn.onclick = function () {
          const link = document.createElement('a');
          link.href = canvas.toDataURL('image/png');
          link.download = 'qrcode_with_logo.png';
          link.click();
        };
      };
    } else if (qrImage) {
      // If no logo, show the QR code as is
      qrCodeDiv.classList.add('show');
      downloadBtn.style.display = 'block';

      downloadBtn.onclick = function () {
        const link = document.createElement('a');
        link.href = qrImage.src;
        link.download = 'qrcode.png';
        link.click();
      };
    }
  }, 100); // Delay to ensure QR code is rendered
});