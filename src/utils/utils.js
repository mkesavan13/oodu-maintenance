export async function start(gapi, CLIENT_ID, SCOPES) {
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
        } else {
          localStorage.removeItem("accessToken");
          console.log("User signed out from gapi");
        }
      });
    } catch (error) {
      console.error("Error initializing gapi:", error);
    }
}

export async function syncData(gapi, setSyncError, setIsSyncModalOpen, setPopoverAnchorEl, setExpenses) {
    setSyncError(false);
    setIsSyncModalOpen(true);
    setPopoverAnchorEl(null);
    const localExpenses = JSON.parse(localStorage.getItem("expenses"));
    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

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
      setIsSyncModalOpen(false);
      if (!syncError) {
        setIsSyncModalOpen(false);
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      setIsSyncModalOpen(false);
      setSyncError(true);
    }
}
