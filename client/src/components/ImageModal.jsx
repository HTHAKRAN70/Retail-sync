import React from 'react';
import { createPortal } from 'react-dom';

const ImageModal = ({ image, onClose,descritpion }) => {
    return createPortal(
        <div className="fixed  inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-s-md">
                <img
                    src={image}
                    alt="Zoomed Product"
                    className="max-w-full max-h-screen"
                />
                <button onClick={onClose} className="mt-2 bg-red-500 text-white px-4 py-2 rounded">
                    Close
                </button>
            </div>
            
        </div>,
        document.body
    );
};

export default ImageModal;
