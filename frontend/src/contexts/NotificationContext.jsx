import React, { createContext, useState, useContext } from 'react';
import NotificationModal from '../components/common/NotificationModal';

const NotificationContext = createContext();

const initialState = {
  isOpen: false,
  type: 'alert', // 'alert' ou 'confirm'
  title: '',
  message: '',
  onConfirm: () => {},
};

export function NotificationProvider({ children }) {
  const [modalConfig, setModalConfig] = useState(initialState);

  const showAlert = (message, title = 'Aviso') => {
    setModalConfig({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: () => {},
    });
  };

  const showConfirm = (message, title = 'Confirmação', onConfirmAction) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: onConfirmAction,
    });
  };

  const handleClose = () => {
    setModalConfig(initialState);
  };

  const handleConfirm = () => {
    modalConfig.onConfirm();
    handleClose();
  };

  return (
    <NotificationContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <NotificationModal
        config={modalConfig}
        onConfirm={handleConfirm}
        onClose={handleClose}
      />
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotification() {
  return useContext(NotificationContext);
}