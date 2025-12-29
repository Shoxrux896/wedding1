import { useState, useEffect, lazy, Suspense } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Back from "./components/BackToTop";
import { ContactModal } from "./components/ContactModal";
import Gallery from "./components/Gallery";
import Header from "./components/Header";
import { Footrer } from "./components/Footer";
import Loading from "./components/Loading";

// Lazy load admin components for better initial load performance
const Login = lazy(() => import("./Admin pannel/Login"));
const AdminPanel = lazy(() => import("./Admin pannel/Dashboard"));

export function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [headerSettings, setHeaderSettings] = useState(null);

  // 1. Persistent Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Initialization (Parallel)
  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'header'));
        if (snap.exists()) setHeaderSettings(snap.data());
      } catch (err) {
        console.error("Failed to load header settings", err);
      }
    };
    loadData();
  }, []);

  // 3. Routing Sync
  const checkRoute = () => {
    const path = window.location.pathname;
    setIsAdmin(path === '/admin' || path === '/admin/');
  };

  useEffect(() => {
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const goToAdmin = () => {
    window.history.pushState({}, '', '/admin');
    setIsAdmin(true);
  };

  const goToHome = () => {
    window.history.pushState({}, '', '/');
    setIsAdmin(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      goToHome();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'black',
        color: 'white'
      }}>
        <Loading />
      </div>
    );
  }

  // Admin flow
  if (isAdmin) {
    return (
      <Suspense fallback={
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'white' }}>
          <Loading />
        </div>
      }>
        {!user ? (
          <Login />
        ) : (
          <AdminPanel onLogout={handleLogout} />
        )}
      </Suspense>
    );
  }

  // Public Gallery
  return (
    <>
      <Header onAdminClick={goToAdmin} settings={headerSettings} />
      <Gallery
        selectedAlbum={selectedAlbum}
        onAlbumChange={setSelectedAlbum}
      />

      <button
        id="contact-btn"
        onClick={() => setShowContact(!showContact)}
        style={{ display: 'block' }}
      >
        Связаться с автором
      </button>

      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
      <Back />
      <Footrer />
    </>
  );
}