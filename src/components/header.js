import React, {useState, useEffect} from "react";
import { Avatar, Box, Button, Popover, IconButton, Dialog, DialogActions, DialogContent, DialogContentText } from "@mui/material";
import SettingsIcon from '@mui/icons-material/Settings';
import { Link } from "react-router-dom";
import { Header } from "../utils/styled";
import { syncData } from "../utils/utils";
import { googleLogout } from "@react-oauth/google";

const HeaderComponent = ({ user, gapi, setSyncError, gapiReady, setIsSyncModalOpen, setUser, setExpenses, popoverAnchorEl, setPopoverAnchorEl, worker }) => {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const openLogoutDialog = () => {
    setIsLogoutDialogOpen(true);
  };
  const closeLogoutDialog = () => {
    setIsLogoutDialogOpen(false);
  };

  const handleLogout = async () => {
    setPopoverAnchorEl(null);
    try {
      await syncData(gapi, setSyncError, setIsSyncModalOpen, setPopoverAnchorEl, setExpenses);
      googleLogout();
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        await authInstance.signOut();
      }
      setUser(null);
      localStorage.clear();
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

  return (
    <Header>
      <div>
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}>
            <img src="icons/icon-192x192.png" alt="Logo" style={{ height: "40px", marginRight: "10px" }} />
            Maintenance App
          </Link>
        </div>
      </div>
      {user && (
        <div>
          <Avatar
            src={user.picture}
            alt={user.name}
            onClick={(event) => setPopoverAnchorEl(event.currentTarget)}
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
              <IconButton
                component={Link}
                to="/settings"
                style={{ position: 'absolute', top: 10, right: 10 }}
                onClick={() => setPopoverAnchorEl(null)}
              >
                <SettingsIcon />
              </IconButton>
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
                <Button variant="outlined" color="error" onClick={() => {
                  setPopoverAnchorEl(null);
                  openLogoutDialog();
                }}>
                  Logout
                </Button>
              </Box>
            </Box>
          </Popover>
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
        </div>
      )}
    </Header>
  );
};

export default HeaderComponent;
