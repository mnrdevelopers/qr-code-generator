document.addEventListener('DOMContentLoaded', function () {
  const inputField = document.getElementById('userImg');
  const removeBackgroundButton = document.getElementById('removeBackground');
  const imagePreview = document.getElementById('imagePreview');
  const bgRemove = document.getElementById('bgRemove');
  const downloadButton = document.getElementById('downloadButton');
  const bgOption = document.getElementById('bgOption');

  let processedImgUrl = null;

  inputField.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Original" />`;
      bgRemove.innerHTML = '';
      downloadButton.style.display = 'none';
      processedImgUrl = null;
      bgRemove.style.backgroundColor = '#fafcff';
      bgOption.value = 'transparent';
    };
    reader.readAsDataURL(file);
  });

  removeBackgroundButton.addEventListener('click', async function () {
    const file = inputField.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image_file', file);

    try {
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': 'v1A4eZgNXeDcmJnFH1asWxkS', // Replace with your remove.bg API Key
        },
        body: formData,
      });

      if (!response.ok) throw new Error('API error');

      const result = await response.blob();
      processedImgUrl = URL.createObjectURL(result);
      bgRemove.innerHTML = `<img id="outputImg" src="${processedImgUrl}" alt="Removed Background" />`;

      // Set preview background according to selected option
      if (bgOption.value === 'transparent') {
        bgRemove.style.backgroundColor = 'transparent';
      } else {
        bgRemove.style.backgroundColor = bgOption.value;
      }

      downloadButton.style.display = 'inline-block';
    } catch (error) {
      console.error('Error removing background:', error);
      bgRemove.innerHTML = "<span style='color:red;'>Error removing background!</span>";
      downloadButton.style.display = 'none';
    }
  });

  // Change preview background color when user selects a new option
  bgOption.addEventListener('change', function () {
    if (bgOption.value === 'transparent') {
      bgRemove.style.backgroundColor = 'transparent';
    } else {
      bgRemove.style.backgroundColor = bgOption.value;
    }
  });

  // Handle download, applying background color or transparency in canvas
  downloadButton.addEventListener('click', function (e) {
    e.preventDefault();
    const outputImg = bgRemove.querySelector('#outputImg');
    if (!outputImg) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      if (bgOption.value !== 'transparent') {
        ctx.fillStyle = bgOption.value;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const link = document.createElement('a');
      link.download = 'image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    img.src = outputImg.src;
  });
});
