// Simple auth state management without Firebase
interface SimpleUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

type AuthCallback = (user: SimpleUser | null) => void;

class SimpleAuth {
  private currentUser: SimpleUser | null = null;
  private callbacks: AuthCallback[] = [];

  constructor() {
    // Check if user is stored in localStorage
    const stored = localStorage.getItem('demo_user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem('demo_user');
      }
    }
  }

  signInWithGoogle() {
    // Create a demo user for demonstration
    const demoUser: SimpleUser = {
      uid: 'demo-user-' + Date.now(),
      email: 'demo@example.com',
      displayName: 'Demo User',
      photoURL: undefined
    };
    
    this.currentUser = demoUser;
    localStorage.setItem('demo_user', JSON.stringify(demoUser));
    this.notifyCallbacks();
    return Promise.resolve();
  }

  signOut() {
    this.currentUser = null;
    localStorage.removeItem('demo_user');
    this.notifyCallbacks();
    return Promise.resolve();
  }

  onAuthStateChanged(callback: AuthCallback) {
    this.callbacks.push(callback);
    // Immediately call with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  private notifyCallbacks() {
    this.callbacks.forEach(callback => callback(this.currentUser));
  }
}

const auth = new SimpleAuth();

export const signInWithGoogle = () => auth.signInWithGoogle();
export const logOut = () => auth.signOut();
export const onAuthStateChange = (callback: AuthCallback) => auth.onAuthStateChanged(callback);
export const handleRedirectResult = async () => null;
