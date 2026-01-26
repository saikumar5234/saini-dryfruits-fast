import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import AddGreetingDialog from './AddGreetingDialog.jsx';
import { API_ENDPOINTS } from './config.js';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const GreetingManager = forwardRef((props, ref) => {
  const [showGreetingDialog, setShowGreetingDialog] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [greetings, setGreetings] = useState([]);

  const fetchGreetings = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.GREETINGS);
      if (!response.ok) throw new Error('Failed to fetch greetings');
      const data = await response.json();
      setGreetings(data);
    } catch (error) {
      console.error('Error fetching greetings:', error);
      setGreetings([]);
    }
  };

  useEffect(() => {
    fetchGreetings();
  }, []);

  const handleSaveGreeting = async (formData) => {
    try {
      const response = await fetch(API_ENDPOINTS.GREETINGS, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to save greeting');
      }
      await fetchGreetings();
      setSuccessOpen(true);
    } catch (error) {
      console.error('Error saving greeting:', error);
    }
  };

  useImperativeHandle(ref, () => ({
    openGreetingDialog: () => setShowGreetingDialog(true),
  }));

  return (
    <>
      <AddGreetingDialog
        open={showGreetingDialog}
        onClose={() => setShowGreetingDialog(false)}
        onSave={handleSaveGreeting}
      />
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Greeting added successfully!
        </MuiAlert>
      </Snackbar>
    </>
  );
});

export default GreetingManager; 