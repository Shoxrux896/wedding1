import { useState } from 'react';
import Progress from './Progress';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CLOUD_NAME = "dxvyf6vl7";
const UPLOAD_PRESET = "unsigned_preset";

export default function Uploader({ onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    const previewUrls = files.map(file => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    setPreviews([]);
    setProgress(0);
    setStatus('');
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Select at least one photo!');
      return;
    }

    setUploading(true);
    setStatus('Uploading...');
    setProgress(0);

    let uploadedCount = 0;

    for (let file of selectedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        const data = await response.json();

        if (data.secure_url) {
          await addDoc(collection(db, 'photos'), {
            url: data.secure_url,
            timestamp: serverTimestamp()
          });

          uploadedCount++;
          setProgress((uploadedCount / selectedFiles.length) * 100);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setStatus('❌ Upload failed for one file');
      }
    }

    setStatus('✅ All uploads completed!');
    setUploading(false);
    clearFiles();
    onUploadComplete();
  };

  return (
    <div className="panel" style={{
      padding: '40px',
      background: 'var(--color-white)',
      border: '1px solid var(--color-gray-200)',
      borderRadius: '0'
    }}>
      <h2 style={{
        marginTop: 0,
        fontFamily: "'Cormorant', serif",
        fontWeight: '400',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'var(--color-black)'
      }}>
        Загрузка фото
      </h2>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        style={{
          marginBottom: '15px',
          padding: '10px',
          border: '1px solid var(--color-gray-300)',
          width: '100%',
          boxSizing: 'border-box'
        }}
      />

      {previews.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '12px', marginBottom: '10px', textTransform: 'uppercase', color: 'var(--color-gray-500)' }}>
            Selected: {previews.length} photo(s)
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '10px',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {previews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Preview ${index + 1}`}
                style={{
                  width: '100%',
                  height: '80px',
                  objectFit: 'cover',
                  borderRadius: '0',
                  border: '1px solid var(--color-gray-200)'
                }}
              />
            ))}
          </div>
        </div>
      )}

      {uploading && <Progress progress={progress} />}

      {status && (
        <p style={{
          fontSize: '13px',
          color: status.includes('✅') ? 'var(--color-black)' : 'var(--color-gray-600)',
          marginBottom: '15px',
          padding: '10px',
          border: '1px solid var(--color-gray-300)',
          textAlign: 'center'
        }}>
          {status}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        style={{
          width: '100%',
          padding: '14px',
          background: (uploading || selectedFiles.length === 0) ? 'var(--color-gray-200)' : 'var(--color-black)',
          color: (uploading || selectedFiles.length === 0) ? 'var(--color-gray-500)' : 'var(--color-white)',
          border: '1px solid var(--color-black)',
          borderRadius: '0',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          fontWeight: '600',
          cursor: (uploading || selectedFiles.length === 0) ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s'
        }}
      >
        {uploading ? 'Uploading...' : 'Загрузить'}
      </button>

      {selectedFiles.length > 0 && !uploading && (
        <button
          onClick={clearFiles}
          style={{
            width: '100%',
            background: 'var(--color-white)',
            color: 'var(--color-black)',
            border: '1px solid var(--color-black)',
            padding: '14px',
            marginTop: '10px',
            borderRadius: '0',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--color-black)';
            e.target.style.color = 'var(--color-white)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'var(--color-white)';
            e.target.style.color = 'var(--color-black)';
          }}
        >
          Очистить
        </button>
      )}
    </div>
  );
}