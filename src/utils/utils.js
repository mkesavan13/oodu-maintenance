export async function start(gapi, CLIENT_ID, SCOPES) {
  let worker = new Worker(new URL('./keepAliveWorker.js', import.meta.url));
  worker.addEventListener('message', (event) => {
    console.log('Main thread received message from worker:', event.data);
    if (event.data === 'keepAlive') {
      const authInstance = gapi.auth2.getAuthInstance();
      const currentUser = authInstance.currentUser.get();
      if (currentUser && currentUser.isSignedIn()) {
        currentUser.reloadAuthResponse().then(() => {
          console.log('gapi session refreshed');
        }).catch((error) => {
          console.error('Error refreshing gapi session:', error);
        });
        worker.postMessage('start');
      } else {
        if (worker) {
          worker.terminate();
          worker = null;
        }
        console.log('User is not signed in');
      }
    }
  });
  try {
    await gapi.auth2.init({
      client_id: CLIENT_ID,
      scope: SCOPES,
    });

    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.isSignedIn.listen((isSignedIn) => {
      if (isSignedIn) {
        const currentUser = authInstance.currentUser.get();
        const authResponse = currentUser.getAuthResponse();
        const accessToken = authResponse.access_token;
        localStorage.setItem("accessToken", accessToken);
        console.log("Access Token from gapi (useEffect):", accessToken);
        worker.postMessage('start');
      } else {
        localStorage.removeItem("accessToken");
        console.log("User signed out from gapi");
      }
    });
  } catch (error) {
    console.error("Error initializing gapi:", error);
  }
}

async function refreshAccessToken(gapi) {
  const authInstance = gapi.auth2.getAuthInstance();
  const currentUser = authInstance.currentUser.get();
  await currentUser.reloadAuthResponse();
  const newAccessToken = currentUser.getAuthResponse().access_token;
  localStorage.setItem("accessToken", newAccessToken);
  return newAccessToken;
}

export async function syncData(gapi, setSyncError, setIsSyncModalOpen, setPopoverAnchorEl, setExpenses) {
  let accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    accessToken = await refreshAccessToken(gapi);
  }
  setSyncError(false);
  setIsSyncModalOpen(true);
  setPopoverAnchorEl(null);
  const localExpenses = JSON.parse(localStorage.getItem("expenses"));

    try {
      const response = await fetch(
        "https://www.googleapis.com/drive/v3/files?q=name='expenses.json'&spaces=drive",
        {
          method: "GET",
          headers: new Headers({ Authorization: "Bearer " + accessToken }),
        }
      );

      const result = await response.json();
      const fileId = result.files && result.files.length ? result.files[0].id : null;

      if (fileId) {
        const fileResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
          {
            method: "GET",
            headers: new Headers({ Authorization: "Bearer " + accessToken }),
          }
        );

        const driveExpenses = await fileResponse.json();

        const localLastUpdated = localExpenses ? (localExpenses.last_updated ? parseInt(localExpenses.last_updated) : 0) : 0;
        const driveLastUpdated = driveExpenses.last_updated ? parseInt(driveExpenses.last_updated) : 0;

        if (!localExpenses || !localExpenses.last_updated || (driveExpenses.last_updated && driveLastUpdated > localLastUpdated)) {
          localStorage.setItem("expenses", JSON.stringify(driveExpenses));
          setExpenses(driveExpenses);
        } else {
          const updatedExpenses = { ...localExpenses, last_updated: Date.now().toString() };
          localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
          setExpenses(updatedExpenses);

          const blob = new Blob([JSON.stringify(updatedExpenses)], { type: "application/json" });
          const metadata = {
            name: "expenses.json",
            mimeType: "application/json",
          }

          const form = new FormData();
          form.append(
            "metadata",
            new Blob([JSON.stringify(metadata)], { type: "application/json" })
          );
          form.append("file", blob);

          await fetch(
            `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
            {
              method: "PATCH",
              headers: new Headers({ Authorization: "Bearer " + accessToken }),
              body: form,
            }
          );
        }
      } else if (!localExpenses) {
        localStorage.setItem("expenses", JSON.stringify(driveExpenses));
        setExpenses(driveExpenses);
      } else {
        const updatedExpenses = { ...localExpenses, last_updated: Date.now().toString() };
        localStorage.setItem("expenses", JSON.stringify(updatedExpenses));
        setExpenses(updatedExpenses);

        const blob = new Blob([JSON.stringify(updatedExpenses)], { type: "application/json" });
        const metadata = {
          name: "expenses.json",
          mimeType: "application/json",
        };

        const form = new FormData();
        form.append(
          "metadata",
          new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        form.append("file", blob);

        await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
          {
            method: "POST",
            headers: new Headers({ Authorization: "Bearer " + accessToken }),
            body: form,
          }
        );
      }
      localStorage.setItem("lastSyncTime", new Date().getTime().toString());
      setIsSyncModalOpen(false);
    } catch (error) {
      console.error("Error syncing data:", error);
      setIsSyncModalOpen(false);
      setSyncError(true);
    }
}
