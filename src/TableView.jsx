import React, { useMemo, useState, useEffect, useRef, useCallback, lazy, Suspense, memo, startTransition, useReducer } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { API_ENDPOINTS } from './config.js';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EditProvider, useEditContext } from './contexts/EditContext';

// Import ProductDialogManager for instant dialog opening (like GreetingManager pattern)
import ProductDialogManager from './ProductDialogManager';
import ProductTable from './components/ProductTable';

// Lazy load other heavy dialogs
const ProductImageDialog = lazy(() => import('./components/ProductImageDialog'));
const EditProductDialog = lazy(() => import('./components/EditProductDialog'));

// Import lightweight components immediately
import ConfirmationDialogs from './components/ConfirmationDialogs';
import ActionButtons, { BottomToolbar } from './components/ActionButtons';
import { FullscreenImageDialog, TranslationSuccessSnackbar } from './components/UIComponents';

// Import utilities and hooks
import { createTableColumns } from './utils/tableColumns';
import { 
  useProducts, 
  useCategories, 
  usePriceHistories, 
  useTranslation as useCustomTranslation,
  useLastSelectedCategory,
  getDateRange,
  customGlobalFilterFn 
} from './hooks/useTableView';

function TableViewContent() {
  // Ref for ProductDialogManager (like GreetingManager pattern)
  const productDialogRef = useRef(null);
  
  // Use edit context instead of local state
  const { 
    editMode, 
    editField, 
    saving, 
    setSaving,
    rowSelection,
    setRowSelection,
    priceRefs,
    priceFieldTouched,
    enterEditMode,
    exitEditMode
  } = useEditContext();

  // Use custom hooks
  const { loading, data, setData, editedData, setEditedData, fetchProducts, isNumericId } = useProducts();
  const { categories, categoriesLoading, fetchCategories } = useCategories();
  const { lastSelectedCategory, saveCategory } = useLastSelectedCategory();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  
  // Dialog states (addDialogOpen moved to ProductDialogManager)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [rowToDelete, setRowToDelete] = useState(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageDialogProductId, setImageDialogProductId] = useState(null);
  const [imageDialogEditMode, setImageDialogEditMode] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  
  // Confirmation dialog states
  const [confirmDeleteSelectedOpen, setConfirmDeleteSelectedOpen] = useState(false);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [confirmEnableOpen, setConfirmEnableOpen] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [confirmAddProductOpen, setConfirmAddProductOpen] = useState(false);
  const [confirmUpdateProductOpen, setConfirmUpdateProductOpen] = useState(false);
  
  // Product states
  const [newProduct, setNewProduct] = useState({
    category: '',
    name: { en: '', hi: '', te: '' },
    description: { en: '', hi: '', te: '' },
    price: '',
    imageUrls: ['']
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductForm, setEditProductForm] = useState({
    category: '',
    name: { en: '', hi: '', te: '' },
    description: { en: '', hi: '', te: '' },
    price: ''
  });
  
  // Image states
  const [pendingNewProductImages, setPendingNewProductImages] = useState([]);
  const [viewImageIds, setViewImageIds] = useState([]);
  const [viewImagesLoading, setViewImagesLoading] = useState(false);
  const [pendingImageFiles, setPendingImageFiles] = useState([]);
  const [deletingImageIdx, setDeletingImageIdx] = useState(null);
  const [addImageFile, setAddImageFile] = useState(null);
  const [addImageFiles, setAddImageFiles] = useState([]);
  const [addProductImages, setAddProductImages] = useState([]);
  const [newProductId, setNewProductId] = useState(null);
  
  // Loading/Success states
  const [adding, setAdding] = useState(false);
  const [updatingProduct, setUpdatingProduct] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageDeleteSuccess, setImageDeleteSuccess] = useState(false);
  const [imageEditSaveSuccess, setImageEditSaveSuccess] = useState(false);
  const [addImageUploading, setAddImageUploading] = useState(false);
  const [addImageUploadSuccess, setAddImageUploadSuccess] = useState(false);
  const [addImageUploadError, setAddImageUploadError] = useState("");
  
  // Translation states
  const { translating, setTranslating, translationSuccess, setTranslationSuccess, translateText } = useCustomTranslation();
  
  // Table states (rowSelection now from context)
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Price histories hook
  const priceHistories = usePriceHistories(data, editedData, editMode);

  // Sort data to show active products first, disabled products at bottom
  const sortedData = useMemo(() => {
    const filtered = data.filter(p => isNumericId(p.id));
    return filtered.sort((a, b) => {
      const aDisabled = a.isDisabled ? 1 : 0;
      const bDisabled = b.isDisabled ? 1 : 0;
      return aDisabled - bDisabled;
    });
  }, [data, isNumericId]);

  const sortedEditedData = useMemo(() => {
    const filtered = editedData.filter(p => isNumericId(p.id));
    return filtered.sort((a, b) => {
      const aDisabled = a.isDisabled ? 1 : 0;
      const bDisabled = b.isDisabled ? 1 : 0;
      return aDisabled - bDisabled;
    });
  }, [editedData, isNumericId]);
  
  // Memoize the table data to prevent unnecessary re-renders
  const tableData = useMemo(() => {
    return editMode ? sortedEditedData : sortedData;
  }, [editMode, sortedEditedData, sortedData]);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Listen for category creation events
  useEffect(() => {
    const handleCategoryCreated = () => {
      fetchCategories();
    };
    
    window.addEventListener('categoryCreated', handleCategoryCreated);
    
    return () => {
      window.removeEventListener('categoryCreated', handleCategoryCreated);
    };
  }, []);
  
  // Update newProduct category when lastSelectedCategory changes
  useEffect(() => {
    if (lastSelectedCategory) {
      setNewProduct(prev => ({ ...prev, category: lastSelectedCategory }));
    }
  }, [lastSelectedCategory]);

  // Focus the first price field when entering edit mode
  useEffect(() => {
    if (editMode && (editField === 'price' || editField === 'both') && priceRefs.current[0]) {
      priceRefs.current[0].focus();
    } else if (editMode) {
    }
  }, [editMode, editField]);

  const handlePriceChange = useCallback((value, productId) => {
    setEditedData(prev => prev.map((row) => {
      if (row.id === productId) {
        return { ...row, price: value };
      }
      return row;
    }));
  }, []);

  const handleImageUrlChange = useCallback((value, rowIndex, imgIndex) => {
    setEditedData(prev => prev.map((row, idx) => {
      if (idx === rowIndex) {
        const urls = Array.isArray(row.imageUrls) ? [...row.imageUrls] : [];
        urls[imgIndex] = value;
        return { ...row, imageUrls: urls };
      }
      return row;
    }));
  }, []);

  const handleAddImageUrl = useCallback((rowIndex) => {
    setEditedData(prev => prev.map((row, idx) => {
      if (idx === rowIndex) {
        const urls = Array.isArray(row.imageUrls) ? [...row.imageUrls] : [];
        urls.push('');
        return { ...row, imageUrls: urls };
      }
      return row;
    }));
  }, []);

  const handleDeleteImageUrl = useCallback((rowIndex, imgIndex) => {
    setEditedData(prev => prev.map((row, idx) => {
      if (idx === rowIndex) {
        const urls = Array.isArray(row.imageUrls) ? [...row.imageUrls] : [];
        urls.splice(imgIndex, 1);
        return { ...row, imageUrls: urls };
      }
      return row;
    }));
  }, []);

  const handleSave = useCallback(async () => {
    setConfirmSaveOpen(false);
    
    // Find products with changed prices by comparing using product ID
    const originalDataMap = new Map(data.map(item => [item.id, item]));
    const updates = editedData.filter((row) => {
      const original = originalDataMap.get(row.id);
      return original && row.price !== original.price;
    });
    
    // Update prices in background if there are changes
    if (updates.length > 0) {
      setSaving(true);
      try {
        await Promise.all(updates.map(async (row) => {
          const response = await fetch(API_ENDPOINTS.PRODUCT_PRICE(row.id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: parseFloat(row.price) }),
          });
          if (!response.ok) throw new Error('Failed to update price');
        }));
        
        // Update both data and editedData with new prices
        const updatedData = data.map(item => {
          const edited = editedData.find(e => e.id === item.id);
          return edited ? { ...item, price: edited.price } : item;
        });
        
        setData(updatedData);
        setEditedData(updatedData);
        
        // Exit edit mode after state is updated
        exitEditMode();
      } catch (error) {
        // Optionally show error notification
      } finally {
        setSaving(false);
      }
    } else {
      // No changes, just exit edit mode
      exitEditMode();
    }
  }, [editedData, data, exitEditMode, setSaving, setData, setEditedData]);

  const handleDeleteProduct = useCallback(async (row) => {
    if (!row || !row.id) {
      setDeleteDialogOpen(false);
      return;
    }
    setDeleteDialogOpen(false);
    
    // Optimistically remove from UI immediately for instant feedback
    setData(prev => prev.filter(p => p.id !== row.id));
    setEditedData(prev => prev.filter(p => p.id !== row.id));
    
    // Then delete from backend (non-blocking)
    try {
      const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${row.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        // If delete fails, we could optionally refetch to restore the item
      }
    } catch (error) {
    }
  }, []);

  // Handle delete for selected products
  const handleDeleteSelectedProducts = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    if (selectedIds.length === 0) return;
    setConfirmDeleteSelectedOpen(true);
  }, [rowSelection]);

  const confirmDeleteSelectedProducts = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    setConfirmDeleteSelectedOpen(false);
    setRowSelection({}); // Clear selection immediately
    
    // Optimistically remove from UI immediately for instant feedback
    setData(prev => prev.filter(p => !selectedIds.includes(String(p.id))));
    setEditedData(prev => prev.filter(p => !selectedIds.includes(String(p.id))));
    
    // Then delete from backend (non-blocking)
    try {
      await Promise.all(selectedIds.map(async (productId) => {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error(`Failed to delete product ${productId}`);
      }));
    } catch (error) {
      // Could optionally refetch here to restore items if delete failed
    }
  }, [rowSelection]);

  // Handle disable for selected products
  const handleDisableSelectedProducts = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    if (selectedIds.length === 0) return;
    setConfirmDisableOpen(true);
  }, [rowSelection]);

  const confirmDisableSelectedProducts = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    setConfirmDisableOpen(false);
    setSaving(true);
    try {
      // Call backend to disable and optimistically update UI
      await Promise.all(selectedIds.map(async (productId) => {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}/disable`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_disable: true }),
        });
        if (!response.ok) {
          return;
        }
      }));
      // Optimistically mark disabled in UI
      setData(prev =>
        prev.map(p =>
          selectedIds.includes(String(p.id)) ? { ...p, isDisabled: true } : p
        ),
      );
      setEditedData(prev =>
        prev.map(p =>
          selectedIds.includes(String(p.id)) ? { ...p, isDisabled: true } : p
        ),
      );
      setRowSelection({}); // Clear selection
    } catch (error) {
    }
    setSaving(false);
  }, [rowSelection]);

  // Handle enable for selected products
  const handleEnableSelectedProducts = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    if (selectedIds.length === 0) return;
    setConfirmEnableOpen(true);
  }, [rowSelection]);

  const confirmEnableSelectedProducts = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection).filter(key => rowSelection[key]);
    setConfirmEnableOpen(false);
    setSaving(true);
    try {
      await Promise.all(selectedIds.map(async (productId) => {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}/enable`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_disable: false }),
        });
        if (!response.ok) {
          return;
        }
      }));
      // Optimistically mark enabled in UI
      setData(prev =>
        prev.map(p =>
          selectedIds.includes(String(p.id)) ? { ...p, isDisabled: false } : p
        ),
      );
      setEditedData(prev =>
        prev.map(p =>
          selectedIds.includes(String(p.id)) ? { ...p, isDisabled: false } : p
        ),
      );
      setRowSelection({}); // Clear selection
    } catch (error) {
    }
    setSaving(false);
  }, [rowSelection]);

  const handleAddProductFieldChange = useCallback((field, value, imgIdx = null, lang = null) => {
    // If category is being changed, save it to localStorage
    if (field === 'category' && value) {
      saveCategory(value);
    }
    
    setNewProduct(prev => {
      if (field === 'imageUrls') {
        const urls = [...prev.imageUrls];
        urls[imgIdx] = value;
        return { ...prev, imageUrls: urls };
      }
      if (field === 'name' || field === 'description') {
        const updatedField = { ...prev[field], [lang]: value };
        return { ...prev, [field]: updatedField };
      }
      return { ...prev, [field]: value };
    });
  }, [saveCategory]);

  // Manual translation handler for Add Product Dialog
  const handleTranslateAddProduct = useCallback(async () => {
    const nameEn = newProduct.name.en.trim();
    const descriptionEn = newProduct.description.en.trim();
    
    if (!nameEn && !descriptionEn) return;
    
    setTranslating(true);
    
    try {
      const translations = [];
      
      // Translate name if present
      if (nameEn) {
        translations.push(
          Promise.all([
            translateText(nameEn, 'hi'),
            translateText(nameEn, 'te')
          ])
        );
      } else {
        translations.push(Promise.resolve([null, null]));
      }
      
      // Translate description if present
      if (descriptionEn) {
        translations.push(
          Promise.all([
            translateText(descriptionEn, 'hi'),
            translateText(descriptionEn, 'te')
          ])
        );
      } else {
        translations.push(Promise.resolve([null, null]));
      }
      
      const [[nameHi, nameTe], [descHi, descTe]] = await Promise.all(translations);
      
      setNewProduct(current => ({
        ...current,
        name: {
          ...current.name,
          hi: nameHi || current.name.hi,
          te: nameTe || current.name.te
        },
        description: {
          ...current.description,
          hi: descHi || current.description.hi,
          te: descTe || current.description.te
        }
      }));
      
      if (nameHi || nameTe || descHi || descTe) {
        setTranslationSuccess(true);
        setTimeout(() => setTranslationSuccess(false), 3000);
      }
    } catch (error) {
    } finally {
      setTranslating(false);
    }
  }, [newProduct.name.en, newProduct.description.en, translateText, setTranslating, setTranslationSuccess]);

  const handleAddProductAddImage = useCallback(() => {
    setNewProduct(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  }, []);

  const handleAddProductDeleteImage = useCallback((imgIdx) => {
    setNewProduct(prev => {
      const urls = [...prev.imageUrls];
      urls.splice(imgIdx, 1);
      return { ...prev, imageUrls: urls };
    });
  }, []);

  // Handle edit product - open dialog with product data
  const handleEditProduct = useCallback((product) => {
    // Helper to safely extract multilingual object
    const getMultilingualObj = (obj) => {
      if (!obj) return { en: '', hi: '', te: '' };
      if (typeof obj === 'string') return { en: obj, hi: '', te: '' };
      if (typeof obj === 'object') {
        return {
          en: obj.en || '',
          hi: obj.hi || '',
          te: obj.te || ''
        };
      }
      return { en: '', hi: '', te: '' };
    };

    setEditingProduct(product);
    setEditProductForm({
      category: product.category || '',
      name: getMultilingualObj(product.name),
      description: getMultilingualObj(product.description),
      price: product.price || ''
    });
    setEditProductDialogOpen(true);
  }, []);

  // Handle edit product field changes (no auto-translation)
  const handleEditProductFieldChange = useCallback((field, value, lang = null) => {
    setEditProductForm(prev => {
      if (field === 'name' || field === 'description') {
        const updatedField = { ...prev[field], [lang]: value };
        return { ...prev, [field]: updatedField };
      }
      return { ...prev, [field]: value };
    });
  }, []);

  // Manual translation handler for Edit Product Dialog
  const handleTranslateEditProduct = useCallback(async () => {
    const nameEn = editProductForm.name.en.trim();
    const descriptionEn = editProductForm.description.en.trim();
    
    if (!nameEn && !descriptionEn) return;
    
    setTranslating(true);
    
    try {
      const translations = [];
      
      // Translate name if present
      if (nameEn) {
        translations.push(
          Promise.all([
            translateText(nameEn, 'hi'),
            translateText(nameEn, 'te')
          ])
        );
      } else {
        translations.push(Promise.resolve([null, null]));
      }
      
      // Translate description if present
      if (descriptionEn) {
        translations.push(
          Promise.all([
            translateText(descriptionEn, 'hi'),
            translateText(descriptionEn, 'te')
          ])
        );
      } else {
        translations.push(Promise.resolve([null, null]));
      }
      
      const [[nameHi, nameTe], [descHi, descTe]] = await Promise.all(translations);
      
      setEditProductForm(current => ({
        ...current,
        name: {
          ...current.name,
          hi: nameHi || current.name.hi,
          te: nameTe || current.name.te
        },
        description: {
          ...current.description,
          hi: descHi || current.description.hi,
          te: descTe || current.description.te
        }
      }));
      
      if (nameHi || nameTe || descHi || descTe) {
        setTranslationSuccess(true);
        setTimeout(() => setTranslationSuccess(false), 3000);
      }
    } catch (error) {
    } finally {
      setTranslating(false);
    }
  }, [editProductForm.name.en, editProductForm.description.en, translateText, setTranslating, setTranslationSuccess]);

  // Handle update product
  const handleUpdateProduct = useCallback(async () => {
    if (!editingProduct || !editingProduct.id) return;
    setConfirmUpdateProductOpen(true);
  }, [editingProduct]);

  const confirmUpdateProduct = useCallback(async () => {
    if (!editingProduct || !editingProduct.id) return;
    setConfirmUpdateProductOpen(false);
    setUpdatingProduct(true);
    
    console.log('=== SENDING TO BACKEND ===');
    console.log('Product ID:', editingProduct.id);
    console.log('Category:', editProductForm.category);
    console.log('Name (sending to BE):', editProductForm.name);
    console.log('Description (sending to BE):', editProductForm.description);
    
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_UPDATE(editingProduct.id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: editProductForm.category,
          nameJson: JSON.stringify(editProductForm.name),
          descriptionJson: JSON.stringify(editProductForm.description)
        })
      });
      if (!response.ok) throw new Error('Failed to update product');
      
      const updatedProduct = await response.json();
      console.log('=== RECEIVED FROM BACKEND ===');
      console.log('Updated Product:', updatedProduct);
      console.log('Name (returned from BE):', updatedProduct.name);
      console.log('Description (returned from BE):', updatedProduct.description);
      
      await fetchProducts(); // Refresh data
      
      // Find and log the product from the refreshed data
      const refreshedProduct = data.find(p => p.id === editingProduct.id);
      console.log('=== AFTER REFRESH ===');
      console.log('Product in table:', refreshedProduct);
      console.log('Name in table:', refreshedProduct?.name);
      console.log('Description in table:', refreshedProduct?.description);
      
      setEditProductDialogOpen(false);
      setEditingProduct(null);
      setEditProductForm({
        category: '',
        name: { en: '', hi: '', te: '' },
        description: { en: '', hi: '', te: '' },
        price: ''
      });
    } catch (error) {
    }
    setUpdatingProduct(false);
  }, [editingProduct, editProductForm, fetchProducts, data]);

  // Handle close edit product dialog
  const handleCloseEditProductDialog = useCallback(() => {
    setEditProductDialogOpen(false);
    setEditingProduct(null);
    setEditProductForm({
      category: '',
      name: { en: '', hi: '', te: '' },
      description: { en: '', hi: '', te: '' },
      price: ''
    });
  }, []);

  const handleAddProduct = useCallback(async () => {
    // Validate that category is selected
    if (!newProduct.category || newProduct.category.trim() === '') {
      alert('Please select a category before adding the product');
      return;
    }
    setConfirmAddProductOpen(true);
  }, [newProduct.category]);

  const confirmAddProduct = useCallback(async () => {
    setConfirmAddProductOpen(false);
    setAdding(true);
    
    console.log('=== ADD PRODUCT - SENDING TO BACKEND ===');
    console.log('Category:', newProduct.category);
    console.log('Name (sending to BE):', newProduct.name);
    console.log('Description (sending to BE):', newProduct.description);
    console.log('Price:', newProduct.price);
    
    try {
      // Send product details to backend
      const response = await fetch(API_ENDPOINTS.PRODUCTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: newProduct.category,
          name: newProduct.name, // Send complete multilingual object
          description: newProduct.description, // Send complete multilingual object
          price: parseFloat(newProduct.price)
        })
      });
      if (!response.ok) throw new Error('Failed to add product');
      const created = await response.json();
      
      console.log('=== ADD PRODUCT - RECEIVED FROM BACKEND ===');
      console.log('Created Product:', created);
      console.log('Name (returned from BE):', created.name);
      console.log('Description (returned from BE):', created.description);
      
      if (isNumericId(created.id)) {
        // Add initial price to price history using the same price update endpoint
        try {
          await fetch(API_ENDPOINTS.PRODUCT_PRICE(created.id), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              price: parseFloat(newProduct.price)
            }),
          });
        } catch (priceHistoryError) {
          // If price history creation fails, log but don't block product creation
        }
        
        setNewProductId(created.id);
        setAddProductImages([]);
        
        // Upload all pending images if any
        if (pendingNewProductImages.length > 0) {
          setAddImageUploading(true);
          try {
            const uploadPromises = pendingNewProductImages.map(async (file) => {
              const formData = new FormData();
              formData.append('image', file);
              const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGES(created.id), {
                method: 'POST',
                body: formData,
              });
              if (response.ok) {
                const { imageId } = await response.json();
                return imageId;
              }
              return null;
            });
            
            const uploadedImageIds = (await Promise.all(uploadPromises)).filter(id => id !== null);
            setAddProductImages(uploadedImageIds);
            
            // Clear pending images
            setPendingNewProductImages([]);
          } catch (error) {
          }
          setAddImageUploading(false);
        }
        
        // Refresh products from backend to get correctly parsed data
        await fetchProducts();
        
        console.log('=== ADD PRODUCT - AFTER REFRESH ===');
        const refreshedProduct = data.find(p => p.id === created.id);
        console.log('Product in table:', refreshedProduct);
        console.log('Name in table:', refreshedProduct?.name);
        console.log('Description in table:', refreshedProduct?.description);
        
        // Save the category to localStorage after successful product creation
        if (newProduct.category) {
          saveCategory(newProduct.category);
        }
        
        // Reset form state BEFORE closing dialog
        setNewProductId(null);
        setAddProductImages([]);
        setAddImageFile(null);
        setAddImageFiles([]);
        setPendingNewProductImages([]);
        setAddImageUploadSuccess(false);
        setAddImageUploadError("");
        // Reset form but keep the last selected category
        setNewProduct({
          category: lastSelectedCategory || '', // Preserve last selected category
          name: { en: '', hi: '', te: '' },
          description: { en: '', hi: '', te: '' },
          price: '',
          imageUrls: ['']
        });
        
        // Close dialog using the ref method
        productDialogRef.current?.closeAddDialog();
      }
    } catch (error) {
      // Optionally show error
    }
    setAdding(false);
  }, [newProduct, isNumericId, pendingNewProductImages, fetchProducts, lastSelectedCategory]);

  const handleOpenAddDialog = useCallback(() => {
    productDialogRef.current?.openAddDialog();
  }, []);

  const handleEdit = useCallback(() => {
    enterEditMode();
  }, [enterEditMode]);

  const handleCancelEdit = useCallback(() => {
    exitEditMode();
    setEditedData(data);
  }, [exitEditMode, data, setEditedData]);

  const handleOpenImageDialog = useCallback(async (productId, edit = false) => {
    const id = productId != null ? String(productId) : null;
    setImageDialogProductId(id);
    setImageDialogEditMode(edit);
    setImageDialogOpen(true);
    // Reset upload states when opening in edit mode
    if (edit) {
      setPendingImageFiles([]);
      setUploadError("");
      setUploadSuccess(false);
      setImageEditSaveSuccess(false);
    }
    // Only fetch images for view mode
    if (!edit && id && !isNaN(Number(id))) {
      setViewImagesLoading(true);
      setViewImageIds([]);
      try {
        const res = await fetch(API_ENDPOINTS.PRODUCT_IMAGES(id));
        if (res.ok) {
          const ids = await res.json();
          setViewImageIds(ids);
        }
      } catch (e) {
        setViewImageIds([]);
      }
      setViewImagesLoading(false);
    }
  }, []);

  const handleCloseImageDialog = useCallback(() => {
    setImageDialogOpen(false);
    setImageDialogProductId(null);
    setImageDialogEditMode(false);
    setPendingImageFiles([]);
    setUploadError("");
    setUploadSuccess(false);
    setImageEditSaveSuccess(false);
    // Don't refetch on close - only refetch after actual changes (add/edit/delete)
  }, []);

  const handleImageDialogUrlChange = (value, imgIdx) => {
    if (imageDialogProductId == null) return;
    setEditedData(prev => prev.map((row) => {
      if (String(row.id) === imageDialogProductId) {
        const urls = Array.isArray(row.imageUrls) ? [...row.imageUrls] : [];
        urls[imgIdx] = value;
        return { ...row, imageUrls: urls };
      }
      return row;
    }));
  };

  const handleImageDialogAddImage = () => {
    if (imageDialogProductId == null) return;
    setEditedData(prev => prev.map((row) => {
      if (String(row.id) === imageDialogProductId) {
        const urls = Array.isArray(row.imageUrls) ? [...row.imageUrls] : [];
        urls.push('');
        return { ...row, imageUrls: urls };
      }
      return row;
    }));
  };

  // Mark image for deletion (no delete yet)
  const handleImageDialogDeleteImage = async (imgIdx) => {
    if (imageDialogProductId == null) return;
    const product = editedData.find(p => String(p.id) === imageDialogProductId);
    const productId = product?.id;
    const imageId = product?.imageUrls?.[imgIdx];
    
    // Validate inputs
    if (!imageId) {
      setUploadError('Cannot delete: No image ID found.');
      return;
    }
    
    if (!productId || isNaN(Number(productId))) {
      setUploadError('Cannot delete: Invalid product ID.');
      return;
    }
    
    // Check if imageId is a valid number (for backend images)
    if (isNaN(Number(imageId))) {
      // If it's not a number, it might be a URL or empty string - just remove from local state
      const updatedImageUrls = (product.imageUrls || []).filter((id, idx) => idx !== imgIdx);
      setEditedData(prev => prev.map((row) => {
        if (String(row.id) === imageDialogProductId) {
          return { ...row, imageUrls: updatedImageUrls };
        }
        return row;
      }));
      return;
    }
    
    setDeletingImageIdx(imgIdx);
    setUploadError("");
    
    try {
      // Delete the image file from backend
      const deleteResponse = await fetch(API_ENDPOINTS.PRODUCT_IMAGE_DELETE(imageId), {
        method: 'DELETE',
      });
      
      if (deleteResponse.ok) {
        // Image deleted successfully - backend should automatically update the product's image list
        setImageDeleteSuccess(true);
        setUploadSuccess(true);
        
        // Refresh products from backend to get the updated image list
        await fetchProducts();
        
        // Update local state to reflect the deletion immediately
        const updatedImageUrls = (product.imageUrls || []).filter((id, idx) => idx !== imgIdx);
        setEditedData(prev => prev.map((row) => {
          if (String(row.id) === imageDialogProductId) {
            return { ...row, imageUrls: updatedImageUrls };
          }
          return row;
        }));
        
        // Clear success message after a delay
        setTimeout(() => {
          setImageDeleteSuccess(false);
          setUploadSuccess(false);
        }, 2000);
      } else {
        const errorText = await deleteResponse.text();
        setUploadError('Failed to delete image from server.');
      }
    } catch (e) {
      setUploadError('Error deleting image. Please try again.');
    }
    setDeletingImageIdx(null);
  };

  const handleSaveImages = async () => {
    if (imageDialogProductId == null) return;
    const product = editedData.find(p => String(p.id) === imageDialogProductId);
    const productId = product?.id;
    if (!productId || isNaN(Number(productId))) return;
    // Start with current image IDs, remove those marked for deletion
    let imageIds = (product.imageUrls || []).filter((id, idx) => !!id && !isNaN(Number(id)) && !pendingDeleteIndexes.includes(idx));
    // Upload all pending files
    for (const file of pendingImageFiles) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGES(productId), {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const { imageId } = await response.json();
          imageIds.push(imageId);
        }
      } catch (e) {
        // Optionally show error
      }
    }
    setPendingImageFiles([]);
    setPendingDeleteIndexes([]);
    
    // Backend should automatically update the product's image list when images are uploaded/deleted
    // Just refresh the data from backend to ensure UI is in sync
    if (imageIds.length > 0 || pendingImageFiles.length > 0) {
      setImageEditSaveSuccess(true);
      await fetchProducts();
      setEditMode(false);
      setEditField(null);
      setImageDialogEditMode(false);
      setImageDialogOpen(false);
    }
  };

  // In the image dialog, add file upload logic
  // Add image file to pending list (no upload yet)
  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingImageFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleImageFileUpload = async (file, rowIndex) => {
    if (!file || imageDialogProductId == null) return;
    const productId = imageDialogProductId;
    // Only allow upload if productId is a number
    if (!productId || isNaN(Number(productId))) {
      setUploadError("Cannot upload image: Product ID is not a valid number. Please use products created via backend only.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGES(productId), {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const { imageId } = await response.json();
        setEditedData(prev => prev.map((row) => {
          if (String(row.id) === imageDialogProductId) {
            const imageIds = Array.isArray(row.imageUrls) ? [...row.imageUrls] : [];
            imageIds.push(imageId);
            return { ...row, imageUrls: imageIds };
          }
          return row;
        }));
        setUploadSuccess(true);
        setSelectedImageFile(null);
      }
    } catch (error) {
      // Optionally show error
    }
    setUploading(false);
  };

  const handleAddImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAddImageFile(file);
      setAddImageFiles([file]);
    }
    e.target.value = '';
  };

  const handleAddMultipleImageFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAddImageFiles(files);
      setAddImageFile(files[0]); // Keep for backward compatibility
    }
    e.target.value = '';
  };

  const handlePendingImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setPendingNewProductImages(prev => [...prev, ...files]);
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleRemovePendingImage = (index) => {
    setPendingNewProductImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearAllPendingImages = () => {
    setPendingNewProductImages([]);
  };

  const handleAddImageFileUpload = async () => {
    if ((!addImageFile && addImageFiles.length === 0) || !newProductId || isNaN(Number(newProductId))) {
      setAddImageUploadError('Cannot upload image: Product ID is not valid or no image selected.');
      return;
    }
    setAddImageUploading(true);
    setAddImageUploadError('');
    setAddImageUploadSuccess(false);
    
    const filesToUpload = addImageFiles.length > 0 ? addImageFiles : (addImageFile ? [addImageFile] : []);
    
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGES(newProductId), {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const { imageId } = await response.json();
          return imageId;
        }
        return null;
      });
      
      const uploadedImageIds = (await Promise.all(uploadPromises)).filter(id => id !== null);
      
      if (uploadedImageIds.length > 0) {
        setAddProductImages(prev => [...prev, ...uploadedImageIds]);
        setAddImageUploadSuccess(true);
        // Also update the product in table
        setData(prev => prev.map(p => p.id === newProductId ? { ...p, imageUrls: [...(p.imageUrls || []), ...uploadedImageIds] } : p));
        setEditedData(prev => prev.map(p => p.id === newProductId ? { ...p, imageUrls: [...(p.imageUrls || []), ...uploadedImageIds] } : p));
        // State is already updated - no need to refetch
      } else {
        setAddImageUploadError('Failed to upload images.');
      }
      
      setAddImageFile(null);
      setAddImageFiles([]);
    } catch (error) {
      setAddImageUploadError('Image upload failed.');
    }
    setAddImageUploading(false);
  };

  const handleCloseAddDialog = () => {
    // Close dialog immediately for instant UX
    productDialogRef.current?.closeAddDialog();
    
    // Defer cleanup operations to avoid blocking UI
    startTransition(() => {
      setNewProductId(null);
      setAddProductImages([]);
      setAddImageFile(null);
      setAddImageFiles([]);
      setPendingNewProductImages([]);
      setAddImageUploadSuccess(false);
      setAddImageUploadError("");
      // Reset form but keep the last selected category
      setNewProduct({
        category: lastSelectedCategory || '', // Preserve last selected category
        name: { en: '', hi: '', te: '' },
        description: { en: '', hi: '', te: '' },
        price: '',
        imageUrls: ['']
      });
    });
    // Don't refetch on close - already refetched after product creation in confirmAddProduct
  };

  const handleUploadPendingImage = async () => {
    if (imageDialogProductId == null || pendingImageFiles.length === 0) return;
    const product = editedData.find(p => String(p.id) === imageDialogProductId);
    const productId = product?.id;
    if (!productId || isNaN(Number(productId))) return;
    
    setUploading(true);
    let newImageIds = [];
    
    // Upload all pending files
    for (const file of pendingImageFiles) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCT_IMAGES(productId), {
          method: 'POST',
          body: formData,
        });
        if (response.ok) {
          const { imageId } = await response.json();
          newImageIds.push(imageId);
        }
      } catch (e) {
        // Silently handle error
      }
    }
    
    // Update local state with new image IDs immediately for better UX
    const updatedImageIds = [...(product.imageUrls || []).filter(id => !!id && !isNaN(Number(id))), ...newImageIds];
    
    setEditedData(prev => prev.map((row) => {
      if (String(row.id) === imageDialogProductId) {
        return { ...row, imageUrls: updatedImageIds };
      }
      return row;
    }));
    
    // Backend should automatically update the product's image list when images are uploaded
    // Just refresh the data from backend to ensure UI is in sync
    if (newImageIds.length > 0) {
      setUploadSuccess(true);
      setPendingImageFiles([]);
      // Refresh products from backend to get the updated image list
      await fetchProducts();
    } else {
      setUploadError('No images were uploaded successfully.');
    }
    
    setUploading(false);
  };

  const handleRequestDeleteImage = (imgIdx) => {
    setImageToDeleteIdx(imgIdx);
    setDeleteImageDialogOpen(true);
  };
  const handleConfirmDeleteImage = async () => {
    if (imageToDeleteIdx !== null) {
      await handleImageDialogDeleteImage(imageToDeleteIdx);
    }
    setDeleteImageDialogOpen(false);
    setImageToDeleteIdx(null);
  };
  const handleCancelDeleteImage = () => {
    setDeleteImageDialogOpen(false);
    setImageToDeleteIdx(null);
  };

  // Helper to get all dates in range (copied from PriceAnalytics)
  const getDateRange = (days) => {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };
  // Build chart data with filled missing days (copied from PriceAnalytics)
  const buildContinuousChartData = (history, days = 10) => {
    if (!history.length) return [];
    const dateRange = getDateRange(days);
    const priceMap = {};
    history.forEach(entry => { priceMap[entry.date] = entry.price; });
    let lastPrice = history[0].price;
    return dateRange.map(date => {
      if (priceMap[date] !== undefined) {
        lastPrice = priceMap[date];
      }
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: lastPrice
      };
    });
  };

  // Helper to get image URL from backend
  const getProductImageUrl = (imageId) => imageId ? API_ENDPOINTS.PRODUCT_IMAGE(imageId) : '';

  // Create table columns - stable except when language changes
  const columns = useMemo(
    () => createTableColumns({
      editMode,
      editField,
      editedData,
      i18nLanguage: i18n.language,
      priceHistories,
      saving,
      handleEditProduct,
      handlePriceChange,
      priceRefs,
      priceFieldTouched,
      handleOpenImageDialog,
      setRowToDelete,
      setDeleteDialogOpen,
      navigate,
      getDateRange,
    }),
    [i18n.language, priceHistories, handleEditProduct, handlePriceChange, handleOpenImageDialog, navigate]
  );

  // Cancel button style reference
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
  // Save button style reference (from AddGreetingDialog)
  const saveButtonSx = useMemo(() => ({
    fontWeight: 700,
    borderRadius: 1,
    px: 2.5,
    py: 1.2,
    fontSize: 15,
    minWidth: 100,
    minHeight: 36,
    transition: 'all 0.2s',
    boxShadow: 2,
    '&:hover': {
      backgroundColor: 'primary.dark',
      transform: 'scale(1.05)',
      boxShadow: 3,
    },
  }), []);

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={50} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <ActionButtons
        editMode={editMode}
        editField={editField}
        saving={saving}
        rowSelection={rowSelection}
        onAddProduct={handleOpenAddDialog}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onSave={() => setConfirmSaveOpen(true)}
        onDisableSelected={handleDisableSelectedProducts}
        onEnableSelected={handleEnableSelectedProducts}
        onDeleteSelected={handleDeleteSelectedProducts}
        t={t}
      />

      <ProductTable
        columns={columns}
        tableData={tableData}
        i18nLanguage={i18n.language}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        onSave={() => setConfirmSaveOpen(true)}
        onCancelEdit={handleCancelEdit}
      />
      
      {/* Product Dialog Manager - Separate component for instant opening (like GreetingManager) */}
      <ProductDialogManager
        ref={productDialogRef}
        onCloseAddDialog={handleCloseAddDialog}
        newProduct={newProduct}
        onFieldChange={handleAddProductFieldChange}
        onAddProduct={handleAddProduct}
        adding={adding}
        categories={categories}
        categoriesLoading={categoriesLoading}
        translating={translating}
        onTranslate={handleTranslateAddProduct}
        newProductId={newProductId}
        pendingNewProductImages={pendingNewProductImages}
        onPendingImageSelect={handlePendingImageSelect}
        onRemovePendingImage={handleRemovePendingImage}
        onClearAllPendingImages={handleClearAllPendingImages}
        addImageFiles={addImageFiles}
        addImageFile={addImageFile}
        onAddImageFileChange={handleAddImageFileChange}
        onAddMultipleImageFiles={handleAddMultipleImageFiles}
        onAddImageFileUpload={handleAddImageFileUpload}
        addImageUploading={addImageUploading}
        addImageUploadError={addImageUploadError}
        addImageUploadSuccess={addImageUploadSuccess}
        addProductImages={addProductImages}
        getProductImageUrl={getProductImageUrl}
      />
      
      {/* Edit Product Dialog - Only render when open for instant performance */}
      {editProductDialogOpen && (
        <Suspense fallback={<CircularProgress />}>
          <EditProductDialog
            open={editProductDialogOpen}
            onClose={handleCloseEditProductDialog}
            editProductForm={editProductForm}
            onFieldChange={handleEditProductFieldChange}
            onUpdateProduct={handleUpdateProduct}
            onTranslate={handleTranslateEditProduct}
            updatingProduct={updatingProduct}
            categories={categories}
            categoriesLoading={categoriesLoading}
            translating={translating}
          />
        </Suspense>
      )}
      
      {/* Image Dialog - Only render when open for instant performance */}
      {imageDialogOpen && (
        <Suspense fallback={<CircularProgress />}>
          <ProductImageDialog
            open={imageDialogOpen}
            onClose={handleCloseImageDialog}
            editMode={imageDialogEditMode}
            imageUrls={imageDialogProductId != null ? (editedData.find(p => String(p.id) === imageDialogProductId)?.imageUrls ?? []) : []}
            viewImageIds={viewImageIds}
            viewImagesLoading={viewImagesLoading}
            pendingImageFiles={pendingImageFiles}
            uploading={uploading}
            uploadSuccess={uploadSuccess}
            uploadError={uploadError}
            imageDeleteSuccess={imageDeleteSuccess}
            deletingImageIdx={deletingImageIdx}
            getProductImageUrl={getProductImageUrl}
            onImageFileChange={handleImageFileChange}
            onUploadPendingImage={handleUploadPendingImage}
            onDeleteImage={handleImageDialogDeleteImage}
            onFullscreenClick={setFullscreenImage}
          />
        </Suspense>
      )}
      
      {/* Fullscreen Image Dialog */}
      <FullscreenImageDialog
        open={!!fullscreenImage}
        imageUrl={fullscreenImage}
        onClose={() => setFullscreenImage(null)}
      />
      
      {/* Translation Success Snackbar */}
      <TranslationSuccessSnackbar
        open={translationSuccess}
        onClose={() => setTranslationSuccess(false)}
      />
      
      {/* All Confirmation Dialogs */}
      <ConfirmationDialogs
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        handleDeleteProduct={handleDeleteProduct}
        rowToDelete={rowToDelete}
        confirmDeleteSelectedOpen={confirmDeleteSelectedOpen}
        setConfirmDeleteSelectedOpen={setConfirmDeleteSelectedOpen}
        confirmDeleteSelectedProducts={confirmDeleteSelectedProducts}
        confirmDisableOpen={confirmDisableOpen}
        setConfirmDisableOpen={setConfirmDisableOpen}
        confirmDisableSelectedProducts={confirmDisableSelectedProducts}
        confirmEnableOpen={confirmEnableOpen}
        setConfirmEnableOpen={setConfirmEnableOpen}
        confirmEnableSelectedProducts={confirmEnableSelectedProducts}
        confirmSaveOpen={confirmSaveOpen}
        setConfirmSaveOpen={setConfirmSaveOpen}
        handleSave={handleSave}
        confirmAddProductOpen={confirmAddProductOpen}
        setConfirmAddProductOpen={setConfirmAddProductOpen}
        confirmAddProduct={confirmAddProduct}
        confirmUpdateProductOpen={confirmUpdateProductOpen}
        setConfirmUpdateProductOpen={setConfirmUpdateProductOpen}
        confirmUpdateProduct={confirmUpdateProduct}
        rowSelection={rowSelection}
      />

    </Box>
  );
}

// Wrap with EditProvider
function TableView() {
  return (
    <EditProvider>
      <TableViewContent />
    </EditProvider>
  );
}

export default TableView;
