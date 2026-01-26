import React, { useState, useEffect } from 'react';
import { API_ENDPOINTS } from './config.js';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Fade,
  Grow
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import Confetti from 'react-confetti';

const UpdateProductPrice = ({ open, onClose }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successProductName, setSuccessProductName] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.PRODUCTS);
        if (!response.ok) throw new Error('Failed to fetch products');
        const productsData = await response.json();
        setProducts(productsData);
      } catch (error) {
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (!selectedProduct || !price || !date) {
        setError('All fields are required.');
        setLoading(false);
        return;
      }
      // Update product price using backend API
      const dateString = date instanceof Date ? format(date, 'yyyy-MM-dd') : date;
      const response = await fetch(API_ENDPOINTS.PRODUCT_PRICE(selectedProduct), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(price), date: dateString }),
      });
      if (!response.ok) throw new Error('Failed to update price');
      const updatedProduct = products.find(p => p.id === selectedProduct);
      if (updatedProduct) {
        setSuccessProductName(getLocalized(updatedProduct.name));
        setPrice('');
        setDate(new Date());
        setTimeout(() => {
          setSuccessProductName('');
          onClose();
        }, 2500);
      }
      return;
    } catch (err) {
      setError('Failed to update price.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get localized field
  const getLocalized = (obj) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj['en'] || Object.values(obj)[0] || '';
  };

  // Cancel button style reference
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
  // Save button style reference (from AddGreetingDialog)
  const saveButtonSx = {
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
  };

  return (
    <Fade in={open}>
      <Dialog open={open} onClose={onClose} TransitionComponent={Fade} PaperProps={{ sx: { borderRadius: 4, boxShadow: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: 'primary.main', fontSize: 22 }}>Update Product Price</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="product-label">Product</InputLabel>
              <Select
                labelId="product-label"
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                label="Product"
                required
              >
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id}>
                    {getLocalized(product.name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Price"
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date"
                value={date}
                onChange={setDate}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
              />
            </LocalizationProvider>
            <Grow in={!!error}><div>{error && <Box color="error.main" mt={2}><Fade in={!!error}><div>{error}</div></Fade></Box>}</div></Grow>
            <DialogActions sx={{ mt: 2 }}>
              <Button
                onClick={onClose}
                color="inherit"
                variant="outlined"
                sx={cancelButtonSx}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="success"
                variant="contained"
                sx={saveButtonSx}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
            </DialogActions>
          </form>
          <AnimatePresence>
            {successProductName && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
              >
                <Box mt={2} mb={2}>
                  <Confetti width={300} height={100} numberOfPieces={100} recycle={false} />
                  <Box fontWeight={600} color="success.main" fontSize={18} textAlign="center">
                    Price updated for {successProductName}!
                  </Box>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </Fade>
  );
};

export default UpdateProductPrice; 