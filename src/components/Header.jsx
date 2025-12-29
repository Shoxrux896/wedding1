import { useEffect, useState } from 'react';
import { motion as Motion, useScroll, useTransform } from 'framer-motion';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { staggerContainer, staggerItem } from '../utils/animations';

export default function Header({ settings }) {
  const [title, setTitle] = useState(settings?.title || '');
  const [backgroundUrl, setBackgroundUrl] = useState(settings?.backgroundUrl || '');
  // If settings are passed from App, we are already "loaded"
  const [loading, setLoading] = useState(!settings);
  const { scrollY } = useScroll();

  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);
  const backgroundOpacity = useTransform(scrollY, [0, 300], [0.6, 0.3]);

  useEffect(() => {
    if (settings) {
      setTitle(settings.title || '');
      setBackgroundUrl(settings.backgroundUrl || '');
      setLoading(false);
      return;
    }

    const loadHeader = async () => {
      try {
        const ref = doc(db, 'settings', 'header');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          if (data.title) setTitle(data.title);
          if (data.backgroundUrl) setBackgroundUrl(data.backgroundUrl);
        }
      } catch (error) {
        console.error('Error loading header settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHeader();
  }, [settings]);

  if (loading) {
    return (
      <header
        style={{
          position: 'relative',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1a1a1a',
        }}
      >
        <div className="spinner"></div>
      </header>
    );
  }

  return (
    <header
      style={{
        position: 'relative',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
      }}
    >
      {backgroundUrl && (
        <Motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '120%',
            backgroundImage: `url(${backgroundUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: backgroundOpacity,
            y: backgroundY,
            zIndex: 1,
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
          zIndex: 2,
        }}
      />

      <Motion.div
        className="header-content"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          zIndex: 3,
          textAlign: 'center',
          padding: '60px 20px',
          color: '#fff',
        }}
      >
        <Motion.h1
          variants={staggerItem}
          style={{
            fontSize: 'clamp(32px, 6vw, 56px)',
            fontWeight: 400,
            margin: 0,
            textShadow: '2px 4px 12px rgba(0,0,0,0.8)',
            lineHeight: 1.2,
            color: '#ffffff',
            fontFamily: 'Cormorant, serif',
          }}
        >

          {title || "Свадебный Видеограф Aydarov Baxtibek"}
          <p className='header-subtitle'>Свадебный Видеограф Aydarov Baxtibek</p>
        </Motion.h1>
      </Motion.div>
    </header>
  );
}