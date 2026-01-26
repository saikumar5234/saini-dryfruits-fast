import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const ConfirmationDialog = React.memo(({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  content, 
  confirmText = 'Confirm',
  confirmColor = 'primary' 
}) => {
  const cancelButtonSx = {
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
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ sx: { borderRadius: '10px', boxShadow: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: `${confirmColor}.main`, fontSize: 22 }}>
        {title}
      </DialogTitle>
      <DialogContent>
        {content}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="inherit" 
          variant="outlined" 
          sx={cancelButtonSx}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color={confirmColor} 
          variant="contained" 
          autoFocus 
          sx={{ fontWeight: 600, borderRadius: 1.5, px: 1.5, py: 0.7 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';

const ConfirmationDialogs = React.memo(({
  deleteDialogOpen,
  setDeleteDialogOpen,
  handleDeleteProduct,
  rowToDelete,
  confirmDeleteSelectedOpen,
  setConfirmDeleteSelectedOpen,
  confirmDeleteSelectedProducts,
  confirmDisableOpen,
  setConfirmDisableOpen,
  confirmDisableSelectedProducts,
  confirmEnableOpen,
  setConfirmEnableOpen,
  confirmEnableSelectedProducts,
  confirmSaveOpen,
  setConfirmSaveOpen,
  handleSave,
  confirmAddProductOpen,
  setConfirmAddProductOpen,
  confirmAddProduct,
  confirmUpdateProductOpen,
  setConfirmUpdateProductOpen,
  confirmUpdateProduct,
  rowSelection,
}) => {
  return (
    <>
      {/* Delete Single Product Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => handleDeleteProduct(rowToDelete)}
        title="Delete Product"
        content="Are you sure you want to delete this product?"
        confirmText="Delete"
        confirmColor="error"
      />

      {/* Delete Selected Products Dialog */}
      <ConfirmationDialog
        open={confirmDeleteSelectedOpen}
        onClose={() => setConfirmDeleteSelectedOpen(false)}
        onConfirm={confirmDeleteSelectedProducts}
        title="Confirm Delete"
        content={`Are you sure you want to delete ${Object.keys(rowSelection).filter(key => rowSelection[key]).length} selected product(s)? This action cannot be undone.`}
        confirmText="Delete"
        confirmColor="error"
      />

      {/* Disable Selected Products Dialog */}
      <ConfirmationDialog
        open={confirmDisableOpen}
        onClose={() => setConfirmDisableOpen(false)}
        onConfirm={confirmDisableSelectedProducts}
        title="Confirm Disable"
        content={`Are you sure you want to disable ${Object.keys(rowSelection).filter(key => rowSelection[key]).length} selected product(s)? Disabled products will not be visible to customers.`}
        confirmText="Disable"
        confirmColor="warning"
      />

      {/* Enable Selected Products Dialog */}
      <ConfirmationDialog
        open={confirmEnableOpen}
        onClose={() => setConfirmEnableOpen(false)}
        onConfirm={confirmEnableSelectedProducts}
        title="Confirm Enable"
        content={`Are you sure you want to enable ${Object.keys(rowSelection).filter(key => rowSelection[key]).length} selected product(s)? Enabled products will be visible to customers.`}
        confirmText="Enable"
        confirmColor="success"
      />

      {/* Save Changes Dialog */}
      <ConfirmationDialog
        open={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        onConfirm={handleSave}
        title="Confirm Save"
        content="Are you sure you want to save all changes? This will update product prices in the database."
        confirmText="Save"
        confirmColor="primary"
      />

      {/* Add Product Dialog */}
      <ConfirmationDialog
        open={confirmAddProductOpen}
        onClose={() => setConfirmAddProductOpen(false)}
        onConfirm={confirmAddProduct}
        title="Confirm Add Product"
        content="Are you sure you want to add this product? Make sure all required fields are filled correctly."
        confirmText="Add Product"
        confirmColor="primary"
      />

      {/* Update Product Dialog */}
      <ConfirmationDialog
        open={confirmUpdateProductOpen}
        onClose={() => setConfirmUpdateProductOpen(false)}
        onConfirm={confirmUpdateProduct}
        title="Confirm Update"
        content="Are you sure you want to update this product? This will modify the product name, description, and category."
        confirmText="Update"
        confirmColor="primary"
      />
    </>
  );
});

ConfirmationDialogs.displayName = 'ConfirmationDialogs';

export default ConfirmationDialogs;
