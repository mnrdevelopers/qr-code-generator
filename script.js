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

let selectedLogo = null;

// Popular logos functionality
document.querySelectorAll('.logo-item').forEach((logo) => {
  logo.addEventListener('click', function () {
    selectedLogo = this.getAttribute('data-logo');
    alert(`Selected logo: ${selectedLogo}`);
  });
});

document.getElementById('generate-btn').addEventListener('click', function () {
  const input = document.getElementById('qr-input').value;
  const qrCodeDiv = document.getElementById('qr-code');
  const dummyQr = document.querySelector('.dummy-qr');
  const downloadBtn = document.getElementById('download-btn');
  const shareBtn = document.getElementById('share-btn');
  const color = document.getElementById('color-picker').value;
  const logoFile = document.getElementById('logo-upload').files[0];

  if (input.trim() === '') {
    alert('Please enter text or a URL.');
    return;
  }

  // Clear previous QR code
  qrCodeDiv.innerHTML = '';

  // Hide the dummy QR code
  dummyQr.style.display = 'none';

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

      // Load logo (either uploaded file or selected popular logo)
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
      } else if (selectedLogo) {
        // Use FontAwesome icon as the logo
        const logoSize = 40; // Logo size is 20% of QR code size (200 * 0.2 = 40)
        const logoX = (200 - logoSize) / 2;
        const logoY = (200 - logoSize) / 2;

        // Draw FontAwesome icon on canvas
        ctx.font = `${logoSize}px FontAwesome`;
        ctx.fillStyle = getLogoColor(selectedLogo); // Use the logo's color
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getFontAwesomeIcon(selectedLogo), logoX + logoSize / 2, logoY + logoSize / 2);

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
});

// Helper function to get FontAwesome icon
function getFontAwesomeIcon(logoName) {
  switch (logoName) {
    case 'paypal':
      return '\uf1ed'; // PayPal icon
    case 'facebook':
      return '\uf09a'; // Facebook icon
    case 'instagram':
      return '\uf16d'; // Instagram icon
    case 'twitter':
      return '\uf099'; // Twitter icon
    case 'whatsapp':
      return '\uf232'; // WhatsApp icon
    case 'linkedin':
      return '\uf08c'; // LinkedIn icon
    default:
      return '';
  }
}

// Helper function to get logo color
function getLogoColor(logoName) {
  switch (logoName) {
    case 'paypal':
      return '#003087'; // PayPal color
    case 'facebook':
      return '#1877F2'; // Facebook color
    case 'instagram':
      return '#E4405F'; // Instagram color
    case 'twitter':
      return '#1DA1F2'; // Twitter color
    case 'whatsapp':
      return '#25D366'; // WhatsApp color
    case 'linkedin':
      return '#0A66C2'; // LinkedIn color
    default:
      return '#000000'; // Default color
  }
}
