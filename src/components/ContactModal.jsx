import { motion as Motion, AnimatePresence } from 'framer-motion';
import { modalBackdrop } from '../utils/animations';

export function ContactModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <Motion.div
          id="contact-modal1"
          className="modal1"
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => {
            if (e.target.id === 'contact-modal1') {
              onClose();
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Motion.div
            className="modal1-content"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              background: '#ffffff',
              padding: '50px 40px',
              borderRadius: '0',
              boxShadow: 'none',
              border: '1px solid #000000',
              maxWidth: '400px',
              width: '90%',
            }}
          >
            <Motion.span
              id="contact-close"
              className="modal1-close"
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '25px',
                fontSize: '28px',
                cursor: 'pointer',
                color: '#000000',
                fontWeight: '300',
                transition: 'transform 0.3s',
              }}
            >
              &times;
            </Motion.span>

            <Motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                color: '#000000',
                marginBottom: '10px',
                fontSize: '28px',
                fontWeight: '400',
                fontFamily: 'Cormorant, serif',
              }}
            >
              Aydarov Baxtibek
            </Motion.h2>

            <Motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              style={{
                color: '#404040',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              Видеограф
            </Motion.p>

            <Motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                color: '#404040',
                marginBottom: '20px',
                fontSize: '16px',
                fontWeight: '500',
              }}
            >
              +998 90 318 98 01
            </Motion.p>

            <Motion.a
              href="https://t.me/Baxtibek_official"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'block',
                color: '#000000',
                textDecoration: 'none',
                padding: '12px 20px',
                background: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '0',
                marginBottom: '12px',
                transition: 'all 0.3s',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.5px',
              }}
            >
              Telegram
            </Motion.a>

            <Motion.a
              href="https://www.instagram.com/baxtibek_official?igsh=NnRsNHBjdWNudzc2&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'block',
                color: '#000000',
                textDecoration: 'none',
                padding: '12px 20px',
                background: '#ffffff',
                border: '1px solid #000000',
                borderRadius: '0',
                transition: 'all 0.3s',
                fontSize: '14px',
                fontWeight: '500',
                letterSpacing: '0.5px',
              }}
            >
              Instagram
            </Motion.a>
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}