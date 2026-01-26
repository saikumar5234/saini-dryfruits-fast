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

          {/* Image upload section */}
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary', fontSize: 16 }}>
              Product Images
              {pendingNewProductImages.length > 0 && (
                <Typography component="span" sx={{ ml: 1, fontSize: 13, color: 'text.secondary', fontWeight: 400 }}>
                  ({pendingNewProductImages.length} {pendingNewProductImages.length === 1 ? 'image' : 'images'} selected)
                </Typography>
              )}
            </Box>
            
            {!newProductId && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                    disabled={adding}
                  >
                    Select Single Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={onPendingImageSelect}
                      disabled={adding}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                    disabled={adding}
                  >
                    Select Multiple Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={onPendingImageSelect}
                      disabled={adding}
                    />
                  </Button>
                  {pendingNewProductImages.length > 0 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={onClearAllPendingImages}
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                      disabled={adding}
                    >
                      Clear All
                    </Button>
                  )}
                </Box>
                
                {pendingNewProductImages.length > 0 && (
                  <Box>
                    <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontSize: 13 }}>
                      Selected images will be uploaded automatically after product is created:
                    </Typography>
                    <Grid container spacing={2}>
                      {pendingNewProductImages.map((file, idx) => (
                        <Grid item xs={6} sm={4} md={3} key={idx}>
                          <Box sx={{ 
                            position: 'relative', 
                            border: '1px solid #eee', 
                            borderRadius: 2, 
                            p: 1, 
                            bgcolor: '#fafbfc' 
                          }}>
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: 100,
                                objectFit: 'cover',
                                borderRadius: 4,
                                boxShadow: '0 2px 8px #0001'
                              }}
                            />
                            <Button
                              size="small"
                              color="error"
                              onClick={() => onRemovePendingImage(idx)}
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                minWidth: 32,
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                              }}
                              disabled={adding}
                            >
                              <DeleteIcon fontSize="small" />
                            </Button>
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                mt: 0.5,
                                textAlign: 'center',
                                fontSize: 11,
                                color: 'text.secondary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {file.name}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </Box>
            )}
            
            {!!newProductId && (
              <Box>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                    disabled={addImageUploading}
                  >
                    Select Single Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={onAddImageFileChange}
                      disabled={addImageUploading}
                    />
                  </Button>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<AddCircleOutlineIcon />}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                    disabled={addImageUploading}
                  >
                    Select Multiple Images
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      onChange={onAddMultipleImageFiles}
                      disabled={addImageUploading}
                    />
                  </Button>
                  {addImageFiles.length > 0 && (
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {addImageFiles.length} {addImageFiles.length === 1 ? 'image' : 'images'} selected
                    </Typography>
                  )}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={onAddImageFileUpload}
                    disabled={(addImageFiles.length === 0 && !addImageFile) || addImageUploading}
                    sx={{ fontWeight: 600, borderRadius: 2, boxShadow: 1 }}
                  >
                    {addImageUploading ? 'Uploading...' : `Upload ${addImageFiles.length > 0 ? `(${addImageFiles.length})` : ''}`}
                  </Button>
                </Box>
                
                {addImageUploadError && (
                  <Typography variant="body2" color="error" sx={{ mb: 1, fontSize: 13 }}>
                    {addImageUploadError}
                  </Typography>
                )}
                
                {addImageUploadSuccess && (
                  <Typography variant="body2" color="success.main" sx={{ mb: 1, fontSize: 13 }}>
                    Image uploaded successfully!
                  </Typography>
                )}
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {addProductImages.map((imageId, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: 1, 
                        border: '1px solid #eee', 
                        borderRadius: 2, 
                        p: 1, 
                        bgcolor: '#fafbfc' 
                      }}>
                        <img
                          src={getProductImageUrl(imageId)}
                          alt={`Product ${idx + 1}`}
                          style={{
                            maxWidth: '100%',
                            maxHeight: 100,
                            borderRadius: 4,
                            boxShadow: '0 2px 8px #0001',
                            objectFit: 'cover'
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
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
