import React from 'react';
import './NotificationModal.css';

function NotificationModal({ config, onConfirm, onClose }) {
  if (!config.isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <div className="notification-overlay">
      <div className="notification-modal">
        <div className="notification-header">
          <h3>{config.title}</h3>
        </div>
        <div className="notification-body">
          <p>{config.message}</p>
        </div>
        <div className="notification-footer">
          {config.type === 'confirm' && (
            <button className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
          )}
          <button className="btn btn-primary" onClick={config.type === 'confirm' ? handleConfirm : onClose}>
            {config.type === 'confirm' ? 'Confirmar' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;