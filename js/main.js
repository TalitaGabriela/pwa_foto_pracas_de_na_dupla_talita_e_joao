var galleryContainer = document.querySelector("#gallery-container");

// Banco de Dados no IndexedDB para armazenar as fotos
const DB_NAME = "PhotoGalleryDB";
const DB_VERSION = 1;
let db;

// Abrir conexão com o IndexedDB
function openDB() {
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = function (event) {
    let db = event.target.result;
    if (!db.objectStoreNames.contains("photos")) {
      db.createObjectStore("photos", { keyPath: "id", autoIncrement: true });
    }
  };

  request.onsuccess = function (event) {
    db = event.target.result;
    displayGallery(); // Exibir as fotos salvas ao abrir o app
  };

  request.onerror = function (event) {
    console.error("❌ Erro ao abrir IndexedDB:", event.target.errorCode);
  };
}

// Salvar imagem no IndexedDB
function savePhotoToDB(photoData) {
  const transaction = db.transaction(["photos"], "readwrite");
  const store = transaction.objectStore("photos");
  store.add({ photo: photoData });

  transaction.oncomplete = function () {
    console.log("✅ Foto salva no banco de dados!");
    displayGallery(); // Atualizar a galeria após salvar
  };

  transaction.onerror = function (event) {
    console.error("❌ Erro ao salvar foto:", event.target.error);
  };
}

// Buscar fotos do IndexedDB e exibir na galeria
function displayGallery() {
  galleryContainer.innerHTML = ""; // Limpa antes de exibir

  const transaction = db.transaction(["photos"], "readonly");
  const store = transaction.objectStore("photos");
  const request = store.getAll();

  request.onsuccess = function () {
    const photos = request.result;
    photos.forEach((photo) => {
      const card = document.createElement("div");
      card.classList.add("gallery-card");

      const imgElement = document.createElement("img");
      imgElement.src = photo.photo;
      imgElement.alt = "Foto salva";

      card.appendChild(imgElement);
      galleryContainer.appendChild(card);
    });
  };
}

// Captura de Foto
var constraints = { video: { facingMode: "user" }, audio: false };
var cameraView = document.querySelector("#camera--view");
var cameraSensor = document.querySelector("#camera--sensor");
var cameraTrigger = document.querySelector("#camera--trigger");

function cameraStart() {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      cameraView.srcObject = stream;
    })
    .catch((error) => console.error("Ocorreu um erro: ", error));
}

cameraTrigger.onclick = function () {
  cameraSensor.width = cameraView.videoWidth;
  cameraSensor.height = cameraView.videoHeight;
  cameraSensor.getContext("2d").drawImage(cameraView, 0, 0);

  const photoData = cameraSensor.toDataURL("image/webp"); // Converte para Base64
  savePhotoToDB(photoData); // Salva no IndexedDB
};

// Iniciar câmera e carregar galeria ao abrir
window.addEventListener("load", () => {
  openDB();
  cameraStart();
});
