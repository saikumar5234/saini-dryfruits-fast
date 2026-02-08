import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useEditContext } from '../contexts/EditContext';

// Price input with local state for instant updates
const PriceInput = ({ initialValue, productId, rowIndex, priceRefs, priceFieldTouched, handlePriceChange, disabled }) => {
  const [localValue, setLocalValue] = useState(initialValue || '');

  // Update local value when parent value changes (e.g., after save or external update)
  React.useEffect(() => {
    setLocalValue(initialValue || '');
  }, [initialValue]);

  return (
    <TextField
      type="number"
      size="small"
      value={localValue}
      disabled={disabled}
      onChange={e => {
        setLocalValue(e.target.value);
      }}
      onBlur={e => {
        // Sync to parent only on blur using productId
        handlePriceChange(e.target.value, productId);
      }}
      onFocus={(e) => {
        const fieldKey = `price_${rowIndex}`;
        e.target.select();
        if (!priceFieldTouched.current[`navigating_${rowIndex}`]) {
          priceFieldTouched.current[fieldKey] = false;
        }
        priceFieldTouched.current[`navigating_${rowIndex}`] = false;
      }}
      sx={{ width: 100 }}
      inputProps={{ min: 0 }}
      inputRef={el => priceRefs.current[rowIndex] = el}
      onKeyDown={e => {
        const fieldKey = `price_${rowIndex}`;
        
        if (e.key === 'ArrowDown' && priceRefs.current[rowIndex + 1]) {
          e.preventDefault();
          e.stopPropagation();
          // Sync current value before moving using productId
          handlePriceChange(localValue, productId);
          priceFieldTouched.current[`navigating_${rowIndex + 1}`] = true;
          priceRefs.current[rowIndex + 1].focus();
          setTimeout(() => {
            if (priceRefs.current[rowIndex + 1]) {
              priceRefs.current[rowIndex + 1].select();
            }
          }, 0);
        } else if (e.key === 'ArrowUp' && priceRefs.current[rowIndex - 1]) {
          e.preventDefault();
          e.stopPropagation();
          // Sync current value before moving using productId
          handlePriceChange(localValue, productId);
          priceFieldTouched.current[`navigating_${rowIndex - 1}`] = true;
          priceRefs.current[rowIndex - 1].focus();
          setTimeout(() => {
            if (priceRefs.current[rowIndex - 1]) {
              priceRefs.current[rowIndex - 1].select();
            }
          }, 0);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.stopPropagation();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          // Sync current value before moving using productId
          handlePriceChange(localValue, productId);
          if (priceRefs.current[rowIndex + 1]) {
            priceFieldTouched.current[`navigating_${rowIndex + 1}`] = false;
            priceRefs.current[rowIndex + 1].focus();
            setTimeout(() => {
              if (priceRefs.current[rowIndex + 1]) {
                priceRefs.current[rowIndex + 1].select();
              }
            }, 0);
          }
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /[0-9.]/.test(e.key)) {
          if (!priceFieldTouched.current[fieldKey]) {
            priceFieldTouched.current[fieldKey] = true;
            const currentValue = localValue;
            if (currentValue && e.target.selectionStart === 0 && e.target.selectionEnd === currentValue.toString().length) {
              e.preventDefault();
              setLocalValue(e.key);
              setTimeout(() => {
                if (priceRefs.current[rowIndex]) {
                  const input = priceRefs.current[rowIndex];
                  input.setSelectionRange(1, 1);
                }
              }, 0);
            }
          }
        }
      }}
    />
  );
};

// Wrapper component that reads editMode from context for instant updates
const PriceCell = ({ cell, row, priceRefs, priceFieldTouched, handlePriceChange }) => {
  const { editMode, editField } = useEditContext();
  const isEditable = editMode && (editField === 'price' || editField === 'both');
  
  return (
    <>
      {/* Display value - hide when editable */}
      {!isEditable && <span>{cell.getValue()}</span>}
      
      {/* Input field - always mounted but hidden when not editable */}
      <div style={{ display: isEditable ? 'block' : 'none' }}>
        <PriceInput
          initialValue={row.original.price}
          productId={row.original.id}
          rowIndex={row.index}
          priceRefs={priceRefs}
          priceFieldTouched={priceFieldTouched}
          handlePriceChange={handlePriceChange}
          disabled={!isEditable}
        />
      </div>
    </>
  );
};

