
// --- CONFIGURAÇÕES DE API DO GOOGLE DRIVE ---
export const GOOGLE_DRIVE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "865191961428-9aerg18l6kc61at768u8u4jpkcvph0n0.apps.googleusercontent.com",
  API_KEY: import.meta.env.VITE_API_KEY || "AIzaSyCJ6lbebFHoQ9cshaIgsYfJjsKG4jsylmk",
  SCOPES: "https://www.googleapis.com/auth/drive.file email profile openid",
  // O Picker exige o ID Numérico do Projeto (que é o mesmo que o messagingSenderId do Firebase)
  PROJECT_NUMBER: import.meta.env.VITE_MESSAGING_SENDER_ID || "865191961428" 
};

// Helper para verificar chave
export const hasValidPickerKey = () => {
    return GOOGLE_DRIVE_CONFIG.API_KEY.startsWith("AIza");
};
