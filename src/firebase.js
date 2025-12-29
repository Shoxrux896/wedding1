import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ← Добавлено
import { getStorage } from "firebase/storage"; // ← Добавлено
import { CATEGORIES } from "./categoriesConfig";

const firebaseConfig = {
  apiKey: "AIzaSyAAvJnx7IDa6PQcumKu4b20RsJG4cwN2dg",
  authDomain: "wedding-5f91c.firebaseapp.com",
  projectId: "wedding-5f91c",
  storageBucket: "wedding-5f91c.firebasestorage.app", // Added storage bucket if needed, but getStorage() usually auto-detects from config if present. Actually, let's keep it simple.
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // ← Добавлено
export const storage = getStorage(app); // ← Добавлено

export const initFirebase = () => Promise.resolve(true);

// Фиксированный список альбомов/категорий (доступно 4 шт. + пункт "Все")
export const ALBUM_CATEGORIES = [
  { id: 'all', name: 'Все фото', icon: '🎉' },
  ...CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon || '📷',
  })),
];