var galleryContainer = document.querySelector('#gallery-container');

// Registrando o Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        let reg;
        reg = await navigator.serviceWorker.register('/sw.js', { type: 'module' });
        console.log('✅ Service Worker registrado! 😎', reg);
      } catch (err) {
        console.log('😢 O Service Worker falhou: ', err);
      }
    });
  }
  
  // Configurando as constraints de vídeo stream
  var constraints = { video: { facingMode: 'user' }, audio: false };
  
  // Capturando os elementos na tela
  var cameraView = document.querySelector('#camera--view');
  var cameraOutput = document.querySelector('#camera--output');
  var cameraSensor = document.querySelector('#camera--sensor');
  var cameraTrigger = document.querySelector('#camera--trigger');
  
  // Estabelecendo o acesso à câmera e inicializando a visualização
  function cameraStart() {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        const track = stream.getTracks()[0];
        cameraView.srcObject = stream;
      })
      .catch(function (error) {
        console.error('Ocorreu um Erro: ', error);
      });
  }

  // ✅ Função para buscar fotos do backend
async function getPhotos() {
  try {
      const response = await fetch('http://localhost:3000/api/photos'); // Endpoint para buscar as fotos
      if (!response.ok) throw new Error('Erro ao buscar fotos');
      return await response.json(); // Retorna a lista de fotos como JSON
  } catch (error) {
      console.error('❌ Erro ao buscar fotos:', error);
      return [];
  }
}

  // Converter Base64 para Blob (necessário para envio ao backend)
function dataURLtoBlob(dataURL) {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
      uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeString });
}
  
cameraTrigger.onclick = async function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext('2d').drawImage(cameraView, 0, 0);
  const photoData = cameraSensor.toDataURL('image/webp'); // Converte para Base64

  try {
      const formData = new FormData();
      formData.append('image', dataURLtoBlob(photoData), 'photo.webp');

      const response = await fetch('/api/photos', { // ALTERADO AQUI
        method: 'POST',
        body: formData,
    });
    

      if (!response.ok) throw new Error('Erro ao salvar imagem');

      const result = await response.json();
      console.log('✅ Foto salva com sucesso:', result);

      cameraOutput.src = photoData;
      cameraOutput.classList.add('taken');
      displayGallery();
  } catch (error) {
      console.error('❌ Erro ao salvar foto:', error);
  }
};

// Exibir fotos salvas na galeria
function displayGallery() {
  getPhotos().then((photos) => {
    galleryContainer.innerHTML = ''; // Limpar antes de exibir
    photos.forEach((photo) => {
      const imgElement = document.createElement('img');
      imgElement.src = photo.photo;
      imgElement.alt = 'Foto salva';
      imgElement.classList.add('gallery-item');
      galleryContainer.appendChild(imgElement);
    });
  });
}

  
  // Inicia a câmera quando a janela carregar
  window.addEventListener('load', () => {
    cameraStart();
    displayGallery(); // Exibe as fotos salvas ao carregar a página
});  