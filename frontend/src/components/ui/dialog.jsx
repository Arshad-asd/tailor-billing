import React, { useState, useContext, createContext, cloneElement } from 'react';

const DialogContext = createContext();

export function Dialog({ open, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open !== undefined ? open : internalOpen;

  const setOpen = (val) => {
    setInternalOpen(val);
    if (onOpenChange) onOpenChange(val);
  };

  return (
    <DialogContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ asChild, children }) {
  const { setOpen } = useContext(DialogContext);
  if (asChild && React.isValidElement(children)) {
    return cloneElement(children, {
      onClick: (e) => {
        if (children.props.onClick) children.props.onClick(e);
        setOpen(true);
      },
    });
  }
  return (
    <button type="button" onClick={() => setOpen(true)}>
      {children}
    </button>
  );
}

export function DialogContent({ children, className }) {
  const { isOpen, setOpen } = useContext(DialogContext);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-label="Close dialog"
      />
      <div
        className={
          'relative z-10 bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full mx-4 ' +
          (className || '')
        }
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className }) {
  return <div className={className + ' border-b px-6 py-4'}>{children}</div>;
}

export function DialogTitle({ children, className }) {
  return <h2 className={className + ' text-lg font-bold'}>{children}</h2>;
}

export function DialogDescription({ children, className }) {
  return <p className={className + ' text-sm text-gray-500 mt-1'}>{children}</p>;
}

export function DialogFooter({ children, className }) {
  return <div className={className + ' flex justify-end gap-2 px-6 py-4 border-t'}>{children}</div>;
} 