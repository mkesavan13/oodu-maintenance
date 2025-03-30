import React from "react";
import { Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Menu as MuiMenu, MenuItem as MuiMenuItem, Button } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { months } from "../utils/constants";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";

const BreakupArea = ({ expenses, selectedDate, menuAnchorEls, setMenuAnchorEls, handleMarkAsPaid, handleEditExpense, openDeleteDialog, handleOpenModal }) => {
  const [floors, setFloors] = React.useState(() => {
    const settings = JSON.parse(localStorage.getItem('settings'));
    return settings?.labels || [];
  });
  return (
    <div>
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

      <h2>House-wise Maintenance Breakup</h2>
      <Grid container spacing={2} style={{ marginTop: "20px" }}>
        {floors.map((floor) => {
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
    </div>
  );
};

export default BreakupArea;
