import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

const EditContext = createContext(null);

export const EditProvider = ({ children }) => {
  const [editMode, setEditMode] = useState(false);
  const [editField, setEditField] = useState(null);
  const [saving, setSaving] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  
  const priceRefs = useRef([]);
  const priceFieldTouched = useRef({});

  const enterEditMode = useCallback(() => {
    setEditMode(true);
    setEditField('both');
    setRowSelection({});
  }, []);

  const exitEditMode = useCallback(() => {
    setEditMode(false);
    setEditField(null);
    setRowSelection({});
  }, []);

  const value = {
    editMode,
    editField,
    saving,
    setSaving,
    rowSelection,
    setRowSelection,
    priceRefs,
    priceFieldTouched,
    enterEditMode,
    exitEditMode,
    setEditMode,
    setEditField,
  };

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
};

export const useEditContext = () => {
  const context = useContext(EditContext);
  if (!context) {
    throw new Error('useEditContext must be used within EditProvider');
  }
  return context;
};
