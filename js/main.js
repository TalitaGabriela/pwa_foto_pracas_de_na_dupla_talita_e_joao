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
  
  // Função para tirar foto
  cameraTrigger.onClick = function () {
    cameraSensor.width = cameraView.videoWidth;
    cameraSensor.height = cameraView.videoHeight;
    cameraSensor.getContext('2d').drawImage(cameraView, 0, 0);
    cameraOutput.src = cameraSensor.toDataURL('image/webp');
    cameraOutput.classList.add('taken');
  };
  
  // Inicia a câmera quando a janela carregar
  window.addEventListener('load', cameraStart, false);  