import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";

const DownloadCanvas = ({ expenses, selectedDate, months }) => {
  const hasRemarks = (expenses[selectedDate.getMonth() + '-' + selectedDate.getFullYear()] || []).some(expense => expense.remarks || expense.paid);

  return (
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
  );
};

export default DownloadCanvas;
