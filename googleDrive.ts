
import { GOOGLE_DRIVE_CONFIG } from './firebaseConfig';

const API_KEY = GOOGLE_DRIVE_CONFIG.API_KEY;
const CLIENT_ID = GOOGLE_DRIVE_CONFIG.CLIENT_ID;
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

export const saveFileToDrive = async (fileName: string, data: any) => {
  if (!gapiInited || !gisInited) throw new Error("Google Drive API not initialized");

  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(resp);
        return;
      }
      
      const gapi = (window as any).gapi;
      try {
        const fileContent = JSON.stringify(data);
        const file = new Blob([fileContent], { type: 'application/json' });
        const metadata = {
          name: `${fileName}.rpgnep.json`,
          mimeType: 'application/json',
        };

        const accessToken = gapi.client.getToken().access_token;
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const fetchResp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
          method: 'POST',
          headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
          body: form,
        });
        
        const json = await fetchResp.json();
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    const gapi = (window as any).gapi;
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
            createPicker(resolve, reject);
        };

        const gapi = (window as any).gapi;
        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
};

const createPicker = (resolve: Function, reject: Function) => {
    const gapi = (window as any).gapi;
    const google = (window as any).google;
    const view = new google.picker.View(google.picker.ViewId.DOCS);
    view.setMimeTypes("application/json");
    
    const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .setDeveloperKey(API_KEY)
        .setAppId(CLIENT_ID)
        .setOAuthToken(gapi.client.getToken().access_token)
        .addView(view)
        .setCallback(async (data: any) => {
            if (data.action === google.picker.Action.PICKED) {
                const fileId = data.docs[0].id;
                try {
                    const response = await gapi.client.drive.files.get({
                        fileId: fileId,
                        alt: 'media',
                    });
                    resolve(response.result);
                } catch (err) {
                    reject(err);
                }
            } else if (data.action === google.picker.Action.CANCEL) {
                reject("CANCELLED");
            }
        })
        .build();
    picker.setVisible(true);
};
