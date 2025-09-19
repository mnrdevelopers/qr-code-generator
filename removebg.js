document.addEventListener('DOMContentLoaded', function () {
  const inputField = document.getElementById('userImg');
  const removeBackgroundButton = document.getElementById('removeBackground');
  const imagePreview = document.getElementById('imagePreview');
  const bgRemove = document.getElementById('bgRemove');
  const downloadButton = document.getElementById('downloadButton');
  const colorPicker = document.getElementById('colorPicker');

  let processedImgUrl = null;
  let originalOutputBlob = null;

  inputField.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.innerHTML = `<img src="${e.target.result}" alt="Original">`;
      bgRemove.innerHTML = '';
      downloadButton.style.display = 'none';
      processedImgUrl = null;
      originalOutputBlob = null;
      bgRemove.style.backgroundColor = '#fafcff';
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
          'X-Api-Key': 'v1A4eZgNXeDcmJnFH1asWxkS', // Replace with your remove.bg API key
        },
        body: formData,
      });
      if (!response.ok) throw new Error('API error');
      const result = await response.blob();
      processedImgUrl = URL.createObjectURL(result);
      originalOutputBlob = result;
      bgRemove.innerHTML = `<img id="outputImg" src="${processedImgUrl}" alt="Removed Background">`;
      bgRemove.style.backgroundColor = colorPicker.value;
      downloadButton.style.display = 'inline-block';
    } catch (error) {
      console.error('Error removing background:', error);
      bgRemove.innerHTML = "<span style='color:red;'>Error removing background!</span>";
      downloadButton.style.display = 'none';
    }
  });

  colorPicker.addEventListener('input', function () {
    const outputImg = bgRemove.querySelector("#outputImg");
    if (outputImg) {
      bgRemove.style.backgroundColor = colorPicker.value;
    }
  });

  downloadButton.addEventListener('click', function (e) {
    e.preventDefault();
    const outputImg = bgRemove.querySelector("#outputImg");
    if (!outputImg) return;

    // Create canvas the size of the image
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      // Fill canvas with selected background color
      ctx.fillStyle = colorPicker.value;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the transparent processed image on top
      ctx.drawImage(img, 0, 0);

      // Create a download link from the canvas
      const link = document.createElement('a');
      link.download = 'background_changed_image.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = outputImg.src;
  });
});
