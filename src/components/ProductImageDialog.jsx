import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteIcon from '@mui/icons-material/Delete';

const ProductImageDialog = React.memo(({
  open,
  onClose,
  editMode,
  imageUrls,
  viewImageIds,
  viewImagesLoading,
  pendingImageFiles,
  uploading,
  uploadSuccess,
  uploadError,
  imageDeleteSuccess,
  deletingImageIdx,
  getProductImageUrl,
  onImageFileChange,
  onUploadPendingImage,
  onDeleteImage,
  onFullscreenClick,
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
      maxWidth="sm" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: '10px', boxShadow: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 20, pb: 0.5 }}>
        {editMode ? 'Edit Images' : 'Product Images'}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 2, fontWeight: 500, color: 'text.secondary', fontSize: 16 }}>
          Current Images
        </Box>
        <Grid container spacing={2}>
          {editMode ? (
            (imageUrls || []).map((imageId, idx) => (
              imageId && (
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
                        maxWidth: 80,
                        maxHeight: 60,
                        borderRadius: 4,
                        marginBottom: 4,
                        boxShadow: '0 2px 8px #0001',
                        transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s',
                        cursor: 'pointer',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'scale(2.2)';
                        e.currentTarget.style.zIndex = 10;
                        e.currentTarget.style.boxShadow = '0 8px 32px #0003';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.zIndex = 1;
                        e.currentTarget.style.boxShadow = '0 2px 8px #0001';
                      }}
                    />
                    {editMode && (
                      <Tooltip title="Delete Image">
                        <span>
                          <Button 
                            onClick={() => onDeleteImage(idx)} 
                            color="error" 
                            size="small" 
                            sx={{ minWidth: 0 }} 
                            disabled={deletingImageIdx === idx}
                          >
                            {deletingImageIdx === idx ? (
                              <CircularProgress size={18} color="inherit" />
                            ) : (
                              <DeleteIcon fontSize="small" />
                            )}
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </Grid>
              )
            ))
          ) : viewImagesLoading ? (
            <Grid item xs={12}>
              <Box sx={{ color: 'text.disabled', textAlign: 'center', py: 2 }}>
                Loading images...
              </Box>
            </Grid>
          ) : viewImageIds.length > 0 ? (
            viewImageIds.map((imageId, idx) => (
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
                      maxWidth: 140,
                      maxHeight: 120,
                      borderRadius: 8,
                      marginBottom: 8,
                      boxShadow: '0 4px 16px #0001',
                      background: '#fff',
                      transition: 'transform 0.3s cubic-bezier(.4,2,.6,1), box-shadow 0.3s',
                      cursor: 'pointer',
                      border: '2px solid #e0e0e0',
                    }}
                    onClick={() => onFullscreenClick(getProductImageUrl(imageId))}
                  />
                </Box>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ color: 'text.disabled', textAlign: 'center', py: 2 }}>
                No Images
              </Box>
            </Grid>
          )}
        </Grid>

        {editMode && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 1, fontWeight: 500, color: 'text.secondary', fontSize: 16 }}>
              Add New Images
            </Box>
            <input
              type="file"
              accept="image/*"
              onChange={onImageFileChange}
              style={{ marginBottom: 8 }}
              multiple
            />
            {pendingImageFiles.length > 0 && (
              <Box sx={{ color: 'text.secondary', fontSize: 14, mb: 1 }}>
                Pending images: {pendingImageFiles.map(f => f.name).join(', ')}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onUploadPendingImage}
                  disabled={uploading}
                  sx={{ ml: 2, fontWeight: 600, borderRadius: 2, boxShadow: 1 }}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </Box>
            )}
            {uploadError && (
              <Typography variant="body2" color="error" sx={{ mt: 1, fontSize: 13 }}>
                {uploadError}
              </Typography>
            )}
            {uploadSuccess && !uploadError && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1, fontSize: 13 }}>
                {imageDeleteSuccess ? 'Image deleted successfully!' : 'Images uploaded successfully!'}
              </Typography>
            )}
            {imageDeleteSuccess && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1, fontSize: 13 }}>
                Image deleted successfully!
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ pb: 2, pr: 3 }}>
        <Button onClick={onClose} color="secondary" variant="outlined" sx={cancelButtonSx}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});

ProductImageDialog.displayName = 'ProductImageDialog';

export default ProductImageDialog;
