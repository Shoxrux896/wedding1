import { useEffect, useState, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop } from '../utils/animations';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Share2
} from 'lucide-react';

export function LightBox({ image, allImages, onClose }) {
  const [scale, setScale] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [initialImage, setInitialImage] = useState(null);

  // Sync currentIndex only when a new image is clicked in the gallery
  useEffect(() => {
    if (image && image !== initialImage && allImages) {
      const idx = allImages.indexOf(image);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setInitialImage(image);
      }
    } else if (!image) {
      setInitialImage(null);
    }
  }, [image, allImages, initialImage]);


  useEffect(() => {
    setScale(1)
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  }, [allImages]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  }, [allImages]);

 
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [image, handleNext, handlePrev, onClose]);

  // Slideshow logic
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(handleNext, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, handleNext]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.5, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.5, 1));

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(allImages[currentIndex]);
      alert('Ссылка скопирована!');
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  if (!image) return null;

  return (
    <AnimatePresence>
      <Motion.div
        id="lightbox"
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => {
          if (e.target.id === 'lightbox') onClose();
        }}
        style={{
          display: 'flex',
        }}
      >
        <div style={{
          position: 'absolute',
          top: 20,
          right: 20,
          display: 'flex',
          gap: 15,
          zIndex: 10001
        }}>
          <ControlButton onClick={handleZoomIn} icon={<ZoomIn size={20} />} tooltip="Zoom In" />
          <ControlButton onClick={handleZoomOut} icon={<ZoomOut size={20} />} tooltip="Zoom Out" />
          <ControlButton
            onClick={() => setIsPlaying(!isPlaying)}
            icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
            tooltip={isPlaying ? "Pause" : "Slideshow"}
          />
          <ControlButton onClick={handleShare} icon={<Share2 size={20} />} tooltip="Share" />
          <ControlButton onClick={onClose} icon={<X size={24} />} tooltip="Close" />
        </div>

        <NavButton direction="left" onClick={handlePrev} icon={<ChevronLeft size={40} />} />
        <NavButton direction="right" onClick={handleNext} icon={<ChevronRight size={40} />} />

        <Motion.div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          <Motion.img
            key={allImages[currentIndex]} // Key to trigger animation on change
            src={allImages[currentIndex]}
            alt="Lightbox"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0, scale: scale }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              objectFit: 'contain',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
              cursor: scale > 1 ? 'grab' : 'default',
            }}
          />
        </Motion.div>
      </Motion.div>
    </AnimatePresence>
  );
}

function ControlButton({ onClick, icon, tooltip }) {
  return (
    <Motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={tooltip}
      style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.2)',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        outline: 'none'
      }}
    >
      {icon}
    </Motion.button>
  );
}

function NavButton({ direction, onClick, icon }) {
  return (
    <Motion.div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'absolute',
        top: '50%',
        [direction]: 20,
        transform: 'translateY(-50%)',
        zIndex: 10001,
        cursor: 'pointer',
        padding: 20,
        borderRadius: '50%',
        color: 'white',
        opacity: 0.7,
        transition: 'opacity 0.2s'
      }}
    >
      {icon}
    </Motion.div>
  );
}