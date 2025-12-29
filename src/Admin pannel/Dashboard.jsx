import { useState, useEffect, useRef } from 'react';
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  writeBatch
} from "firebase/firestore";

import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Trash2, GripVertical, CheckSquare, Square } from 'lucide-react';

const CLOUD_NAME = "dxvyf6vl7";
const UPLOAD_PRESET = "unsigned_preset";
const PARALLEL_UPLOADS = 5;
function SortablePhotoItem({ photo, isSelected, onToggle, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'relative',
        borderRadius: '0',
        overflow: 'hidden',
        border: isSelected ? '2px solid var(--color-black)' : '1px solid var(--color-gray-200)',
        transition: 'all 0.2s',
        background: 'white'
      }}
      className="photo-card"
    >
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          cursor: 'grab',
          background: 'rgba(255,255,255,0.8)',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} color="black" />
      </div>

      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 10,
          cursor: 'pointer'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(photo.id);
        }}
      >
        {isSelected ? (
          <CheckSquare size={20} color="black" fill="white" />
        ) : (
          <Square size={20} color="black" fill="rgba(255,255,255,0.8)" />
        )}
      </div>

      <img
        src={photo.url}
        alt="Photo"
        loading="lazy"
        draggable={false}
        onClick={onClick}
        style={{
          width: '100%',
          height: '200px',
          objectFit: 'cover',
          display: 'block',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

export default function Dashboard({ onLogout = () => alert('Logout') }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadStats, setUploadStats] = useState({ total: 0, completed: 0, failed: 0 });
  const [status, setStatus] = useState('');
  const [photos, setPhotos] = useState([]);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [clientSlug, setClientSlug] = useState('');
  const [headerTitle, setHeaderTitle] = useState('');
  const [headerBgUrl, setHeaderBgUrl] = useState('');
  const [savingHeader, setSavingHeader] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [activeId, setActiveId] = useState(null);

  const fileInputRef = useRef(null);
  const galleryRef = useRef(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const loadHeaderSettings = async () => {
    const ref = doc(db, "settings", "header");
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const s = snap.data();
      setHeaderTitle(s.title || "Свадебный Видеограф Aydarov Baxtibek");
      setHeaderBgUrl(s.backgroundUrl || "");
    }
  };
  const handleSaveHeaderSettings = async () => {
    setSavingHeader(true);

    await setDoc(doc(db, "settings", "header"), {
      title: headerTitle.trim(),
      backgroundUrl: headerBgUrl.trim(),
      updatedAt: Date.now()
    });

    setSavingHeader(false);
    alert("✅ Хедер обновлён");
  };

  const loadPhotos = async () => {
    const snap = await getDocs(collection(db, "photos"));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setPhotos(list.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
      return b.timestamp - a.timestamp;
    }));
  };

  useEffect(() => {
    loadHeaderSettings();
    loadPhotos();
  }, []);

  const handleDragEnter = e => { e.preventDefault(); e.stopPropagation(); setIsDraggingFile(true); };
  const handleDragLeave = e => { e.preventDefault(); e.stopPropagation(); setIsDraggingFile(false); };
  const handleDragOver = e => { e.preventDefault(); e.stopPropagation(); };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    if (files.length > 0) {
      setSelectedFiles(files);
      setShowPreview(files.length <= 50);
    }
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setShowPreview(files.length <= 50);
  };

  const uploadSingleFile = async (file, index) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        { method: "POST", body: formData }
      );

      const data = await response.json();

      if (data.secure_url) {
        return { success: true, url: data.secure_url, index };
      } else {
        throw new Error("No URL received");
      }
    } catch (error) {
      console.error(`Error uploading file ${index}:`, error);
      return { success: false, index, error: error.message };
    }
  };

  const uploadFilesInParallel = async files => {
    const results = [];
    const queue = files.map((file, index) => ({ file, index }));

    const uploadNext = async () => {
      if (queue.length === 0) return;

      const { file, index } = queue.shift();
      const result = await uploadSingleFile(file, index);
      results.push(result);

      setUploadStats(prev => ({
        ...prev,
        completed: prev.completed + (result.success ? 1 : 0),
        failed: prev.failed + (result.success ? 0 : 1)
      }));

      return uploadNext();
    };

    await Promise.all(Array(PARALLEL_UPLOADS).fill(null).map(uploadNext));
    return results;
  };

  const savePhotosToFirebase = async urls => {
    const timestamp = Date.now();
    const batch = writeBatch(db);

    const maxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.order || 0)) : 0;

    for (let i = 0; i < urls.length; i++) {
      const newDocRef = doc(collection(db, "photos"));
      batch.set(newDocRef, {
        url: urls[i],
        clientSlug: clientSlug.trim(),
        timestamp: timestamp + i,
        order: maxOrder + i + 1
      });
    }

    await batch.commit();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Выберите хотя бы одно фото!");
      return;
    }

    if (!clientSlug.trim()) {
      alert("Введите уникальный код клиента");
      return;
    }

    setUploading(true);
    setUploadStats({ total: selectedFiles.length, completed: 0, failed: 0 });
    setStatus(`Загружаю ${selectedFiles.length} фото...`);

    try {
      const results = await uploadFilesInParallel(selectedFiles);

      const successfulUrls = results.filter(r => r.success).map(r => r.url);

      if (successfulUrls.length > 0) {
        await savePhotosToFirebase(successfulUrls);
      }

      const failed = results.filter(r => !r.success).length;

      if (failed === 0) {
        setStatus(`✅ Все ${selectedFiles.length} фото загружены!`);
      } else {
        setStatus(`⚠️ Загружено: ${successfulUrls.length}, ошибок: ${failed}`);
      }

      setSelectedFiles([]);
      setShowPreview(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      loadPhotos();

      setTimeout(() => {
        setStatus("");
        setUploadStats({ total: 0, completed: 0, failed: 0 });
      }, 5000);
    } catch (error) {
      console.error(error);
      setStatus("Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  const handleToggleSelect = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map(p => p.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Удалить ${selectedIds.size} фото?`)) return;

    try {
      const batch = writeBatch(db);
      selectedIds.forEach(id => {
        batch.delete(doc(db, "photos", id));
      });
      await batch.commit();

      setSelectedIds(new Set());
      loadPhotos();
    } catch (error) {
      console.error("Error deleting photos:", error);
      alert("Ошибка при удалении");
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`Удалить ВСЕ ${photos.length} фото?`)) return;

    const snap = await getDocs(collection(db, "photos"));
    const actions = snap.docs.map(d => deleteDoc(doc(db, "photos", d.id)));
    await Promise.all(actions);

    setPhotos([]);
    setStatus("Все фотографии удалены!");
    setTimeout(() => setStatus(""), 3000);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);

      const newPhotos = arrayMove(photos, oldIndex, newIndex);
      setPhotos(newPhotos);

      try {
        const batch = writeBatch(db);
        newPhotos.forEach((photo, index) => {
          const docRef = doc(db, "photos", photo.id);
          batch.update(docRef, { order: index });
        });
        await batch.commit();
      } catch (error) {
        console.error("Error updating sort order:", error);
        alert("Ошибка при сохранении сортировки. Обновите страницу.");
        loadPhotos();
      }
    }
    setActiveId(null);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const progressPercent = uploadStats.total
    ? Math.round(((uploadStats.completed + uploadStats.failed) / uploadStats.total) * 100)
    : 0;

  return (
    <>
      <div style={{
        background: 'var(--color-black)',
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--color-gray-200)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div>
          <h1 style={{
            margin: 0,
            color: 'var(--color-white)',
            fontSize: '24px',
            fontWeight: '400',
            fontFamily: "'Cormorant', serif",
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Admin Panel
          </h1>
          <p style={{ margin: '5px 0 0 0', color: 'var(--color-gray-400)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Массовая загрузка до 500+ фото
          </p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="admin-btn delete"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Trash2 size={16} /> Удалить ({selectedIds.size})
            </button>
          )}
          <button
            onClick={onLogout}
            className="admin-btn"
          >
            Выход
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>

        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-300)',
          padding: '30px',
          marginBottom: '30px',
          borderRadius: '0'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 400, fontFamily: "'Cormorant', serif", color: 'var(--color-black)', textTransform: 'uppercase' }}>
            Настройки хедера
          </h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--color-black)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Текст заголовка
              </label>
              <input
                type="text"
                value={headerTitle}
                onChange={(e) => setHeaderTitle(e.target.value)}
                style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '0', border: '1px solid var(--color-gray-300)', fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--color-black)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Фон хедера
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    setSavingHeader(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("upload_preset", UPLOAD_PRESET);
                      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: 'POST', body: formData });
                      const data = await response.json();
                      if (data.secure_url) {
                        setHeaderBgUrl(data.secure_url);
                        alert('Фон загружен! Не забудьте нажать "Сохранить хедер"');
                      }
                    } catch (error) {
                      console.error('Error uploading header bg:', error);
                      alert('Ошибка загрузки фона');
                    } finally {
                      setSavingHeader(false);
                    }
                  }}
                  id="header-bg-input"
                  style={{ display: 'none' }}
                />
                <label
                  htmlFor="header-bg-input"
                  className="admin-btn"
                  style={{ display: 'inline-block' }}
                >
                  Выберите файл
                </label>
              </div>

              {headerBgUrl && (
                <div style={{ marginTop: '20px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--color-gray-500)', marginBottom: '10px', textTransform: 'uppercase' }}>
                    Текущий фон:
                  </p>
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: '400px',
                      height: '150px',
                      backgroundImage: `url(${headerBgUrl})`,
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundColor: 'var(--color-gray-50)',
                      border: '1px solid var(--color-gray-200)'
                    }}
                  />
                  <button
                    onClick={() => setHeaderBgUrl('')}
                    className="admin-btn delete"
                    style={{ marginTop: '15px' }}
                  >
                    Удалить фон
                  </button>
                </div>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={handleSaveHeaderSettings}
                disabled={savingHeader}
                className="admin-btn primary"
              >
                {savingHeader ? 'Сохранение...' : 'Сохранить хедер'}
              </button>
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--color-white)',
          border: '1px solid var(--color-gray-300)',
          padding: '30px',
          marginBottom: '30px',
          borderRadius: '0'
        }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: '400', fontFamily: "'Cormorant', serif", color: 'var(--color-black)', textTransform: 'uppercase' }}>
            Массовая загрузка фото
          </h2>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '11px', fontWeight: '600', color: 'var(--color-black)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Код клиента <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="например: anna-ivan-2025"
              value={clientSlug}
              onChange={(e) => setClientSlug(e.target.value.trim().toLowerCase())}
              style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '0', border: '1px solid var(--color-gray-300)', fontFamily: "'Inter', sans-serif" }}
            />
            <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-gray-500)' }}>
              Ссылка для клиента: <code>?client={clientSlug || 'anna-ivan-2025'}</code>
            </p>
          </div>

          <label
            style={{
              display: 'block',
              width: '100%',
              padding: '60px 40px',
              border: isDraggingFile ? '1px solid var(--color-black)' : '1px dashed var(--color-gray-300)',
              borderRadius: '0',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: isDraggingFile ? 'var(--color-gray-50)' : 'var(--color-white)'
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: '32px', marginBottom: '15px', color: 'var(--color-black)' }}>
              {isDraggingFile ? '📥' : '📁'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-black)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {isDraggingFile ? 'Отпустите файлы здесь' : 'Перетащите фото или нажмите для выбора'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
              Можно выбрать до 500+ файлов сразу
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>

          {selectedFiles.length > 0 && (
            <div style={{ marginTop: '25px' }}>
              <div style={{
                padding: '15px',
                borderRadius: '0',
                background: 'var(--color-gray-50)',
                border: '1px solid var(--color-gray-200)',
                color: 'var(--color-black)',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>

                <span>Выбрано: {selectedFiles.length} фото ({(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)} МБ)</span>
              </div>

              {showPreview && (
                <div style={{
                  marginTop: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: '10px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  padding: '10px',
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-gray-200)'
                }}>
                  {selectedFiles.slice(0, 50).map((file, index) => (
                    <div key={index} style={{
                      width: '100%',
                      height: '80px',
                      background: 'var(--color-gray-100)',
                      borderRadius: '0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: 'var(--color-gray-500)'
                    }}>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {uploading && (
            <>
              <div style={{
                marginTop: '25px',
                background: 'var(--color-gray-100)',
                borderRadius: '0',
                height: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${progressPercent}%`,
                  height: '100%',
                  background: 'var(--color-black)',
                  transition: 'width 0.3s',
                  borderRadius: '0'
                }} />
              </div>
              <div style={{
                marginTop: '10px',
                fontSize: '12px',
                color: 'var(--color-black)',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{uploadStats.completed + uploadStats.failed} / {uploadStats.total} ({progressPercent}%)</span>
                <span>готово {uploadStats.completed} | не готово {uploadStats.failed}</span>
              </div>
            </>
          )}

          {status && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              borderRadius: '0',
              background: 'var(--color-gray-50)',
              border: '1px solid var(--color-black)',
              color: 'var(--color-black)',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              {status}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="admin-btn primary"
            style={{ width: '100%', marginTop: '30px' }}
          >
            {uploading ? `Загрузка... (${uploadStats.completed}/${uploadStats.total})` : `Загрузить (${selectedFiles.length})`}
          </button>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '1px solid var(--color-gray-200)'
        }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '400', fontFamily: "'Cormorant', serif", color: 'var(--color-black)', textTransform: 'uppercase' }}>
            Галерея ({photos.length})
          </h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleSelectAll}
              className="admin-btn"
              style={{ fontSize: '11px', padding: '8px 16px' }}
            >
              {selectedIds.size === photos.length && photos.length > 0 ? 'Снять выделение' : 'Выбрать все'}
            </button>
            {photos.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="admin-btn delete"
                style={{ fontSize: '11px', padding: '8px 16px' }}
              >
                Удалить все
              </button>
            )}
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div
            ref={galleryRef}
          >
            <SortableContext
              items={photos.map(p => p.id)}
              strategy={rectSortingStrategy}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px',
                paddingBottom: '40px'
              }}>
                {photos.map(photo => (
                  <SortablePhotoItem
                    key={photo.id}
                    photo={photo}
                    isSelected={selectedIds.has(photo.id)}
                    onSelect={() => handleToggleSelect(photo.id)}
                    onToggle={handleToggleSelect}
                    onClick={() => setLightboxImg(photo.url)}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
          <DragOverlay>
            {activeId ? (
              <div style={{
                width: '200px',
                height: '200px',
                backgroundImage: `url(${photos.find(p => p.id === activeId)?.url})`,
                backgroundSize: 'cover',
                border: '2px solid black',
                opacity: 0.8
              }} />
            ) : null}
          </DragOverlay>
        </DndContext>

        {photos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-gray-400)' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}></div>
            <p style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>Фотографий пока нет</p>
          </div>
        )}
      </div>

      {lightboxImg && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(255, 255, 255, 0.98)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 3000,
            cursor: 'zoom-out'
          }}
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Lightbox"
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              borderRadius: '0',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      )}
    </>
  );
}