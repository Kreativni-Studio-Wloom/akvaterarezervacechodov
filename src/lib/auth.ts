// Jednodušší autentifikace pro testování
// V produkci by se měla použít Firebase Authentication

interface User {
  email: string;
  id: string;
}

let isAuthenticated = false;
let currentUser: User | null = null;

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  // Nastaveno pouze na konkrétní admin účet
  const ADMIN_EMAIL = "info@rajmazlicku.eu";
  const ADMIN_PASSWORD = "Acer2016";
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    isAuthenticated = true;
    currentUser = { email, id: 'admin-1' };
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_logged_in', 'true');
      localStorage.setItem('admin_email', email);
    }
    return { user: currentUser };
  }
  throw new Error('Invalid credentials');
};

export const signOut = async () => {
  isAuthenticated = false;
  currentUser = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('admin_email');
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  if (typeof window !== 'undefined') {
    const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
    const email = localStorage.getItem('admin_email');
    if (loggedIn && email) {
      currentUser = { email, id: 'admin-1' };
      callback(currentUser);
      return () => {};
    }
  }
  callback(null);
  return () => {};
};

export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
    const email = localStorage.getItem('admin_email');
    if (loggedIn && email) {
      return { email, id: 'admin-1' };
    }
  }
  return null;
};
export const getIsAuthenticated = (): boolean => isAuthenticated; 