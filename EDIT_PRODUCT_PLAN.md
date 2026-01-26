# Edit Product Name & Description - Implementation Plan

## Overview
Add functionality to edit product name and description with auto-translation (similar to create product flow).

---

## 📋 FRONTEND PLAN

### 1. **Add Edit Product Dialog State**
- Add state for edit product dialog: `editProductDialogOpen`
- Add state for product being edited: `editingProduct`
- Add state for edit form data: `editProductForm`

### 2. **Create Edit Product Dialog Component**
Similar to "Add Product" dialog but for editing:
- Fields:
  - Category (TextField)
  - Name (EN, HI, TE) - 3 TextFields
  - Description (EN, HI, TE) - 3 TextFields (multiline)
  - Price (TextField, number)
- Auto-translation:
  - When English name changes → auto-translate to Hindi & Telugu
  - When English description changes → auto-translate to Hindi & Telugu
  - Show loading indicator while translating
  - Show success message when translation completes

### 3. **Add Edit Button in Table**
- Add "Edit" button/icon in the Actions column (or in the row)
- On click: Open edit dialog with current product data pre-filled

### 4. **Edit Product Handler Function**
```javascript
const handleEditProduct = (product) => {
  setEditingProduct(product);
  setEditProductForm({
    category: product.category || '',
    name: {
      en: product.name?.en || product.name || '',
      hi: product.name?.hi || '',
      te: product.name?.te || ''
    },
    description: {
      en: product.description?.en || product.description || '',
      hi: product.description?.hi || '',
      te: product.description?.te || ''
    },
    price: product.price || ''
  });
  setEditProductDialogOpen(true);
};
```

### 5. **Update Product Handler Function**
```javascript
const handleUpdateProduct = async () => {
  setSaving(true);
  try {
    const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${editingProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: editProductForm.category,
        name: editProductForm.name,
        description: editProductForm.description,
        price: parseFloat(editProductForm.price)
      })
    });
    if (!response.ok) throw new Error('Failed to update product');
    await fetchProducts(); // Refresh data
    setEditProductDialogOpen(false);
    setEditingProduct(null);
  } catch (error) {
    console.error('Error updating product:', error);
  }
  setSaving(false);
};
```

### 6. **Reuse Translation Logic**
- Reuse existing `translateText()` function
- Reuse existing `handleAddProductFieldChange()` logic for edit form
- Create similar handler: `handleEditProductFieldChange()`

### 7. **Add API Endpoint to Config**
```javascript
// In config.js
PRODUCT_UPDATE: (productId) => `${BACKEND_BASE_URL}/api/products/${productId}`,
```

---

## 🔧 BACKEND PLAN

### Option 1: Use Existing PUT Endpoint (Recommended)
If backend already has: `PUT /api/products/{id}`

**Request Body:**
```json
{
  "category": "string",
  "name": {
    "en": "string",
    "hi": "string",
    "te": "string"
  },
  "description": {
    "en": "string",
    "hi": "string",
    "te": "string"
  },
  "price": 0.0
}
```

**Response:**
```json
{
  "id": 1,
  "category": "string",
  "name": {
    "en": "string",
    "hi": "string",
    "te": "string"
  },
  "description": {
    "en": "string",
    "hi": "string",
    "te": "string"
  },
  "price": 0.0,
  "imageIds": []
}
```

### Option 2: Create New Endpoint
If PUT endpoint doesn't exist, create:

**Endpoint:** `PUT /api/products/{id}`

**Controller Method:**
```java
@PutMapping("/{id}")
public ResponseEntity<Product> updateProduct(
    @PathVariable Long id,
    @RequestBody ProductUpdateRequest request
) {
    Product updated = productService.updateProduct(id, request);
    return ResponseEntity.ok(updated);
}
```

**Service Method:**
```java
public Product updateProduct(Long id, ProductUpdateRequest request) {
    Product product = productRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
    
    product.setCategory(request.getCategory());
    product.setName(request.getName());
    product.setDescription(request.getDescription());
    product.setPrice(request.getPrice());
    
    return productRepository.save(product);
}
```

**Request DTO:**
```java
public class ProductUpdateRequest {
    private String category;
    private MultilingualText name;
    private MultilingualText description;
    private Double price;
    
    // Getters and setters
}
```

### Backend Implementation Steps:

1. **Check if PUT endpoint exists:**
   - Check `ProductController.java` for `@PutMapping("/{id}")`
   - If exists, verify it accepts name, description, category, price

2. **If endpoint doesn't exist:**
   - Add `@PutMapping("/{id}")` method in `ProductController`
   - Create `ProductUpdateRequest` DTO
   - Add `updateProduct()` method in `ProductService`
   - Handle validation (ensure product exists, validate fields)

3. **Database Update:**
   - Ensure `Product` entity supports updating name, description, category
   - No schema changes needed if using existing fields

4. **Validation:**
   - Validate product ID exists
   - Validate required fields (name.en, price)
   - Validate price is positive number

---

## 📝 IMPLEMENTATION CHECKLIST

### Frontend:
- [ ] Add state variables for edit dialog
- [ ] Create edit product dialog UI (similar to add dialog)
- [ ] Add edit button in table row
- [ ] Implement `handleEditProduct()` function
- [ ] Implement `handleUpdateProduct()` function
- [ ] Implement `handleEditProductFieldChange()` with auto-translation
- [ ] Add API endpoint to config.js
- [ ] Test auto-translation for name and description
- [ ] Test update product functionality

### Backend:
- [ ] Check if PUT `/api/products/{id}` exists
- [ ] If not, create PUT endpoint
- [ ] Create ProductUpdateRequest DTO (if needed)
- [ ] Add updateProduct service method
- [ ] Add validation
- [ ] Test endpoint with Postman/curl
- [ ] Verify database updates correctly

---

## 🎯 API ENDPOINT DETAILS

### Request:
```
PUT /api/products/{id}
Content-Type: application/json

{
  "category": "Dry Fruits",
  "name": {
    "en": "Almonds",
    "hi": "बादाम",
    "te": "బాదం"
  },
  "description": {
    "en": "Premium quality almonds",
    "hi": "प्रीमियम गुणवत्ता बादाम",
    "te": "ప్రీమియం నాణ్యత బాదం"
  },
  "price": 500.0
}
```

### Response:
```
200 OK
{
  "id": 1,
  "category": "Dry Fruits",
  "name": { ... },
  "description": { ... },
  "price": 500.0,
  "imageIds": [1, 2, 3]
}
```

---

## ✅ YES, WE CAN USE EXISTING EDIT API

If your backend already has:
- `PUT /api/products/{id}` - Use this for full product update
- `PUT /api/products/{id}/price` - Already exists (for price only)

**Recommendation:** Use `PUT /api/products/{id}` for updating name, description, category, and price together.

---

## 🚀 NEXT STEPS

1. **First, verify backend:**
   - Check if `PUT /api/products/{id}` exists
   - Test with Postman to see what it accepts

2. **Then implement frontend:**
   - Start with dialog UI
   - Add edit button
   - Connect to backend API

3. **Test end-to-end:**
   - Edit product name/description
   - Verify auto-translation works
   - Verify backend updates correctly

