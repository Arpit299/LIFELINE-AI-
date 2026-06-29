import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isDemo: boolean;
}

export const saveUserToFirestore = async (user: User): Promise<void> => {
  if (!db) return;
  const path = `users/${user.uid}`;
  try {
    const userDocRef = doc(db, 'users', user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Developer Node',
      photoURL: user.photoURL || null,
      lastLoginAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const loginWithGoogle = async (): Promise<User | null> => {
  if (!auth) throw new Error('Authentication is currently unavailable.');
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const userCredential = await signInWithPopup(auth, provider);
  if (userCredential.user) {
    await saveUserToFirestore(userCredential.user);
  }
  return userCredential.user;
};

export const loginWithEmail = async (email: string, password: string): Promise<User | null> => {
  if (!auth) throw new Error('Authentication is currently unavailable.');
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await saveUserToFirestore(userCredential.user);
  }
  return userCredential.user;
};

export const registerWithEmail = async (email: string, password: string): Promise<User | null> => {
  if (!auth) throw new Error('Authentication is currently unavailable.');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await saveUserToFirestore(userCredential.user);
  }
  return userCredential.user;
};

export const logoutUser = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

export const subscribeToAuth = (callback: (user: AuthUser | null) => void) => {
  if (!auth) {
    // If auth is not available, default to a demo session immediately for immediate demo readiness
    setTimeout(() => {
      callback({
        uid: 'demo-user',
        email: 'guest@vibe2ship.dev',
        displayName: 'Guest Mode',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
        isDemo: true,
      });
    }, 100);
    return () => {};
  }

  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Developer Node',
        photoURL: firebaseUser.photoURL || null,
        isDemo: false,
      });
      // Optionally sync user state to firestore to keep user database updated in the background
      saveUserToFirestore(firebaseUser).catch(console.error);
    } else {
      callback(null);
    }
  });
};
