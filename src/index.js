import React, { useState, useEffect } from "react";
import "./styles.scss";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider, GoogleLogin, googleLogout } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { gapi } from "gapi-script";
import html2canvas from "html2canvas";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Modal, Box, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon 
} from '@mui/icons-material';
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
});

const floors = ["Ground Floor", "First Floor", "Second Floor"];

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const SCOPES = "https://www.googleapis.com/auth/drive.file";
const CLIENT_ID = "203933737892-oickgtpjobqfjr52evid9hia2qm35qaq.apps.googleusercontent.com";

const App = () => {
  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: CLIENT_ID,
        scope: SCOPES,
      });
    }
    gapi.load("client:auth2", start);
  }, []);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");
    return savedExpenses ? JSON.parse(savedExpenses) : {};
  });
  const [newExpense, setNewExpense] = useState({ title: "", amount: "", selectedFloors: ["Ground Floor", "First Floor", "Second Floor"] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const handleLoginSuccess = async (response) => {
    setAnchorEl(null);
    const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    const decoded = jwtDecode(response.credential);
    const profile = {
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture,
      accessToken: accessToken,
    };
    setUser(profile);
    localStorage.setItem("user", JSON.stringify(profile));
    localStorage.setItem("accessToken", accessToken);
  };


  useEffect(() => {
    const monthYearKey = `${selectedDate.getMonth()}-${selectedDate.getFullYear()}`;
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses]);

  const handleUpload = async () => {
    const expenses = localStorage.getItem("expenses");
    const blob = new Blob([expenses], { type: "application/json" });

    const accessToken = gapi.auth.getToken().access_token;
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

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
      {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
        body: form,
      }
    );

    const result = await response.json();
    console.log("File uploaded to Google Drive with ID:", result.id);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    googleLogout();
    setUser(null);
    localStorage.removeItem("user");
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
      setExpenses({ ...expenses, [monthYearKey]: updatedExpenses });
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


  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = () => {
    setNewExpense({ title: "", amount: "", selectedFloors: [] });
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
    setExpenses({ ...expenses, [monthYearKey]: updatedExpenses });
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
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MuiMenuItem onClick={handleUpload}>Upload</MuiMenuItem>
              <MuiMenuItem onClick={handleLogout}>Logout</MuiMenuItem>
            </Menu>
          </div>
        )}
      </Header>
      {!user ? (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log("Login Failed")}
          />

        </div>
      ) : (
        <div style={{ padding: "20px" }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <Button variant="contained" color="primary" onClick={handleAddExpense}>
                  {editingExpenseIndex !== null ? "Save Changes" : "Add Expense"}
                </Button>
              </div>
            </Box>
          </Modal>

          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenModal}
            className="floating-button css-sghohy-MuiButtonBase-root-MuiButton-root"
          >
            <AddIcon />
          </Button>

          <div id="download-container">
          <h2>Monthly Maintenance Breakup - {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <Table id="expense-table">
              <TableHead>
                <TableRow>
                  <TableCell>Sl. No.</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Floors</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(!expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] || expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()].length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Button variant="contained" color="primary" onClick={handleOpenModal}>
                        Add Expenses
                      </Button>
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
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleEditExpense(index)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton style={{ color: 'red' }} onClick={() => openDeleteDialog(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <h2>Floor-wise Maintenance Breakup</h2>
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <Table id="floor-table">
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
                    .filter((expense) => expense.selectedFloors.includes(floor))
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
          <div id="download-canvas" style={{ display: "none", position: "absolute", top: 0, left: 0, border: "1px solid black", padding: "20px", width: "800px" }}>
            <h2>Monthly Maintenance - {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}</h2>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
              <Table id="expense-table" style={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Sl. No.</TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Floors</TableCell>
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
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <h2>Floor-wise Maintenance Breakup</h2>
            <TableContainer component={Paper} style={{ marginTop: "20px" }}>
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
                      .filter((expense) => expense.selectedFloors.includes(floor))
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

          <Button variant="contained" color="primary" onClick={handleDownload} style={{ marginTop: "10px" }}>
            Download Image
          </Button>
          </div>
        </div>
      )}
    <Dialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this expense?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteExpense} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </GoogleOAuthProvider>
  );
};

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
