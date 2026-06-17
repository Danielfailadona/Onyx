import { createContext, useContext, useState, type ReactNode } from 'react';

interface PanelContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const PanelContext = createContext<PanelContextValue | null>(null);

export function PanelProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <PanelContext.Provider value={{ open, setOpen }}>
      {children}
    </PanelContext.Provider>
  );
}

export function usePanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) throw new Error('usePanel must be used within a PanelProvider');
  return ctx;
}
