import React, { useState, forwardRef, useImperativeHandle } from 'react';
import UpdateProductPrice from './UpdateProductPrice.jsx';

const DialogsManager = forwardRef((props, ref) => {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);

  useImperativeHandle(ref, () => ({
    openUpdateDialog: () => setShowUpdateDialog(true),
  }));

  return (
    <UpdateProductPrice open={showUpdateDialog} onClose={() => setShowUpdateDialog(false)} />
  );
});

export default DialogsManager; 