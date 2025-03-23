import styled from "@emotion/styled";

export const Header = styled("div")({
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

export const CalendarArea = styled("div")({
  display: "flex",
  alignItems: "center",
  position: "sticky",
  top: "80px", // Adjust this value based on the height of the header
  backgroundColor: "#F0F0F0", // Updated background color
  zIndex: 999,
  padding: "20px",
  paddingBottom: "0px",
});
