import React, { useState, useEffect } from "react";
import { Modal, Box, IconButton, TextField, MenuItem, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const AddExpenseModal = ({ isModalOpen, handleCloseModal, newExpense, setNewExpense, handleAddExpense, editingExpenseIndex }) => {
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const { labels } = JSON.parse(savedSettings);
      setLabels(labels);
    }
  }, []);

  return (
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
          label="Who pays?"
          value={newExpense.selectedFloors}
          onChange={(e) => setNewExpense({ ...newExpense, selectedFloors: e.target.value })}
          fullWidth
          margin="normal"
          SelectProps={{ multiple: true }}
        >
          {labels.map((label, index) => (
            <MenuItem key={index} value={label}>
              {label}
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
  );
};

export default AddExpenseModal;
