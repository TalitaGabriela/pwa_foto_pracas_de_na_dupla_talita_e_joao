const dbPromise = idb.openDB('photo-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  
  export const savePhoto = async (photoData) => {
    const db = await dbPromise;
    await db.add('photos', { photo: photoData });
  };
  
  export const getPhotos = async () => {
    const db = await dbPromise;
    return db.getAll('photos');
  };  