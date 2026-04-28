
import { GOOGLE_DRIVE_CONFIG } from './googleDriveConfig';

const API_KEY = GOOGLE_DRIVE_CONFIG.API_KEY;
const CLIENT_ID = GOOGLE_DRIVE_CONFIG.CLIENT_ID;
const PROJECT_NUMBER = GOOGLE_DRIVE_CONFIG.PROJECT_NUMBER; 
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = GOOGLE_DRIVE_CONFIG.SCOPES;

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

export const initGapiClient = async () => {
  return new Promise<void>((resolve, reject) => {
    const gapi = (window as any).gapi;
    if (!gapi) {
        reject("GAPI not found");
        return;
    }
    // Carregamos apenas o client e o picker. 
    // Removendo discoveryDocs evitamos o erro 403 se a chave estiver restrita.
    gapi.load('client:picker', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          // Não incluímos discoveryDocs pois usamos chamadas REST diretas via fetch
        });
        gapiInited = true;
        resolve();
      } catch (err) {
        console.warn("GAPI client.init falhou, mas tentando prosseguir sem discovery...", err);
        // Se falhar o init básico, marcamos como inited se o picker estiver disponível
        gapiInited = true;
        resolve();
      }
    });
  });
};

export const initGisClient = async () => {
  return new Promise<void>((resolve, reject) => {
    const google = (window as any).google;
    if (!google) {
        reject("Google GIS not found");
        return;
    }
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: '', // defined later
    });
    gisInited = true;
    resolve();
  });
};

export const saveFileToDrive = async (fileName: string, data: any) => {
  if (!gapiInited || !gisInited) throw new Error("Google Drive API not initialized");

  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }
      
      try {
        const accessToken = resp.access_token;
        const fileContent = JSON.stringify(data, null, 2); 
        
        const metadata = {
          name: `${fileName}.rpgnep.json`,
          mimeType: 'application/json',
          description: 'Campanha RPGNEP'
        };

        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        const multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            fileContent +
            close_delim;

        const fetchResp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
          method: 'POST',
          headers: new Headers({
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'multipart/related; boundary="' + boundary + '"'
          }),
          body: multipartRequestBody,
        });
        
        if (!fetchResp.ok) {
            const errText = await fetchResp.text();
            throw new Error(`Drive Upload Failed: ${fetchResp.status} - ${errText}`);
        }

        const json = await fetchResp.json();
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
};

export const openDrivePicker = async () => {
    if (!gapiInited || !gisInited) throw new Error("Google Drive API not initialized");

    return new Promise((resolve, reject) => {
        tokenClient.callback = async (resp: any) => {
            if (resp.error !== undefined) {
                reject(resp);
                return;
            }
            const gapi = (window as any).gapi;
            if (gapi.client) {
                gapi.client.setToken(resp);
            }
            createPicker(resp.access_token, resolve, reject);
        };

        const gapi = (window as any).gapi;
        if (gapi && gapi.client && gapi.client.getToken() !== null) {
            tokenClient.requestAccessToken({ prompt: '' });
        } else {
            tokenClient.requestAccessToken();
        }
    });
};

const createPicker = (oauthToken: string, resolve: Function, reject: Function) => {
    const google = (window as any).google;
    const gapi = (window as any).gapi;

    if (!google || !google.picker) {
        reject("Google Picker API not loaded");
        return;
    }

    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes("application/json");

    const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setDeveloperKey(API_KEY)
        .setAppId(PROJECT_NUMBER) 
        .setOAuthToken(oauthToken)
        .addView(view)
        .setCallback(async (data: any) => {
            if (data.action === google.picker.Action.PICKED) {
                const fileId = data.docs[0].id;
                try {
                    const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                        headers: {
                            'Authorization': 'Bearer ' + oauthToken
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch file: ${response.statusText}`);
                    }
                    
                    const json = await response.json();
                    resolve(json);
                } catch (err) {
                    console.error("Erro ao baixar arquivo", err);
                    reject(err);
                }
            } else if (data.action === google.picker.Action.CANCEL) {
                reject("CANCELLED");
            }
        })
        .build();
    picker.setVisible(true);
};
