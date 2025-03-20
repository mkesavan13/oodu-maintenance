import React, { useState, useEffect } from "react";
import "./styles.scss";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { gapi } from "gapi-script";
import html2canvas from "html2canvas";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Modal, Box, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Popover, Menu as MuiMenu } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Google as GoogleIcon,
  Download as DownloadIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import { Grid, Card, CardContent, Typography, Chip } from "@mui/material";
import {
  Button,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  CircularProgress,
  Menu,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import { styled } from "@mui/system";

const Header = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "black",
  color: "#5aac42",
  padding: "20px",
  fontSize: "24px",
  fontWeight: "bold",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  position: "sticky",
  top: 0,
  zIndex: 1000,
});

const CalendarArea = styled("div")({
  display: "flex",
  alignItems: "center",
  position: "sticky",
  top: "80px", // Adjust this value based on the height of the header
  backgroundColor: "#F0F0F0", // Updated background color
  zIndex: 999,
  padding: "20px",
  paddingBottom: "0px",
});

const floors = ["Ground Floor", "First Floor", "Second Floor"];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SCOPES = "https://www.googleapis.com/auth/drive.file";
const CLIENT_ID = "203933737892-oickgtpjobqfjr52evid9hia2qm35qaq.apps.googleusercontent.com";

const App = () => {
  const [gapiReady, setGapiReady] = useState(false);

  useEffect(() => {
    async function start() {
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
        setGapiReady(true); // Set gapiReady to true after successful initialization
      } catch (error) {
        console.error("Error initializing gapi:", error);
      }
    }
    gapi.load("client:auth2", start);
  }, []);

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const [syncError, setSyncError] = useState(false);
  const [menuAnchorEls, setMenuAnchorEls] = useState({});

  const syncData = async () => {
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
      const fileId = result.files.length ? result.files[0].id : null;

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
      if (!syncError) {
        setIsSyncModalOpen(false);
      }
    } catch (error) {
      console.error("Error syncing data:", error);
      setIsSyncModalOpen(false);
      setSyncError(true);
    }
  };

  const handleLoginSuccess = async (response) => {
    if (response) {
      const profile = {
        name: response.wt.Ad,
        email: response.wt.cu,
        picture: response.wt.hK,
      };
      setUser(profile);
      localStorage.setItem("user", JSON.stringify(profile));
      const accessToken = response.xc.access_token;
      localStorage.setItem("accessToken", accessToken);
      syncData();
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
      await syncData();
      localStorage.removeItem("accessToken");
      localStorage.removeItem("expenses");
      setUser(null);
      localStorage.removeItem("user");
      setIsLogoutDialogOpen(false);
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

  const handleMenuOpen = (event) => {
    setPopoverAnchorEl(event.currentTarget);
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
      <Header>
        <div>Oodu Maintenance</div>
        {user && (
          <div>
            <Avatar
              src={user.picture}
              alt={user.name}
              onClick={handleMenuOpen}
              style={{ cursor: "pointer" }}
            />
            <Popover
              open={Boolean(popoverAnchorEl)}
              anchorEl={popoverAnchorEl}
              onClose={() => setPopoverAnchorEl(null)}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
            >
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Avatar
                  src={user.picture}
                  alt={user.name}
                  sx={{ width: 80, height: 80, margin: '0 auto' }}
                />
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button variant="outlined" style={{ color: '#5aac42', borderColor: '#5aac42' }} onClick={syncData}>
                    Sync Now
                  </Button>
                  <Button variant="outlined" color="error" onClick={openLogoutDialog}>
                    Logout
                  </Button>
                </Box>
              </Box>
            </Popover>
          </div>
        )}
      </Header>
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
              <strong>Last updated:</strong> {lastUpdated}
            </div>
          </CalendarArea>
          <div style={{ padding: "20px" }}>
            <Modal
              open={isModalOpen}
              onClose={handleCloseModal}
              aria-labelledby="modal-title"
              aria-describedby="modal-description"
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '90%',
                  maxWidth: 400,
                  bgcolor: 'background.paper',
                  boxShadow: 24,
                  p: 2,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 id="modal-title" style={{ lineHeight: '1.2' }}>
                    {editingExpenseIndex !== null ? "Edit Expense" : "Add Expense"}
                  </h2>
                </div>
                <IconButton
                  onClick={handleCloseModal}
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
                <TextField
                  label="Expense Title"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  select
                  label="Select Floors"
                  value={newExpense.selectedFloors}
                  onChange={(e) => setNewExpense({ ...newExpense, selectedFloors: e.target.value })}
                  fullWidth
                  margin="normal"
                  SelectProps={{ multiple: true }}
                >
                  {floors.map((floor) => (
                    <MenuItem key={floor} value={floor}>
                      {floor}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Remarks"
                  value={newExpense.remarks}
                  onChange={(e) => setNewExpense({ ...newExpense, remarks: e.target.value })}
                  fullWidth
                  margin="normal"
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
                  <Button variant="contained" style={{ backgroundColor: '#5aac42' }} onClick={handleAddExpense}>
                    {editingExpenseIndex !== null ? "Save Changes" : "Add Expense"}
                  </Button>
                </div>
              </Box>
            </Modal>

            <Button
              variant="contained"
              style={{ backgroundColor: '#5aac42' }}
              onClick={handleOpenModal}
              className="floating-button css-sghohy-MuiButtonBase-root-MuiButton-root"
            >
              <AddIcon />
            </Button>

            <div id="download-container">
            <h2>Monthly Maintenance Breakup - {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
              {(!expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] || expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()].length === 0) ? (
                <Grid item xs={12}>
                  <Button variant="contained" style={{ backgroundColor: '#5aac42' }} onClick={handleOpenModal}>
                    Add Expenses
                  </Button>
                </Grid>
              ) : (
                (expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] || []).map((expense, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardContent
                        style={{
                          position: 'relative'
                        }}
                      >
                        <Typography variant="h6" style={{ display: 'flex', alignItems: 'center' }}>
                          {expense.title}
                          {expense.paid && <CheckIcon style={{ color: '#5aac42', marginLeft: '8px' }} />}
                        </Typography>
                        <Typography style={{ fontSize: '1rem', fontWeight: 'bold' }}>Rs. {expense.amount}/-</Typography>
                        <Typography style={{ fontSize: '1rem' }}>{expense.remarks || "No Remarks"}</Typography>
                        <div>
                          {expense.selectedFloors.map((floor, index) => (
                            <Chip key={index} label={floor} style={{ margin: "2px", marginTop: "5px" }} />
                          ))}
                        </div>
                        <IconButton
                          style={{ position: 'absolute', top: '10px', right: '10px' }}
                          onClick={(event) => setMenuAnchorEls({ ...menuAnchorEls, [index]: event.currentTarget })}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <MuiMenu
                          anchorEl={menuAnchorEls[index]}
                          open={Boolean(menuAnchorEls[index])}
                          onClose={() => setMenuAnchorEls({ ...menuAnchorEls, [index]: null })}
                        >
                          <MuiMenuItem onClick={() => { handleMarkAsPaid(index); setMenuAnchorEls({ ...menuAnchorEls, [index]: null }); }}>
                            {expense.paid ? <CancelIcon style={{ marginRight: '8px' }} /> : <CheckIcon style={{ marginRight: '8px' }} />}
                            {!expense.paid ? "Mark as Paid" : "Mark as Not Paid"}
                          </MuiMenuItem>
                          <MuiMenuItem onClick={() => { handleEditExpense(index); setMenuAnchorEls({ ...menuAnchorEls, [index]: null }); }}>
                            <EditIcon style={{ marginRight: '8px' }} />
                            Edit
                          </MuiMenuItem>
                          <MuiMenuItem onClick={() => { openDeleteDialog(index); setMenuAnchorEls({ ...menuAnchorEls, [index]: null }); }}>
                            <DeleteIcon style={{ marginRight: '8px' }} />
                            Delete
                          </MuiMenuItem>
                        </MuiMenu>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>

            <h2>Floor-wise Maintenance Breakup</h2>
            <Grid container spacing={2} style={{ marginTop: "20px" }}>
              {["Ground Floor", "First Floor", "Second Floor"].map((floor) => {
                const monthYearKey = `${selectedDate.getMonth()}-${selectedDate.getFullYear()}`;
                const totalAmount = (expenses[monthYearKey] || [])
                  .filter((expense) => expense.selectedFloors.includes(floor) && !expense.paid)
                  .reduce((sum, expense) => {
                    const floorCount = expense.selectedFloors.length;
                    return sum + parseFloat(expense.amount) / floorCount;
                  }, 0);
                const roundedAmount = Math.round(totalAmount);
                return (
                  <Grid item xs={12} sm={6} md={4} key={floor}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{floor}</Typography>
                        <Typography style={{ fontSize: '1rem', fontWeight: 'bold' }}>Rs. {roundedAmount}/- (Rounded Off)</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            <div id="download-canvas" style={{ display: "none", position: "absolute", top: 0, left: 0, border: "1px solid black", padding: "20px", width: "800px" }}>
              <h2>Thiruvanmiyur Monthly Maintenance - {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
              <TableContainer component={Paper} style={{ marginTop: "20px", boxShadow: "none" }}>
                <Table id="expense-table" style={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Sl. No.</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Floors</TableCell>
                      {hasRemarks && <TableCell>Remarks</TableCell>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(!expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] || expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()].length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No Expenses
                        </TableCell>
                      </TableRow>
                    ) : (
                      (expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] || []).map((expense, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{expense.title}</TableCell>
                          <TableCell>{expense.amount}</TableCell>
                          <TableCell>
                            {["Ground Floor", "First Floor", "Second Floor"].filter(floor => expense.selectedFloors.includes(floor)).map(floor => {
                              if (floor === "Ground Floor") return "G";
                              if (floor === "First Floor") return "1";
                              if (floor === "Second Floor") return "2";
                              return floor;
                            }).join(", ")}
                          </TableCell>
                          {hasRemarks && <TableCell>{expense.remarks ? `${expense.remarks}${expense.paid ? ' (Paid already)' : ''}` : (expense.paid ? 'Paid already' : '')}</TableCell>}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <h2>Floor-wise Maintenance Breakup</h2>
              <TableContainer component={Paper} style={{ marginTop: "20px", boxShadow: "none" }}>
                <Table id="floor-table" style={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Floor</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Round off</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {["Ground Floor", "First Floor", "Second Floor"].map((floor) => {
                      const monthYearKey = `${selectedDate.getMonth()}-${selectedDate.getFullYear()}`;
                      const totalAmount = (expenses[monthYearKey] || [])
                        .filter((expense) => expense.selectedFloors.includes(floor) && !expense.paid)
                        .reduce((sum, expense) => {
                          const floorCount = expense.selectedFloors.length;
                          return sum + parseFloat(expense.amount) / floorCount;
                        }, 0);
                      const roundedAmount = Math.round(totalAmount);
                      return (
                        <TableRow key={floor}>
                          <TableCell>
                            {floor === "Ground Floor" ? "G" : floor === "First Floor" ? "1" : floor === "Second Floor" ? "2" : floor}
                          </TableCell>
                          <TableCell>{totalAmount.toFixed(2)}</TableCell>
                          <TableCell>{roundedAmount}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

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
          <Button onClick={handleLogout} color="error" autoFocus>
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
