import { useState, useEffect, useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import { staggerContainer, photoItem } from '../utils/animations';

import Masonry from 'react-masonry-css';

export function PhotoGrid({ photos, onPhotoClick, onDownload }) {
  const breakpointColumnsObj = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1
  };

  return (
    <Motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {photos.map((photo) => (
          <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => onPhotoClick(photo.url)}
            onDownload={() => onDownload(photo.url)}
          />
        ))}
      </Masonry>
    </Motion.div>
  );
}

function PhotoCard({ photo, onClick, onDownload }) {
  const [loaded, setLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current) {
            imgRef.current.src = photo.url;
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [photo.url]);

  return (
    <Motion.div
      className="photo-wrapper"
      variants={photoItem}
      whileHover={{
        y: -12,
        scale: 1.03,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{
        position: 'relative',
      }}
    >
      {/* Loading Skeleton */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            borderRadius: '12px',
          }}
        />
      )}

      <Motion.img
        ref={imgRef}
        alt="Wedding photo"
        className={`gallery-img lazy ${loaded ? 'loaded' : ''}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />

      {/* Download Icon with Animation */}
      <Motion.img
        src="/download.svg"
        alt="Download"
        className="download-icon"
        title="Скачать"
        onClick={(e) => {
          e.stopPropagation();
          onDownload();
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.8
        }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'absolute',
          cursor: 'pointer',
        }}
      />

      {/* Hover Overlay */}
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          borderRadius: '12px',
          pointerEvents: 'none',
        }}
      />
    </Motion.div>
  );
}