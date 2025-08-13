import React from "react";
import classNames from "classnames";

const Modal = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={classNames(
          "bg-white rounded-lg p-6 max-w-lg w-full",
          className
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-red-500">
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;