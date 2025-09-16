'use client';

import Modal from './Modal';

export default function InfoModal({
  isOpen,
  onClose,
  title = "Information",
  message,
  buttonText = "OK",
  children
}) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title}
      showCloseButton={false}
      className="max-w-md"
    >
      <div className="space-y-6">
        {/* Message */}
        {message && (
          <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
            {message}
          </div>
        )}
        
        {/* Custom content */}
        {children}
        
        {/* Action */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-white text-black hover:bg-gray-200 px-8 py-3 text-sm uppercase tracking-wide transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}