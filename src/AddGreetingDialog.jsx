import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Grow } from '@mui/material';

const AddGreetingDialog = ({ open, onClose, onSave }) => {
  const [greeting, setGreeting] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = () => {
    if (!greeting || !image) {
      setError('Please enter a greeting and select an image.');
      return;
    }
    setError('');
    const formData = new FormData();
    formData.append('greeting', greeting);
    if (image) formData.append('image', image);
    onSave(formData);
    setGreeting('');
    setImage(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 1, boxShadow: 2 } }}>
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', fontSize: 22 }}>Add Greeting</DialogTitle>
      <DialogContent>
        <TextField
          label="Greeting"
          value={greeting}
          onChange={e => setGreeting(e.target.value)}
          fullWidth
          margin="normal"
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginTop: 16 }}
        />
        <Grow in={!!error}><div>{error && <Box color="error.main" mt={2}>{error}</Box>}</div></Grow>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={{
            fontWeight: 600,
            color: '#111',
            border: '1.5px solid',
            borderColor: 'grey.400',
            borderRadius: 1.5,
            px: 1.5,
            py: 0.7,
            width: 70,
            minHeight: 36,
            fontSize: 15,
            transition: 'all 0.2s',
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'scale(1.05)',
              boxShadow: 2,
              color: '#111',
              borderColor: 'grey.600',
            },
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={!greeting || !image}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddGreetingDialog; 