import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { GameScreen } from './components/GameScreen';
import type { UserProfile } from './types';
import { auth, logOut, db } from './lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync user profile to Firestore
  const syncUserProfile = async (firebaseUser: any) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      email: firebaseUser.email,
      lastLogin: serverTimestamp()
    }, { merge: true });
  };

  // Auth State Monitoring
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: any) => {
      if (firebaseUser) {
        const profile = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Player',
          photoURL: firebaseUser.photoURL || '',
          email: firebaseUser.email
        };
        setUser(profile);
        await syncUserProfile(firebaseUser); // Sync name/photo on login
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="auth-screen"><div className="loading-text neon-blue pulse">Checking Authentication...</div></div>;
  }

  return (
    <div className="app-container">
      {!user ? (
        <AuthScreen onLogin={() => { }} /> // Auth state handled by onAuthStateChanged
      ) : (
        <GameScreen user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
