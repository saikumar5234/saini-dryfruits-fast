import React, { useCallback, useState, useEffect, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const AddProductDialog = React.memo(({
  open,
  onClose,
  newProduct,
  onFieldChange,
  onAddProduct,
  adding,
  categories,
  categoriesLoading,
  translating,
  onTranslate,
  newProductId,
  pendingNewProductImages,
  onPendingImageSelect,
  onRemovePendingImage,
  onClearAllPendingImages,
  addImageFiles,
  addImageFile,
  onAddImageFileChange,
  onAddMultipleImageFiles,
  onAddImageFileUpload,
  addImageUploading,
  addImageUploadError,
  addImageUploadSuccess,
  addProductImages,
  getProductImageUrl,
}) => {
  // Local state for form fields to avoid parent re-renders
  const [localProduct, setLocalProduct] = useState(newProduct);

  // Sync local state when dialog opens or newProduct changes
  useEffect(() => {
    if (open) {
      setLocalProduct(newProduct);
    }
  }, [open, newProduct]);

  // Update local state when translations complete
  useEffect(() => {
    setLocalProduct(prev => ({
      ...prev,
      name: {
        ...prev.name,
        hi: newProduct.name.hi,
        te: newProduct.name.te
      },
      description: {
        ...prev.description,
        hi: newProduct.description.hi,
        te: newProduct.description.te
      }
    }));
  }, [newProduct.name.hi, newProduct.name.te, newProduct.description.hi, newProduct.description.te]);

  const handleLocalFieldChange = useCallback((field, value, lang = null) => {
    setLocalProduct(prev => {
      if (field === 'name' || field === 'description') {
        return {
          ...prev,
          [field]: { ...prev[field], [lang]: value }
        };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  // Sync to parent on blur for better performance
  const handleFieldBlur = useCallback((field, lang = null) => {
    if (field === 'name' || field === 'description') {
      const value = localProduct[field][lang];
      if (value !== newProduct[field][lang]) {
        onFieldChange(field, value, null, lang);
      }
    } else if (field === 'price') {
      if (localProduct.price !== newProduct.price) {
        onFieldChange('price', localProduct.price);
      }
    }
  }, [localProduct, newProduct, onFieldChange]);

  const handleCategoryChange = useCallback((value) => {
    setLocalProduct(prev => ({ ...prev, category: value }));
    onFieldChange('category', value); // Sync immediately
  }, [onFieldChange]);
  
  // Memoize style objects to prevent recreation on every render
  const cancelButtonSx = useMemo(() => ({
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
  }), []);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      PaperProps={{ 
        sx: { 
          borderRadius: "15px", 
          boxShadow: 2,
          // Add will-change to hint browser for optimization
          willChange: 'transform, opacity'
        } 
      }}
      keepMounted={false}
      transitionDuration={0}
      disableScrollLock
      maxWidth="md"
      // Disable portal to render in place (faster)
      disablePortal={false}
    >
      {open && (
        <>
      <DialogTitle sx={{ 
        fontWeight: 700, 
        color: 'primary.main', 
        fontSize: 22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Add Product</span>
        <Button
          variant="outlined"
          size="small"
          onClick={onTranslate}
          disabled={translating || adding || !!newProductId || (!localProduct.name.en.trim() && !localProduct.description.en.trim())}
          sx={{
            fontWeight: 600,
            borderRadius: 1.5,
            px: 2,
            py: 0.5,
            fontSize: 13,
            minWidth: 100,
            textTransform: 'none'
          }}
        >
          {translating ? (
            <>
              <CircularProgress size={14} sx={{ mr: 0.5 }} />
              Translating...
            </>
          ) : (
            '🌐 Translate'
          )}
        </Button>
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
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth size="small" disabled={!!newProductId}>
            <InputLabel>Category</InputLabel>
            <Select
              value={localProduct.category}
              label="Category"
              onChange={e => handleCategoryChange(e.target.value)}
              disabled={!!newProductId || categoriesLoading}
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
              value={localProduct.name.en}
              onChange={e => handleLocalFieldChange('name', e.target.value, 'en')}
              onBlur={() => handleFieldBlur('name', 'en')}
              size="small"
              fullWidth
              disabled={!!newProductId}
            />
            <TextField
              label="Name (HI)"
              value={localProduct.name.hi}
              onChange={e => handleLocalFieldChange('name', e.target.value, 'hi')}
              onBlur={() => handleFieldBlur('name', 'hi')}
              size="small"
              fullWidth
              disabled={!!newProductId}
            />
            <TextField
              label="Name (TE)"
              value={localProduct.name.te}
              onChange={e => handleLocalFieldChange('name', e.target.value, 'te')}
              onBlur={() => handleFieldBlur('name', 'te')}
              size="small"
              fullWidth
              disabled={!!newProductId}
            />
          </Box>

          <TextField
            label="Price"
            type="number"
            value={localProduct.price}
            onChange={e => handleLocalFieldChange('price', e.target.value)}
            onBlur={() => handleFieldBlur('price')}
            size="small"
            fullWidth
            disabled={!!newProductId}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="Description (EN)"
              value={localProduct.description.en}
              onChange={e => handleLocalFieldChange('description', e.target.value, 'en')}
              onBlur={() => handleFieldBlur('description', 'en')}
              size="small"
              fullWidth
              multiline
              minRows={2}
              disabled={!!newProductId}
            />
            <TextField
              label="Description (HI)"
              value={localProduct.description.hi}
              onChange={e => handleLocalFieldChange('description', e.target.value, 'hi')}
              onBlur={() => handleFieldBlur('description', 'hi')}
              size="small"
              fullWidth
              multiline
              minRows={2}
              disabled={!!newProductId}
            />
            <TextField
              label="Description (TE)"
              value={localProduct.description.te}
              onChange={e => handleLocalFieldChange('description', e.target.value, 'te')}
              onBlur={() => handleFieldBlur('description', 'te')}
              size="small"
              fullWidth
              multiline
              minRows={2}
              disabled={!!newProductId}
            />
          </Box>

          {/* Image upload section hidden: no option to add images in Add Product */}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          color="inherit"
          variant="outlined"
          sx={cancelButtonSx}
          disabled={adding}
        >
          Cancel
        </Button>
        {!newProductId && (
          <Button
            onClick={onAddProduct}
            color="success"
            variant="contained"
            sx={{
              fontWeight: 700,
              borderRadius: 2,
              px: 2.5,
              py: 1.2,
              transition: 'all 0.2s',
              backgroundColor: 'success.main',
              color: '#fff',
              boxShadow: 2,
              '&:hover': {
                backgroundColor: 'success.dark',
                transform: 'scale(1.05)',
                boxShadow: 3,
              },
            }}
            disabled={adding || !localProduct.name.en || !localProduct.price}
          >
            {adding ? 'Adding...' : 'Save'}
          </Button>
        )}
      </DialogActions>
        </>
      )}
    </Dialog>
  );
});

AddProductDialog.displayName = 'AddProductDialog';

export default AddProductDialog;
