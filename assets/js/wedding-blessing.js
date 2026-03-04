const CLIENT_ID = '560711627372-nhbd92fos6uu5epe34l7rqu6sep7anvl.apps.googleusercontent.com';
      const API_KEY = 'AIzaSyDf03dM9qqpunEIrDrgYYeXm0b07cbjvqQ';

      const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

      const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'; // Updated scope to allow write access
      const SPREADSHEETID = '1MGssAONbsP2bTToUJEI2ux2EpmM5sEE1YxSfc7zw0B0';
      const RANGE = '工作表1!A2:E';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;

      document.addEventListener('DOMContentLoaded', () => {
        const checkInitialization = setInterval(() => {
          if (gapiInited && gisInited) {
            clearInterval(checkInitialization);
            listMajors();
          }
        }, 100);
      });

      const blessingNameTextarea = document.getElementById('blessing-name');
      const blessingMessageTextarea = document.getElementById('blessing-message');
      const submitButton = blessingMessageTextarea.nextElementSibling;
      const authorizeButton = document.getElementById('authorize_button');
      const refreshButton = document.getElementById('refresh_button');
      const signoutButton = document.getElementById('signout_button');
      
      blessingNameTextarea.style.visibility = 'hidden';
      blessingMessageTextarea.style.visibility = 'hidden';
      submitButton.style.visibility = 'hidden';

      authorizeButton.addEventListener('click', async () => {
        tokenClient.callback = async (resp) => {
            if (resp.error === undefined) {
                blessingNameTextarea.style.visibility = 'visible';
                blessingMessageTextarea.style.visibility = 'visible';
                submitButton.style.visibility = 'visible';
                authorizeButton.style.display = 'none';
                refreshButton.style.display = 'block';
                signoutButton.style.display = 'block';
                await listMajors();
            }
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({ prompt: 'consent', scope: SCOPES });
        } else {
            tokenClient.requestAccessToken({ prompt: '' });
        }
      });
      
      refreshButton.addEventListener('click', async () => {
        await listMajors();
      });

      signoutButton.addEventListener('click', async () => {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken('');
          const contentElement = document.getElementById('content');

          if (contentElement) {
            contentElement.innerText = '';
          } else {
            console.error('Element with id "content" not found.');
          }

          authorizeButton.style.display = 'block';
          blessingNameTextarea.style.visibility = 'hidden';
          blessingMessageTextarea.style.visibility = 'hidden';
          submitButton.style.visibility = 'hidden';
          refreshButton.style.display = 'none';
          signoutButton.style.display = 'none';
        }
        await listMajors();
      });

      function submitBlessing() {
        const blessingName = document.getElementById('blessing-name').value;
        const blessingMessage = document.getElementById('blessing-message').value;
        const blessingSubmitButton = document.getElementById('blessing-submit');

        if (blessingName.trim() === '') {
            blessingSubmitButton.textContent = '請填寫你的名字！';
            blessingSubmitButton.style.backgroundColor = '#fda8a6';
            blessingSubmitButton.style.color = 'red';
            blessingSubmitButton.disabled = true;
            blessingSubmitButton.style.cursor = 'not-allowed';
            setTimeout(() => {
                blessingSubmitButton.textContent = '提交';
                blessingSubmitButton.style.backgroundColor = '';
                blessingSubmitButton.style.color = '';
                blessingSubmitButton.disabled = false;
                blessingSubmitButton.style.cursor = '';
            }, 1500);
        } else if (blessingMessage.trim() === '') {
            blessingSubmitButton.textContent = '請填寫祝福內容！';
            blessingSubmitButton.style.backgroundColor = '#fda8a6';
            blessingSubmitButton.style.color = 'red';
            blessingSubmitButton.disabled = true;
            blessingSubmitButton.style.cursor = 'not-allowed';
            setTimeout(() => {
                blessingSubmitButton.textContent = '提交';
                blessingSubmitButton.style.backgroundColor = '';
                blessingSubmitButton.style.color = '';
                blessingSubmitButton.disabled = false;
                blessingSubmitButton.style.cursor = '';
            }, 1500);
        } else {
            gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: SPREADSHEETID,
                range: RANGE,
                valueInputOption: 'RAW',
                resource: {
                    values: [[blessingName, blessingMessage]]
                }
            }).then((response) => {
                blessingSubmitButton.textContent = '感謝您的祝福！';
                blessingSubmitButton.style.backgroundColor = '#a6fdb6';
                blessingSubmitButton.style.color = 'green';
                blessingSubmitButton.disabled = true;
                blessingSubmitButton.style.cursor = 'not-allowed';

                setTimeout(() => {
                    blessingSubmitButton.textContent = '提交';
                    blessingSubmitButton.style.backgroundColor = '';
                    blessingSubmitButton.style.color = '';
                    blessingSubmitButton.disabled = false;
                    blessingSubmitButton.style.cursor = '';
                    document.getElementById('blessing-name').value = '';
                    document.getElementById('blessing-message').value = '';
                }, 1500);

                gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: SPREADSHEETID,
                    range: RANGE
                }).then((readResponse) => {
                    console.log('Data from Google Sheets:', readResponse.result.values);
                });
            }).catch((error) => {
                blessingSubmitButton.textContent = '無法提交祝福，請稍後再試！';
                blessingSubmitButton.style.backgroundColor = '#fda8a6';
                blessingSubmitButton.style.color = 'red';
                blessingSubmitButton.disabled = true;
                blessingSubmitButton.style.cursor = 'not-allowed';
                setTimeout(() => {
                    blessingSubmitButton.textContent = '提交';
                    blessingSubmitButton.style.backgroundColor = '';
                    blessingSubmitButton.style.color = '';
                    blessingSubmitButton.disabled = false;
                    blessingSubmitButton.style.cursor = '';
                }, 1500);

                console.error('Error writing to Google Sheets', error);
            });
        }
     }


      function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
      }

      async function initializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
      }

      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '',
        });
        gisInited = true;
        maybeEnableButtons();
      }

      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          authorizeButton.style.visibility = 'visible';
        }
      }

      async function listMajors() {
        let response;
        try {
          response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEETID,
            range: RANGE,
          });
        } catch (err) {
          document.getElementById('content').innerText = err.message;
          return;
        }
        const range = response.result;
        if (!range || !range.values || range.values.length == 0) {
          document.getElementById('content').innerText = 'No values found.';
          return;
        }

        const contentTitle = document.getElementById('content-title');
        if (contentTitle) {
            contentTitle.style.display = 'block';
            contentTitle.innerText = `累積 ${range.values.length} 筆留言，來自大家的祝福：`;
        } else {
            console.error('Element with id "content-title" not found.');
        }

        const contentElement = document.getElementById('content');
        if (!contentElement) {
            console.error('Element with id "content" not found.');
            return;
        }

        let adjustedCount = 0;
        range.values.forEach(row => {
            if (row[1].length && row[1].length >= 30) {
                adjustedCount += 0.1;
            } else if (row[1].length && row[1].length >= 15) {
                adjustedCount += 0.3;
            } else if (row[1].length <= 15) {
                adjustedCount += 1;
            }
        });

        if(adjustedCount > 5) {
            adjustedCount = 4;
        }

        const selectedRows = range.values.sort(() => 0.5 - Math.random()).slice(0, Math.max(1, adjustedCount));
        contentElement.innerText = '';

        for (let index = 0; index < selectedRows.length; index++) {
            setTimeout(() => {
                const row = selectedRows[index];
                const line = document.createElement('div');
                line.textContent = `${row[0]}: ${row[1]}`;
                line.style.opacity = '0';
                line.style.transition = 'opacity 0.5s, background-color 0.5s';
                line.style.backgroundColor = '#f0f8ff';
                line.style.padding = '5px';
                line.style.margin = '5px 0';
                line.style.borderRadius = '5px';
                contentElement.appendChild(line);
                requestAnimationFrame(() => {
                    line.style.opacity = '1';
                    line.style.backgroundColor = '#ffffff';
                });
            }, index * 500);
        }
      }
