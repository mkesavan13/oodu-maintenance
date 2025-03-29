import React, { useState, useEffect } from "react";
import "./styles.scss";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider, googleLogout } from "@react-oauth/google";
import { gapi } from "gapi-script";
import html2canvas from "html2canvas";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Modal, Box, IconButton, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import {
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Google as GoogleIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { CalendarArea } from "./utils/styled";
import HeaderComponent from "./components/header";
import { months, SCOPES, CLIENT_ID } from "./utils/constants";
import AddExpenseModal from "./components/addExpense";
import DownloadCanvas from "./components/downloadCanvas";
import BreakupArea from "./components/breakupArea";
import { start, syncData } from "./utils/utils";

const App = () => {
  const [gapiReady, setGapiReady] = useState(false);

  useEffect(() => {
    gapi.load("client:auth2", () => start(gapi, CLIENT_ID, SCOPES).then(() => setGapiReady(true)));
  }, []);

  useEffect(() => {
    if (gapiReady && user) {
      const lastSyncTime = localStorage.getItem("lastSyncTime");
      const currentTime = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (!lastSyncTime || (currentTime - lastSyncTime) > twentyFourHours) {
        syncData(gapi, setSyncError, setIsSyncModalOpen, setPopoverAnchorEl, setExpenses);
      }
    }
  }, [gapiReady]);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState(null);
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : {};
  });
  const [newExpense, setNewExpense] = useState({ title: "", amount: "", selectedFloors: ["Ground Floor", "First Floor", "Second Floor"], remarks: "", paid: false });
  const lastUpdated = expenses.last_updated ? new Date(parseInt(expenses.last_updated)).toLocaleString() : undefined;
  const lastSynced = localStorage.getItem("lastSyncTime") ? new Date(parseInt(localStorage.getItem("lastSyncTime"))).toLocaleString() : undefined;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const [syncError, setSyncError] = useState(false);
  const [menuAnchorEls, setMenuAnchorEls] = useState({});

  const handleLoginSuccess = async (response) => {
    if (response) {
      const profile = {
        name: response.wt.Ad,
        email: response.wt.cu,
        picture: response.wt.hK,
      };
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      const accessToken = response.xc.access_token || await refreshAccessToken(gapi);
      localStorage.setItem("accessToken", accessToken);
      syncData(gapi, setSyncError, setIsSyncModalOpen, setPopoverAnchorEl, setExpenses);
      console.log("Access Token from gapi (handleLoginSuccess):", accessToken);
    } else {
      console.error("Login response does not contain access token");
    }
  };

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const handleLogout = async () => {
    setPopoverAnchorEl(null);
    try {
      googleLogout();
      await syncData(gapi, setSyncError, setIsSyncModalOpen, setPopoverAnchorEl, setExpenses);
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("expenses");
      setUser(null);
      localStorage.removeItem("user");
      setIsLogoutDialogOpen(false);
      if (worker) {
        worker.terminate();
        worker = null;
      }
      window.location.reload();
    } catch (error) {
      console.error("Error during logout:", error);
      localStorage.removeItem("accessToken");
      setIsLogoutDialogOpen(false);
    }
  };

  const handleMarkAsPaid = (index) => {
    const monthYearKey = `${selectedDate.getMonth()}-${selectedDate.getFullYear()}`;
    const updatedExpenses = [...(expenses[monthYearKey] || [])];
    const currentPaidStatus = updatedExpenses[index].paid;
    updatedExpenses[index] = { ...updatedExpenses[index], paid: currentPaidStatus === undefined ? true : !currentPaidStatus };
    const updatedExpensesObj = { ...expenses, [monthYearKey]: updatedExpenses, last_updated: Date.now().toString() };
    localStorage.setItem("expenses", JSON.stringify(updatedExpensesObj));
    setExpenses(updatedExpensesObj);
  };

  const handleAddExpense = () => {
    if (newExpense.title && newExpense.amount && newExpense.selectedFloors.length) {
      const monthYearKey = `${selectedDate.getMonth()}-${selectedDate.getFullYear()}`;
      const updatedExpenses = expenses[monthYearKey] ? [...expenses[monthYearKey]] : [];
      if (editingExpenseIndex !== null) {
        updatedExpenses[editingExpenseIndex] = newExpense;
        setEditingExpenseIndex(null);
      } else {
        updatedExpenses.push(newExpense);
      }
      const updatedExpensesObj = { ...expenses, [monthYearKey]: updatedExpenses, last_updated: Date.now().toString() };
      localStorage.setItem("expenses", JSON.stringify(updatedExpensesObj));
      setExpenses(updatedExpensesObj);
      setIsModalOpen(false);
      setNewExpense({ title: "", amount: "", selectedFloors: [] });
    }
  };

  const handleDownload = () => {
    const downloadContainer = document.getElementById("download-canvas");

    const month = months[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    const fileName = `Maintenance_${month}_${year}.png`;

    downloadContainer.style.display = "block"; // Make the canvas visible
    html2canvas(downloadContainer).then((canvas) => {
      downloadContainer.style.display = "none"; // Hide the canvas after capturing
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = fileName;
      link.click();
    });
  };

  const openLogoutDialog = () => {
    setIsLogoutDialogOpen(true);
  };

  const closeLogoutDialog = () => {
    setIsLogoutDialogOpen(false);
  };

  const handleOpenModal = () => {
    setNewExpense({ title: "", amount: "", selectedFloors: [], remarks: "" });
    setEditingExpenseIndex(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpenseIndex(null);
  };

  const handleEditExpense = (index) => {
    const monthYearKey = `${selectedDate.getMonth()}-${selectedDate.getFullYear()}`;
    setNewExpense(expenses[monthYearKey][index]);
    setEditingExpenseIndex(index);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = () => {
    const monthYearKey = `${selectedDate.getMonth()}-${selectedDate.getFullYear()}`;
    const updatedExpenses = (expenses[monthYearKey] || []).filter((_, i) => i !== expenseToDelete);
    const updatedExpensesObj = { ...expenses, [monthYearKey]: updatedExpenses, last_updated: Date.now().toString() };
    localStorage.setItem("expenses", JSON.stringify(updatedExpensesObj));
    setExpenses(updatedExpensesObj);
    setIsDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const openDeleteDialog = (index) => {
    setExpenseToDelete(index);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const hasRemarks = (expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] || []).some(expense => expense.remarks || expense.paid);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <HeaderComponent
        user={user}
        gapi={gapi}
        setSyncError={setSyncError}
        setIsSyncModalOpen={setIsSyncModalOpen}
        setPopoverAnchorEl={setPopoverAnchorEl}
        setExpenses={setExpenses}
        openLogoutDialog={openLogoutDialog}
        popoverAnchorEl={popoverAnchorEl}
        setSelectedDate={setSelectedDate}
      />
      {!user ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          {gapiReady ? (
            <Button
              variant="outlined"
              style={{ color: '#5aac42', borderColor: '#5aac42' }}
              startIcon={<GoogleIcon style={{ color: '#5aac42' }} />}
              onClick={() => gapi.auth2.getAuthInstance().signIn().then(handleLoginSuccess)}
            >
              Sign in with Google
            </Button>
          ) : ( 
            <div>Loading...</div>
          )} 
        </div>
      ) : (
        <>
          <CalendarArea>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={['year', 'month']}
              label="Select Date"
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue);
                const monthYearKey = `${newValue.getMonth()}-${newValue.getFullYear()}`;
                const savedExpenses = localStorage.getItem("expenses");
                const parsedExpenses = savedExpenses ? JSON.parse(savedExpenses) : {};
                setExpenses(parsedExpenses);
              }}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
            />
            </LocalizationProvider>
            <div style={{ marginLeft: "20px", fontSize: "12px", color: "gray" }}>
              <strong>Last updated:</strong> {lastUpdated}<br />
              <strong>Last synced:</strong> {lastSynced}
            </div>
          </CalendarArea>
          <div style={{ padding: "20px" }}>
            <AddExpenseModal
              isModalOpen={isModalOpen}
              handleCloseModal={handleCloseModal}
              newExpense={newExpense}
              setNewExpense={setNewExpense}
              handleAddExpense={handleAddExpense}
              editingExpenseIndex={editingExpenseIndex}
            />

            <Button
              variant="contained"
              style={{ backgroundColor: '#5aac42' }}
              onClick={handleOpenModal}
              className="floating-button css-sghohy-MuiButtonBase-root-MuiButton-root"
            >
              <AddIcon />
            </Button>

            <div id="download-container">
              <BreakupArea
                expenses={expenses}
                selectedDate={selectedDate}
                menuAnchorEls={menuAnchorEls}
                setMenuAnchorEls={setMenuAnchorEls}
                handleMarkAsPaid={handleMarkAsPaid}
                handleEditExpense={handleEditExpense}
                openDeleteDialog={openDeleteDialog}
                handleOpenModal={handleOpenModal}
              />
              <DownloadCanvas expenses={expenses} selectedDate={selectedDate} months={months} />

              <Button variant="contained" style={{ backgroundColor: '#5aac42', marginTop: "10px" }} onClick={handleDownload} startIcon={<DownloadIcon />} disabled={!(expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] && expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()].length > 0)} sx={{ '&.Mui-disabled': { backgroundColor: '#d3d3d3 !important' } }}>
                Download Image
              </Button>
            </div>
          </div>
        </>
      )}
    <Dialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete <strong>{expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] && expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()][expenseToDelete]?.title}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} style={{ color: '#5aac42' }}>
            Cancel
          </Button>
          <Button onClick={handleDeleteExpense} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Modal
        open={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        aria-labelledby="sync-modal-title"
        aria-describedby="sync-modal-description"
      >
        <Box>
          <IconButton
            onClick={() => setIsSyncModalOpen(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: 525,
            bgcolor: 'background.paper',
            boxShadow: 24,
            border: 'none',
            outline: 'none',
            p: 2,
            textAlign: 'center',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {syncError ? (
                <CloseIcon style={{ color: 'red', marginRight: '10px' }} />
              ) : (
                <CircularProgress style={{ marginRight: '10px' }} />
              )}
              <h2 id="sync-modal-title" style={{ marginTop: '20px', fontSize: '16px' }}>
                Syncing your local and Google Drive data
                <br />
                Please wait...
              </h2>
            </div>
          </div>
          </Box>
        </Box>
      </Modal>
      <Dialog
        open={isLogoutDialogOpen}
        onClose={closeLogoutDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to logout?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeLogoutDialog} style={{ color: '#5aac42' }}>
            Cancel
          </Button>
          <Button onClick={handleLogout} color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </GoogleOAuthProvider>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
