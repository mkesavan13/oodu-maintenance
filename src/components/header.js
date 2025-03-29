import React from "react";
import { Avatar, Box, Button, Popover } from "@mui/material";
import { Header } from "../utils/styled";
import { syncData } from "../utils/utils";

const HeaderComponent = ({ user, gapi, setSyncError, setIsSyncModalOpen, setPopoverAnchorEl: setPopoverAnchorElHandler, setExpenses, openLogoutDialog, popoverAnchorEl, setPopoverAnchorEl, setSelectedDate }) => {
  return (
    <Header>
      <div>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setSelectedDate(new Date())}>
          <img src="icons/icon-192x192.png" alt="Logo" style={{ height: "40px", marginRight: "10px" }} />
          Maintenance App
        </div>
      </div>
      {user && (
        <div>
          <Avatar
            src={user.picture}
            alt={user.name}
            onClick={(event) => setPopoverAnchorElHandler(event.currentTarget)}
            style={{ cursor: "pointer" }}
          />
          <Popover
            open={Boolean(popoverAnchorEl)}
            anchorEl={popoverAnchorEl}
            onClose={() => setPopoverAnchorElHandler(null)}
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
                <Button variant="outlined" style={{ color: '#5aac42', borderColor: '#5aac42' }} onClick={() => syncData(gapi, setSyncError, setIsSyncModalOpen, setPopoverAnchorEl, setExpenses)}>
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
  );
};

export default HeaderComponent;
