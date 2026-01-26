import React from 'react';

// Lightweight alternative to Material-UI Select
const LightweightSelect = React.memo(({ 
  label, 
  value, 
  onChange,
  options = [],
  disabled = false,
  fullWidth = true,
  placeholder = 'Select an option'
}) => {
  const selectStyle = {
    width: fullWidth ? '100%' : 'auto',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: '1px solid #c4c4c4',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: disabled ? '#f5f5f5' : 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '13px',
    fontWeight: 500,
    color: '#555',
  };

  const containerStyle = {
    marginBottom: '16px',
  };

  const handleChange = (e) => {
    if (onChange) onChange(e.target.value);
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#1976d2';
  };

  const handleBlur = (e) => {
    e.target.style.borderColor = '#c4c4c4';
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <select
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        style={selectStyle}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => (
          <option 
            key={option.id || option.value || index} 
            value={option.value || option.name || option}
          >
            {option.label || option.name || option}
          </option>
        ))}
      </select>
    </div>
  );
});

LightweightSelect.displayName = 'LightweightSelect';

export default LightweightSelect;
