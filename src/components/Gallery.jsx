import { useState, useEffect } from 'react';
import { PhotoGrid } from './PhotoGrid';
import { db, ALBUM_CATEGORIES } from '../firebase';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { LightBox } from './LightBox';

export default function Gallery({ selectedAlbum: externalAlbum = 'all' }) {
  const [photos, setPhotos] = useState([]);
  const [allPhotos, setAllPhotos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState(externalAlbum);
  const [clientSlug, setClientSlug] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('client');
    const normalized = (slug || 'public').trim().toLowerCase();
    setClientSlug(normalized);
  }, []);

  useEffect(() => {
    if (externalAlbum !== selectedAlbum) {
      setSelectedAlbum(externalAlbum);

    }
  }, [externalAlbum, selectedAlbum]);

  useEffect(() => {
    if (!clientSlug) return;



    const loadPhotos = async () => {
      if (loading) return;
      setLoading(true);

      try {
        const photosRef = collection(db, 'photos');
        const q = query(
          photosRef,
          where('clientSlug', '==', clientSlug)
        );

        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          let newPhotos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          if (selectedAlbum !== 'all') {
            newPhotos = newPhotos.filter(photo => photo.album === selectedAlbum);
          }
          newPhotos.sort((a, b) => {
            if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
            return b.timestamp - a.timestamp;
          });
          setPhotos(newPhotos);
          setAllPhotos(newPhotos);
        } else {
          setPhotos([]);
          setAllPhotos([]);
        }
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setLoading(false);
      }
    };


    loadPhotos();
  }, [selectedAlbum, clientSlug]);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const downloadAll = async () => {
    try {
      if (!window.JSZip || !window.saveAs) {
        setLoading(true);
        await Promise.all([
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'),
          loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js')
        ]);
      }

      const zip = new window.JSZip();
      setLoading(true);

      for (let i = 0; i < allPhotos.length; i++) {
        try {
          const response = await fetch(allPhotos[i].url);
          const blob = await response.blob();
          zip.file(`photo${i + 1}.jpg`, blob);
        } catch (error) {
          console.error('Error downloading photo:', error);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      window.saveAs(content, `wedding_photos_${selectedAlbum}.zip`);
    } catch (error) {
      console.error('Download failed', error);
      alert('Ошибка при загрузке архива');
    } finally {
      setLoading(false);
    }
  };

  const downloadSingle = async (url) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = 'photo.jpg';
    a.click();
  };



  return (
    <div style={{ padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

        <button
          id="download-all"
          className="download-all"
          onClick={downloadAll}
          style={{ position: 'relative', marginBottom: '20px' }}
        >
          Скачать все фото ({allPhotos.length})
        </button>

        <div className="gallery" id="gallery" loading="lazy">
          <PhotoGrid
            photos={photos}
            onPhotoClick={setLightboxImage}
            onDownload={downloadSingle}
          />
        </div>

        {photos.length === 0 && !loading && (
          <div loading="lazy" style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}>
            <p style={{ fontSize: '18px' }}>В этом альбоме пока нет фотографий</p>
          </div>
        )}

        <LightBox
          image={lightboxImage}
          allImages={photos.map(p => p.url)}
          onClose={() => setLightboxImage(null)}
        />

      </div>
    </div>
  );
}