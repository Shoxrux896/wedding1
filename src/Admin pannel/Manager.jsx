import { useState } from 'react';

export default function Manager({ photos, onDelete }) {
  const [lightboxImage, setLightboxImage] = useState(null);

  return (
    <>
      <div className="photo-list">
        {photos.map((photo) => (
          <div key={photo.id} className="photo-wrapper">
            <img loading="lazy"
              src={photo.url}
              alt="Photo"
              onClick={() => setLightboxImage(photo.url)}
            />

            <button
              className="delete-btn"
              onClick={() => onDelete(photo.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {lightboxImage && (
        <div
          id="lightbox"
          style={{ display: 'flex' }}
          onClick={() => setLightboxImage(null)}
        >
          <img loading="lazy" src={lightboxImage} alt="Preview" />
        </div>
      )}
    </>
  );
}

