import React, { useRef } from 'react';
import Header from './Header.jsx';
import DialogsManager from './DialogsManager.jsx';
import GreetingManager from './GreetingManager.jsx';

function MainLayout({ children, user, onLogout }) {
  const greetingManagerRef = useRef();
  const dialogsManagerRef = useRef();

  // Clone children and pass user prop to MainRoutes
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { user });
    }
    return child;
  });

  return (
    <>
      <Header
        user={user}
        onLogout={onLogout}
        onHomeClick={null}
        onUpdatePriceClick={() => dialogsManagerRef.current?.openUpdateDialog()}
        onAddGreetingsClick={() => greetingManagerRef.current?.openGreetingDialog()}
      />
      {childrenWithProps}
      <DialogsManager ref={dialogsManagerRef} />
      <GreetingManager ref={greetingManagerRef} />
    </>
  );
}

export default MainLayout; 