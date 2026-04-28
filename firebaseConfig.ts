import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, Auth } from "firebase/auth";
import { getDatabase, Database } from "firebase/database";

// --- CONFIGURAÇÕES ---
// Prioriza variáveis de ambiente, usa as chaves do backup como fallback
const API_KEY = import.meta.env.VITE_API_KEY || "AIzaSyCJ6lbebFHoQ9cshaIgsYfJjsKG4jsylmk"; 
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "865191961428-9aerg18l6kc61at768u8u4jpkcvph0n0.apps.googleusercontent.com";

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || "rpgnep.firebaseapp.com",
  databaseURL: import.meta.env.VITE_DATABASE_URL || "https://rpgnep-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_PROJECT_ID || "rpgnep",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET || "rpgnep.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID || "865191961428",
  appId: import.meta.env.VITE_APP_ID || "1:865191961428:web:78515742d50b6548c75ec1"
};

// Inicialização
let app: FirebaseApp;
let auth: Auth | null = null;
let db: Database | null = null;
let googleProvider: GoogleAuthProvider | null = null;

const hasConfig = !!firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIza");

if (hasConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    auth = getAuth(app);
    auth.useDeviceLanguage();
    setPersistence(auth, browserLocalPersistence).catch(console.error);

    db = getDatabase(app);

    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
    
    console.log("Firebase inicializado com sucesso.");
  } catch (e) {
    console.error("Erro na inicialização do Firebase:", e);
  }
} else {
  console.warn("AVISO: Firebase não configurado corretamente.");
}

export { auth, db, googleProvider };

export const isDriveConfigured = () => {
  return !!CLIENT_ID && CLIENT_ID.length > 10 && !!API_KEY;
};

export const isAuthConfigured = () => {
  return !!API_KEY && API_KEY.length > 10;
};