export const createTableColumns = ({
  editMode,
  editField,
  editedData,
  i18nLanguage,
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
}) => {
  return [
    {
      header: 'S. No.',
      id: 'serial',
      size: 60,
      Cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'isDisabled',
      header: 'Status',
      size: 90,
      Cell: ({ row }) => {
        const disabled = !!row.original?.isDisabled;
        return (
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: disabled ? 'error.main' : 'success.main' }}
          >
            {disabled ? 'Disabled' : 'Active'}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Product Name',
      filterFn: (row, columnId, filterValue) => {
        const product = row.original;
        const searchValue = String(filterValue || '').toLowerCase();
        if (!searchValue) return true;
        
        if (product.name) {
          if (typeof product.name === 'object') {
            const nameValues = Object.values(product.name).map(v => String(v || '').toLowerCase());
            return nameValues.some(v => v.includes(searchValue));
          } else {
            return String(product.name).toLowerCase().includes(searchValue);
          }
        }
        return false;
      },
      Cell: ({ cell, row }) => {
        const value = cell.getValue();
        const displayValue = typeof value === 'object' && value !== null
          ? value[i18nLanguage] || value.en || Object.values(value)[0] || ''
          : value;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ flex: 1 }}>
              {displayValue}
            </Typography>
            <Tooltip title="Edit Name">
              <span>
                <Button
                  color="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProduct(row.original);
                  }}
                  disabled={saving || row.original?.isDisabled}
                  sx={{ minWidth: 32, minHeight: 32, p: 0.5 }}
                >
                  <EditIcon fontSize="small" />
                </Button>
              </span>
            </Tooltip>
          </Box>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Description',
      filterFn: (row, columnId, filterValue) => {
        const product = row.original;
        const searchValue = String(filterValue || '').toLowerCase();
        if (!searchValue) return true;
        
        if (product.description) {
          if (typeof product.description === 'object') {
            const descValues = Object.values(product.description).map(v => String(v || '').toLowerCase());
            return descValues.some(v => v.includes(searchValue));
          } else {
            return String(product.description).toLowerCase().includes(searchValue);
          }
        }
        return false;
      },
      Cell: ({ cell }) => {
        const value = cell.getValue();
        if (typeof value === 'object' && value !== null) {
          return value[i18nLanguage] || value.en || Object.values(value)[0] || '';
        }
        return value;
      },
    },
    {
      accessorKey: 'imageUrls',
      header: 'Images',
      Cell: ({ cell, row }) => {
        if (!editMode) {
          return (
            <Tooltip title="View Images">
              <Button
                variant="outlined"
                size="small"
                sx={{ minWidth: 0, p: 1, borderRadius: 2, gap: 1 }}
                onClick={() => handleOpenImageDialog(row.original.id, false)}
                startIcon={<VisibilityIcon fontSize="small" />}
              >
                View Images
              </Button>
            </Tooltip>
          );
        }
        return (
          <Tooltip title="Edit Images">
            <Button
              variant="outlined"
              size="small"
              color="info"
              sx={{ minWidth: 0, p: 1, borderRadius: 2, gap: 1 }}
              onClick={() => handleOpenImageDialog(row.original.id, true)}
              startIcon={<EditIcon fontSize="small" />}
            >
              Edit Images
            </Button>
          </Tooltip>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'price',
      header: 'Price (₹)',
      Cell: ({ cell, row }) => (
        <PriceCell
          cell={cell}
          row={row}
          priceRefs={priceRefs}
          priceFieldTouched={priceFieldTouched}
          handlePriceChange={handlePriceChange}
        />
      ),
    },
    {
      id: 'graph',
      header: 'Graph',
      size: 120,
      Cell: ({ row }) => {
        const id = row.original.id;
        let history = priceHistories[id] || [];
        if (!history.length) {
          const dateRange = getDateRange(10);
          history = dateRange.map(date => ({ date, price: row.original.price }));
        }
        let data = [...history];
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        if (data.length === 0 || data[data.length - 1].date !== todayStr) {
          data.push({ date: todayStr, price: row.original.price });
        }
        data = data.slice(-10).map(d => ({
          ...d,
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
        let color = '#2E7D32';
        if (data.length > 1) {
          const prev = data[data.length - 2].price;
          const curr = data[data.length - 1].price;
          if (curr < prev) color = '#D32F2F';
        }
        return (
          <Box
            sx={{ width: 100, height: 40, cursor: 'pointer' }}
            onClick={() => {
              navigate(`/analytics/${id}`);
              setTimeout(() => {
                window.dispatchEvent(new Event('focus'));
              }, 100);
            }}
            title="View analytics for this product"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <Area type="monotone" dataKey="price" stroke={color} fill={color + '33'} strokeWidth={2} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      size: 120,
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Delete Product">
            <span>
              <Button
                color="error"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setRowToDelete(row.original);
                  setDeleteDialogOpen(true);
                }}
                disabled={saving}
                sx={{ minWidth: 40, minHeight: 40 }}
              >
                <DeleteForeverIcon fontSize="small" />
              </Button>
            </span>
          </Tooltip>
        </Box>
      ),
    },
  ];
};
