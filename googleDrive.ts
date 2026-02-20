
import { GOOGLE_DRIVE_CONFIG } from './firebaseConfig';

const API_KEY = GOOGLE_DRIVE_CONFIG.API_KEY;
const CLIENT_ID = GOOGLE_DRIVE_CONFIG.CLIENT_ID;
const PROJECT_NUMBER = GOOGLE_DRIVE_CONFIG.PROJECT_NUMBER; // Necessário para o Picker
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
    gapi.load('client:picker', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        resolve();
      } catch (err) {
        reject(err);
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

/**
 * Salva um arquivo no Google Drive usando multipart/related upload.
 * Isso é necessário para enviar metadados (nome) e conteúdo em uma única requisição POST.
 */
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
        const fileContent = JSON.stringify(data, null, 2); // Pretty print for JSON
        
        const metadata = {
          name: `${fileName}.rpgnep.json`,
          mimeType: 'application/json',
          description: 'Campanha RPGNEP'
        };

        // Construção manual do corpo Multipart/Related
        // O FormData padrão envia multipart/form-data, que o Drive API v3 rejeita para upload simples
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

    const gapi = (window as any).gapi;
    // Sempre solicitar token para garantir validade no momento do salvamento
    if (gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
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
            // O token de acesso está em resp.access_token
            // Precisamos garantir que o gapi client tenha esse token setado para chamadas subsequentes
            const gapi = (window as any).gapi;
            if (gapi.client) {
                gapi.client.setToken(resp);
            }
            createPicker(resp.access_token, resolve, reject);
        };

        const gapi = (window as any).gapi;
        // Solicita token se não existir ou força renovação silenciosa
        const existingToken = gapi.client.getToken();
        if (existingToken === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
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
    // Filtra apenas arquivos criados pelo RPGNEP (opcional, remove se quiser ver tudo)
    // view.setQuery("*.rpgnep.json");

    const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setDeveloperKey(API_KEY)
        .setAppId(PROJECT_NUMBER) // CRÍTICO: Deve ser o ID numérico do projeto, não o Client ID alfanumérico
        .setOAuthToken(oauthToken)
        .addView(view)
        .setCallback(async (data: any) => {
            if (data.action === google.picker.Action.PICKED) {
                const fileId = data.docs[0].id;
                try {
                    // Baixar o conteúdo do arquivo
                    const response = await gapi.client.drive.files.get({
                        fileId: fileId,
                        alt: 'media',
                    });
                    
                    // response.result contém o corpo do arquivo (o JSON)
                    // response.body contém a string bruta
                    resolve(response.result || JSON.parse(response.body));
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
