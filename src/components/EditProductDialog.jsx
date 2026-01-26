import React, { useState, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';

const EditProductDialog = React.memo(({
  open,
  onClose,
  editProductForm,
  onFieldChange,
  onUpdateProduct,
  onTranslate,
  updatingProduct,
  categories,
  categoriesLoading,
  translating,
}) => {
  // Local state for instant field updates
  const [localForm, setLocalForm] = useState(editProductForm);

  // Sync when dialog opens or translations complete
  useEffect(() => {
    if (open) {
      setLocalForm(editProductForm);
    }
  }, [open]);

  // Update when translations complete
  useEffect(() => {
    setLocalForm(prev => ({
      ...prev,
      name: {
        ...prev.name,
        hi: editProductForm.name.hi,
        te: editProductForm.name.te
      },
      description: {
        ...prev.description,
        hi: editProductForm.description.hi,
        te: editProductForm.description.te
      }
    }));
  }, [editProductForm.name.hi, editProductForm.name.te, editProductForm.description.hi, editProductForm.description.te]);

  const handleLocalChange = useCallback((field, value, lang = null) => {
    setLocalForm(prev => {
      if (field === 'name' || field === 'description') {
        return { ...prev, [field]: { ...prev[field], [lang]: value } };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  const handleFieldBlur = useCallback((field, lang = null) => {
    if (field === 'name' || field === 'description') {
      const value = localForm[field][lang];
      if (value !== editProductForm[field][lang]) {
        onFieldChange(field, value, lang);
      }
    }
  }, [localForm, editProductForm, onFieldChange]);

  const handleCategoryChange = useCallback((value) => {
    setLocalForm(prev => ({ ...prev, category: value }));
    onFieldChange('category', value);
  }, [onFieldChange]);

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
      PaperProps={{ 
        sx: { 
          borderRadius: "15px", 
          boxShadow: 2,
          willChange: 'transform, opacity'
        } 
      }}
      keepMounted={false}
      transitionDuration={0}
      disableScrollLock
      maxWidth="md"
    >
      <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', fontSize: 22 }}>
        Edit Product
      </DialogTitle>
      <DialogContent>
        <Box sx={{ 
          mb: 2, 
          p: 1.5, 
          bgcolor: 'info.light', 
          borderRadius: 1, 
          border: '1px solid', 
          borderColor: 'info.main' 
        }}>
          <Typography variant="body2" sx={{ color: 'info.contrastText', fontSize: 13 }}>
            💡 <strong>Translation:</strong> Enter product name or description in English, then click the "Translate" button to translate to Hindi and Telugu.
          </Typography>

          <Button
            variant="outlined"
            color="secondary"
            fullWidth
            onClick={onTranslate}
            disabled={updatingProduct || translating || (!localForm.name.en.trim() && !localForm.description.en.trim())}
            sx={{
              fontWeight: 600,
              borderRadius: 2,
              py: 1.2,
              mt: 1,
              mb: 2,
              transition: 'all 0.2s',
              borderColor: 'secondary.main',
              '&:hover': {
                backgroundColor: 'secondary.light',
                transform: 'scale(1.02)',
                boxShadow: 2,
              },
            }}
          >
            {translating ? (
              <>
                <CircularProgress size={18} sx={{ mr: 1 }} />
                Translating...
              </>
            ) : (
              '🌐 Translate'
            )}
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth size="small" disabled={updatingProduct}>
            <InputLabel>Category</InputLabel>
            <Select
              value={localForm.category}
              label="Category"
              onChange={e => handleCategoryChange(e.target.value)}
              disabled={updatingProduct || categoriesLoading}
            >
              <MenuItem value="">
                <em>Select a category</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id || category.name} value={category.name || category}>
                  {category.name || category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Name (EN)"
              value={localForm.name.en}
              onChange={e => handleLocalChange('name', e.target.value, 'en')}
              onBlur={() => handleFieldBlur('name', 'en')}
              size="small"
              fullWidth
              disabled={updatingProduct}
            />
            <TextField
              label="Name (HI)"
              value={localForm.name.hi}
              onChange={e => handleLocalChange('name', e.target.value, 'hi')}
              onBlur={() => handleFieldBlur('name', 'hi')}
              size="small"
              fullWidth
              disabled={updatingProduct}
            />
            <TextField
              label="Name (TE)"
              value={localForm.name.te}
              onChange={e => handleLocalChange('name', e.target.value, 'te')}
              onBlur={() => handleFieldBlur('name', 'te')}
              size="small"
              fullWidth
              disabled={updatingProduct}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Description (EN)"
              value={localForm.description.en}
              onChange={e => handleLocalChange('description', e.target.value, 'en')}
              onBlur={() => handleFieldBlur('description', 'en')}
              size="small"
              fullWidth
              multiline
              minRows={2}
              disabled={updatingProduct}
            />
            <TextField
              label="Description (HI)"
              value={localForm.description.hi}
              onChange={e => handleLocalChange('description', e.target.value, 'hi')}
              onBlur={() => handleFieldBlur('description', 'hi')}
              size="small"
              fullWidth
              multiline
              minRows={2}
              disabled={updatingProduct}
            />
            <TextField
              label="Description (TE)"
              value={localForm.description.te}
              onChange={e => handleLocalChange('description', e.target.value, 'te')}
              onBlur={() => handleFieldBlur('description', 'te')}
              size="small"
              fullWidth
              multiline
              minRows={2}
              disabled={updatingProduct}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={cancelButtonSx}
          disabled={updatingProduct}
        >
          Cancel
        </Button>
        <Button
          onClick={onUpdateProduct}
          color="primary"
          variant="contained"
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
            py: 1.2,
            transition: 'all 0.2s',
            backgroundColor: 'primary.main',
            color: '#fff',
            boxShadow: 2,
            '&:hover': {
              backgroundColor: 'primary.dark',
              transform: 'scale(1.05)',
              boxShadow: 3,
            },
          }}
          disabled={updatingProduct || !localForm.name.en}
        >
          {updatingProduct ? 'Updating...' : 'Update Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

EditProductDialog.displayName = 'EditProductDialog';

export default EditProductDialog;
