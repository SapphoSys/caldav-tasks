import { createContext, useContext } from 'react';

interface ModalStateContextValue {
  isAnyModalOpen: boolean;
  isContextMenuOpen: boolean;
}

export const ModalStateContext = createContext<ModalStateContextValue | null>(null);

export const useModalState = () => {
  const context = useContext(ModalStateContext);
  return context ?? { isAnyModalOpen: false, isContextMenuOpen: false };
};
