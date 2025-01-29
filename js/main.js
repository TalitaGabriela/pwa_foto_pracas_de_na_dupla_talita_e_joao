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
  
  /// Função para tirar foto e salvar
cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext('2d').drawImage(cameraView, 0, 0);
  const photoData = cameraSensor.toDataURL('image/webp');
  
  savePhoto(photoData).then(() => {
    cameraOutput.src = photoData;
    cameraOutput.classList.add('taken');
    displayGallery();
  }).catch((error) => {
    console.error("Erro ao salvar foto", error);
  });
};

// Exibir fotos salvas na galeria
function displayGallery() {
  getPhotos().then((photos) => {
    galleryContainer.innerHTML = ''; // Limpar a galeria antes de exibir
    photos.forEach((photo, index) => {
      const imgElement = document.createElement('img');
      imgElement.src = photo.photo;
      imgElement.alt = `Foto ${index + 1}`;
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