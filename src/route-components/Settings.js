import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, CircularProgress } from '@mui/material';
import { fetchSettings } from '../utils/utils';

const Settings = () => {
  const [numSplits, setNumSplits] = useState(0);
  const [labels, setLabels] = useState([]);

  const [apartmentName, setApartmentName] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const handleCloseDialog = () => {
    setIsSaving(false);
    setOpenDialog(false);
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const { apartmentName, numSplits, labels } = JSON.parse(savedSettings);
      setApartmentName(apartmentName || '');
      setNumSplits(numSplits);
      setLabels(labels);
    }
  }, []);
  const handleNumSplitsChange = (e) => {
    if (e.target.value.trim() === '') {
      setNumSplits('');
      setLabels([]);
      return;
    }
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setNumSplits(value);
      const newLabels = Array(value).fill('').map((_, i) => labels[i] || '');
      console.log('New Labels:', newLabels);
      setLabels(newLabels);
    }
  };

  const handleLabelChange = (index, e) => {
    const newLabels = labels.map((label, i) => (i === index ? (e.target.value === '' ? '0' : e.target.value) : label));
    newLabels[index] = e.target.value;
    console.log('Updated Labels:', newLabels);
    setLabels(newLabels);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const filteredLabels = labels.filter(label => label !== '0' && label.trim() !== '');
    const settings = {
      apartmentName,
      numSplits: filteredLabels.length,
      labels: filteredLabels,
    };
    localStorage.setItem('settings', JSON.stringify(settings));
    setNumSplits(filteredLabels.length);
    setLabels(filteredLabels);
    const accessToken = localStorage.getItem("accessToken");

    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name='settings-oodu.json'&spaces=drive",
      {
        method: "GET",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
      }
    );

    const result = await response.json();
    const fileId = result.files && result.files.length ? result.files[0].id : null;

    const blob = new Blob([JSON.stringify(settings)], { type: "application/json" });
    const metadata = {
      name: "settings-oodu.json",
      mimeType: "application/json",
    };

    const form = new FormData();
    form.append(
      "metadata",
      new Blob([JSON.stringify(metadata)], { type: "application/json" })
    );
    form.append("file", blob);

    if (fileId) {
      await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
        {
          method: "PATCH",
          headers: new Headers({ Authorization: "Bearer " + accessToken }),
          body: form,
        }
      );
    } else {
      await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
        {
          method: "POST",
          headers: new Headers({ Authorization: "Bearer " + accessToken }),
          body: form,
        }
      );
    }

    setOpenDialog(true);
  };
  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Settings
      </Typography>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          label="Apartment Name"
          value={apartmentName}
          onChange={(e) => setApartmentName(e.target.value)}
          fullWidth
          margin="normal"
          style={{ marginRight: '10px' }}
        />
        <TextField
          label="Number of Splits"
          type="number"
          value={numSplits}
          onChange={handleNumSplitsChange}
          InputProps={{ inputProps: { min: 0 } }}
          onFocus={(e) => e.target.select()}
          fullWidth
          margin="normal"
          style={{ marginRight: '10px' }}
        />
        {labels.map((label, index) => (
          <TextField
            key={index}
            label={`Label ${index + 1}`}
            value={label === '0' ? '' : label}
            onChange={(e) => handleLabelChange(index, e)}
            fullWidth
            style={{ marginLeft: '10px', marginRight: '10px', width: 'calc(100% - 10px)' }}
            margin="normal"
          />
        ))}
        <Box display="flex" alignItems="center" marginTop="20px">
          <Button
            variant="contained"
            style={{ backgroundColor: '#5aac42', marginRight: '10px' }}
            onClick={handleSave}
            disabled={isSaving}
          >
            Save
          </Button>
          {isSaving && <CircularProgress size={24} />}
        </Box>
      </Box>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Settings Saved"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Your settings have been successfully saved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary" autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Settings;
