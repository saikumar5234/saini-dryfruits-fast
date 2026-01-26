import React from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

export const FullscreenImageDialog = React.memo(({ open, imageUrl, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: 4, boxShadow: 2, backgroundColor: 'transparent' } }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
        <img 
          src={imageUrl} 
          alt="Product Fullscreen" 
          style={{ 
            maxWidth: '100%', 
            maxHeight: '80vh', 
            borderRadius: 12, 
            boxShadow: '0 8px 32px #0008' 
          }} 
        />
        <Button 
          onClick={onClose} 
          color="secondary" 
          variant="contained" 
          sx={{ mt: 3, fontWeight: 600, borderRadius: 2 }}
        >
          Close
        </Button>
      </Box>
    </Dialog>
  );
});

FullscreenImageDialog.displayName = 'FullscreenImageDialog';

export const TranslationSuccessSnackbar = React.memo(({ open, onClose }) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <MuiAlert 
        onClose={onClose} 
        severity="success" 
        sx={{ width: '100%' }}
      >
        ✅ Product name translated successfully!
      </MuiAlert>
    </Snackbar>
  );
});

TranslationSuccessSnackbar.displayName = 'TranslationSuccessSnackbar';
