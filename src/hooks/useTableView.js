import { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS, TRANSLATION_CONFIG } from '../config.js';

// Hook for fetching products
export const useProducts = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [editedData, setEditedData] = useState([]);

  const isNumericId = id => !isNaN(Number(id));

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.PRODUCTS);
      if (!response.ok) throw new Error('Failed to fetch products');
      const products = await response.json();
      const adapted = products
        .filter(p => isNumericId(p.id))
        .map(p => {
          const raw = p.disabled ?? p.isDisabled ?? p.is_disabled;
          let isDisabled = false;
          if (raw === true || raw === 'true' || raw === 1 || raw === '1') {
            isDisabled = true;
          }
          
          // Parse name and description if they are JSON strings
          let name = p.name;
          let description = p.description;
          
          try {
            if (typeof p.name === 'string') {
              const trimmedName = p.name.trim();
              if (trimmedName.startsWith('{') || trimmedName.startsWith('[')) {
                name = JSON.parse(trimmedName);
              }
            }
          } catch (e) {
            console.warn('Failed to parse product name for product', p.id, e);
            // If parsing fails, keep original value
          }
          
          try {
            if (typeof p.description === 'string') {
              const trimmedDesc = p.description.trim();
              if (trimmedDesc.startsWith('{') || trimmedDesc.startsWith('[')) {
                description = JSON.parse(trimmedDesc);
              }
            }
          } catch (e) {
            console.warn('Failed to parse product description for product', p.id, e);
            // If parsing fails, keep original value
          }
          
          return {
            ...p,
            name,
            description,
            imageUrls: p.imageIds || [],
            isDisabled,
          };
        });
      setData(adapted);
      setEditedData(adapted);
    } catch (error) {
      setData([]);
      setEditedData([]);
    }
    setLoading(false);
  };

  return { loading, data, setData, editedData, setEditedData, fetchProducts, isNumericId };
};

// Hook for fetching categories
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.CATEGORIES);
      if (response.ok) {
        const data = await response.json();
        const categoriesList = Array.isArray(data) ? data : (data.categories || data.data || []);
        setCategories(categoriesList);
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  return { categories, categoriesLoading, fetchCategories };
};

// Hook for price histories
export const usePriceHistories = (data, editedData, editMode) => {
  const [priceHistories, setPriceHistories] = useState({});

  useEffect(() => {
    const fetchAllPriceHistories = async () => {
      const ids = (editMode ? editedData : data).map(p => p.id).filter(id => !isNaN(Number(id)));
      const histories = {};
      await Promise.all(ids.map(async (id) => {
        try {
          const res = await fetch(API_ENDPOINTS.PRODUCT_PRICE_HISTORY(id));
          if (res.ok) {
            const hist = await res.json();
            histories[id] = hist.map(h => ({
              date: h.changedAt ? h.changedAt.split('T')[0] : '',
              price: h.price
            })).slice(-10);
          }
        } catch {}
      }));
      setPriceHistories(histories);
    };
    fetchAllPriceHistories();
  }, [data, editedData, editMode]);

  return priceHistories;
};

// Hook for translation
export const useTranslation = () => {
  const [translating, setTranslating] = useState(false);
  const [translationSuccess, setTranslationSuccess] = useState(false);

  const translateText = async (text, targetLang) => {
    try {
      const langMap = { 'hi': 'hi', 'te': 'te' };
      const targetLangCode = langMap[targetLang];
      if (!targetLangCode) return '';
      
      const response = await fetch(`${TRANSLATION_CONFIG.MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=en|${targetLangCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.responseStatus === 200) {
          return data.responseData.translatedText;
        }
      }
      return '';
    } catch (error) {
      return '';
    }
  };

  return { translating, setTranslating, translationSuccess, setTranslationSuccess, translateText };
};

// Hook for local storage category
export const useLastSelectedCategory = () => {
  const [lastSelectedCategory, setLastSelectedCategory] = useState(() => {
    try {
      return localStorage.getItem('lastSelectedCategory') || '';
    } catch {
      return '';
    }
  });

  const saveCategory = (category) => {
    setLastSelectedCategory(category);
    try {
      localStorage.setItem('lastSelectedCategory', category);
    } catch (error) {
      console.warn('Failed to save last selected category to localStorage:', error);
    }
  };

  return { lastSelectedCategory, saveCategory };
};

// Helper function for date ranges
export const getDateRange = (days) => {
  const dates = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

// Custom filter function for global search
export const customGlobalFilterFn = (row, columnId, filterValue) => {
  if (!filterValue || String(filterValue).trim() === '') {
    return true;
  }
  
  const searchValue = String(filterValue).toLowerCase().trim();
  const product = row.original;
  
  if (!product) {
    return false;
  }
  
  const searchInMultilingual = (field) => {
    if (!field) return false;
    if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
      const values = Object.values(field)
        .filter(v => v != null && v !== '')
        .map(v => String(v).toLowerCase());
      return values.some(v => v.includes(searchValue));
    } else {
      return String(field).toLowerCase().includes(searchValue);
    }
  };
  
  if (product.name && searchInMultilingual(product.name)) return true;
  if (product.description && searchInMultilingual(product.description)) return true;
  if (product.category && String(product.category).toLowerCase().includes(searchValue)) return true;
  if (product.price != null && String(product.price).includes(searchValue)) return true;
  
  const status = product.isDisabled ? 'disabled' : 'active';
  if (status.includes(searchValue)) return true;
  if (product.id && String(product.id).includes(searchValue)) return true;
  
  return false;
};
