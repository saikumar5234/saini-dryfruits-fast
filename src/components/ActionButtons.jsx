import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const ActionButtons = React.memo(({
  editMode,
  editField,
  saving,
  rowSelection,
  onAddProduct,
  onEdit,
  onCancelEdit,
  onSave,
  onDisableSelected,
  onEnableSelected,
  onDeleteSelected,
  t,
}) => {
  const buttonBaseSx = {
    fontWeight: 600,
    color: '#111',
    borderRadius: 2,
    px: 2.5,
    py: 1.2,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'action.hover',
      transform: 'scale(1.05)',
      boxShadow: 2,
      color: '#111',
    },
  };

  const activeButtonSx = {
    ...buttonBaseSx,
    fontWeight: 700,
    borderBottom: '3px solid #111',
    backgroundColor: 'rgba(0,0,0,0.04)',
  };

  const cancelButtonSx = {
    fontWeight: 600,
    color: '#111',
    border: '1.5px solid',
    borderColor: 'grey.400',
    borderRadius: 2,
    px: 2.5,
    py: 1.2,
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

  const selectedCount = Object.keys(rowSelection).filter(key => rowSelection[key]).length;
  const hasSelection = selectedCount > 0;

  return (
    <>
      {/* Top Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2, gap: 2 }}>
        <Button
          variant="text"
          color="inherit"
          startIcon={<AddCircleOutlineIcon />}
          onClick={onAddProduct}
          disabled={editMode || saving}
          sx={!editMode && !editField ? activeButtonSx : buttonBaseSx}
        >
          {t('add_product')}
        </Button>
        {!editMode && (
          <Button
            variant="text"
            color="inherit"
            startIcon={<EditIcon />}
            sx={editField === 'both' ? activeButtonSx : buttonBaseSx}
            onClick={onEdit}
            disabled={editMode}
          >
            Edit
          </Button>
        )}
        {editMode && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={onCancelEdit}
            disabled={saving}
            sx={cancelButtonSx}
          >
            Cancel
          </Button>
        )}
      </Box>

      {/* Bulk Action Buttons (shown when products are selected in edit mode) */}
      {editMode && hasSelection && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-start', 
          mb: 2, 
          gap: 2, 
          p: 2, 
          bgcolor: 'action.hover', 
          borderRadius: 2 
        }}>
          <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            {selectedCount} product(s) selected
          </Typography>
          <Button
            variant="contained"
            color="warning"
            onClick={onDisableSelected}
            disabled={saving}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Disable Product
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={onEnableSelected}
            disabled={saving}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Enable Product
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteSelected}
            disabled={saving}
            sx={{ fontWeight: 600, borderRadius: 2 }}
          >
            Delete Product
          </Button>
        </Box>
      )}
    </>
  );
});

ActionButtons.displayName = 'ActionButtons';

export const BottomToolbar = React.memo(({ editMode, editField, saving, onSave, onCancelEdit }) => {
  if (!editMode || editField === 'images') {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2, gap: 2 }}>
      <Button
        variant="contained"
        color="primary"
        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
        sx={{ 
          fontWeight: 600, 
          borderRadius: 3, 
          px: 2.5, 
          py: 1.2, 
          boxShadow: 3, 
          transition: 'transform 0.2s, box-shadow 0.2s', 
          '&:hover': { 
            transform: 'scale(1.08)', 
            boxShadow: 6 
          } 
        }}
        onClick={onSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save'}
      </Button>
      <Button
        variant="outlined"
        color="inherit"
        onClick={onCancelEdit}
        disabled={saving}
        sx={{
          fontWeight: 600,
          color: '#111',
          border: '1.5px solid',
          borderColor: 'grey.400',
          borderRadius: 2,
          px: 2.5,
          py: 1.2,
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
    </Box>
  );
});

BottomToolbar.displayName = 'BottomToolbar';

export default ActionButtons;
