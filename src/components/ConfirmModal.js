'use client';

import Modal from './Modal';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "primary", // primary, danger
  children
}) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getConfirmButtonClass = () => {
    if (confirmStyle === 'danger') {
      return "bg-white text-black hover:bg-gray-200";
    }
    return "bg-white text-black hover:bg-gray-200";
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      showCloseButton={false}
      className="max-w-sm"
    >
      <div className="space-y-6">
        {/* Message */}
        {message && (
          <p className="text-gray-300 text-sm leading-relaxed">
            {message}
          </p>
        )}
        
        {/* Custom content */}
        {children}
        
        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-600 text-gray-300 hover:border-white hover:text-white py-3 text-sm uppercase tracking-wide transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 py-3 text-sm uppercase tracking-wide transition-colors ${getConfirmButtonClass()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}