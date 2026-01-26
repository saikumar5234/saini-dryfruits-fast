import React, { useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import AddProductDialog from './components/AddProductDialog';

const ProductDialogManager = forwardRef((props, ref) => {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    openAddDialog: () => {
      setAddDialogOpen(true);
    },
    closeAddDialog: () => {
      setAddDialogOpen(false);
    }
  }));

  const handleClose = useCallback(() => {
    setAddDialogOpen(false);
    if (props.onCloseAddDialog) {
      props.onCloseAddDialog();
    }
  }, [props]);

  return (
    <AddProductDialog
      open={addDialogOpen}
      onClose={handleClose}
      newProduct={props.newProduct}
      onFieldChange={props.onFieldChange}
      onAddProduct={props.onAddProduct}
      adding={props.adding}
      categories={props.categories}
      categoriesLoading={props.categoriesLoading}
      translating={props.translating}
      onTranslate={props.onTranslate}
      newProductId={props.newProductId}
      pendingNewProductImages={props.pendingNewProductImages}
      onPendingImageSelect={props.onPendingImageSelect}
      onRemovePendingImage={props.onRemovePendingImage}
      onClearAllPendingImages={props.onClearAllPendingImages}
      addImageFiles={props.addImageFiles}
      addImageFile={props.addImageFile}
      onAddImageFileChange={props.onAddImageFileChange}
      onAddMultipleImageFiles={props.onAddMultipleImageFiles}
      onAddImageFileUpload={props.onAddImageFileUpload}
      addImageUploading={props.addImageUploading}
      addImageUploadError={props.addImageUploadError}
      addImageUploadSuccess={props.addImageUploadSuccess}
      addProductImages={props.addProductImages}
      getProductImageUrl={props.getProductImageUrl}
    />
  );
});

ProductDialogManager.displayName = 'ProductDialogManager';

export default ProductDialogManager;
