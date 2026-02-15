# Backend: Product Reorder Endpoint

Use this spec to implement the product reorder API so web and mobile show the same order.

---

## Endpoint

**PUT** `/api/products/reorder`

---

## Request

**Headers**
- `Content-Type: application/json`

**Body (JSON)**
```json
{
  "productIds": [ 35, 41, 28, 82, 113, 316, 282, 51, 77, 90 ]
}
```

- `productIds`: **required** — Array of product IDs in the **new display order** (first element = first row, etc.).
- IDs can be numbers or strings; backend should accept both.
- Order of the array is the display order. Same order must be used when returning products in **GET /api/products**.

---

## Response

**Success: 200 OK**

Body can be empty or a simple confirmation, for example:
```json
{
  "success": true
}
```

**Error: 4xx / 5xx**
- Return appropriate status and error message (e.g. validation error if `productIds` is missing or invalid).

---

## Backend Behaviour

1. **Validate** `productIds`: present, array, all IDs exist in DB.
2. **Persist order** using one of:
   - **Option A:** Add a `sort_order` (integer) column on `product`. For each index `i`, set `product.sort_order = i` (or `i + 1`) for the product with id `productIds[i]`. Then **GET /api/products** must return products ordered by `sort_order` (e.g. `ORDER BY sort_order ASC, id ASC`).
   - **Option B:** Store an ordered list of product IDs (e.g. in a config/settings table or a dedicated `product_order` table). When returning the list, join/order by this list so the API response order matches.
3. **Transaction:** Update order in a single transaction so partial updates are avoided.
4. **Authorization:** Restrict to admin/authenticated users as with other product APIs.

---

## GET /api/products — Ordering

- **Must** return products in the **same order** as defined by the reorder API (e.g. ordered by `sort_order` or by the stored order list).
- Do **not** rely only on `ORDER BY id` or `ORDER BY created_at` for the default list; use the stored display order so web and mobile see the same sequence after a reorder.

---

## Example (Java/Spring)

```java
// Product entity: add column
private Integer sortOrder; // or int, not null with default

// PUT /api/products/reorder
@PutMapping("/reorder")
public ResponseEntity<?> reorderProducts(@RequestBody Map<String, List<Long>> body) {
    List<Long> productIds = body.get("productIds");
    if (productIds == null || productIds.isEmpty())
        return ResponseEntity.badRequest().build();
    productService.updateSortOrder(productIds);
    return ResponseEntity.ok().build();
}

// In ProductService: update sort_order for each product by index
@Transactional
public void updateSortOrder(List<Long> productIds) {
    for (int i = 0; i < productIds.size(); i++) {
        productRepository.updateSortOrder(productIds.get(i), i);
    }
}

// GET /api/products: order by sort_order
// e.g. ORDER BY sort_order ASC, id ASC
```

---

## Summary

| Item | Value |
|------|--------|
| Method | PUT |
| Path | `/api/products/reorder` |
| Request body | `{ "productIds": [ id1, id2, ... ] }` |
| Success | 200 |
| Side effect | Persist new display order; GET /api/products returns products in this order |
