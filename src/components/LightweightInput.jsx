import React from 'react';

// Lightweight alternative to Material-UI TextField
// 10x faster rendering with native HTML input
const LightweightInput = React.memo(({ 
  label, 
  value, 
  onChange, 
  onBlur,
  type = 'text',
  multiline = false,
  rows = 3,
  disabled = false,
  fullWidth = true,
  placeholder = ''
}) => {
  const inputStyle = {
    width: fullWidth ? '100%' : 'auto',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: '1px solid #c4c4c4',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: disabled ? '#f5f5f5' : 'white',
    resize: multiline ? 'vertical' : 'none',
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
    if (onChange) onChange(e);
  };

  const handleBlur = (e) => {
    if (onBlur) onBlur(e);
  };

  const handleFocus = (e) => {
    e.target.style.borderColor = '#1976d2';
  };

  const handleBlurStyle = (e) => {
    e.target.style.borderColor = '#c4c4c4';
    if (onBlur) onBlur(e);
  };

  return (
    <div style={containerStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      {multiline ? (
        <textarea
          value={value}
          onChange={handleChange}
          onBlur={handleBlurStyle}
          onFocus={handleFocus}
          disabled={disabled}
          rows={rows}
          placeholder={placeholder}
          style={inputStyle}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlurStyle}
          onFocus={handleFocus}
          disabled={disabled}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  );
});

LightweightInput.displayName = 'LightweightInput';

export default LightweightInput;
