
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import type { Database } from "firebase/database";

// --- CONFIGURAÇÕES FORNECIDAS ---
// Chaves inseridas diretamente para evitar erros de variáveis de ambiente (.env)
const API_KEY = "AIzaSyCJ6lbebFHoQ9cshaIgsYfJjsKG4jsylmk"; 
const CLIENT_ID = "865191961428-9aerg18l6kc61at768u8u4jpkcvph0n0.apps.googleusercontent.com";

// Escopo específico do Google Drive
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

// --- CONFIGURAÇÕES DE API DO GOOGLE DRIVE ---
export const GOOGLE_DRIVE_CONFIG = {
  CLIENT_ID: CLIENT_ID,
  API_KEY: API_KEY,
  SCOPES: `${DRIVE_SCOPE} email profile openid` 
};

// Helper para verificar chave
export const hasValidPickerKey = () => {
    return GOOGLE_DRIVE_CONFIG.API_KEY.startsWith("AIza");
};

// --- CONFIGURAÇÃO DO FIREBASE ---
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "rpgnep.firebaseapp.com",
  databaseURL: "https://rpgnep-default-rtdb.firebaseio.com",
  projectId: "rpgnep",
  storageBucket: "rpgnep.firebasestorage.app",
  messagingSenderId: "865191961428",
  appId: "1:865191961428:web:78515742d50b6548c75ec1"
};

export const isDriveConfigured = () => {
  return GOOGLE_DRIVE_CONFIG.CLIENT_ID.length > 10;
};

export const isAuthConfigured = () => {
  return firebaseConfig.apiKey.length > 10;
};

// Inicializa o App
let app;
let auth: Auth | null = null;
let db: Database | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = initializeApp(firebaseConfig);
  
  // Inicializa Auth (Modular)
  auth = getAuth(app);
  // Defina o idioma do dispositivo
  auth.useDeviceLanguage();
  setPersistence(auth, browserLocalPersistence).catch(console.error);

  // Inicializa Database (Modular)
  db = getDatabase(app);

  // Configura Provider Google (Modular)
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  
  console.log("Firebase inicializado com sucesso.");
} catch (e) {
  console.error("Erro CRÍTICO na inicialização do Firebase:", e);
}

export { auth, googleProvider, db };
