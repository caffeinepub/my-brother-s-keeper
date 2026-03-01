import { createContext, useContext, ReactNode } from 'react';

/**
 * BootstrapAdminContext
 *
 * Kept as a no-op stub so existing imports don't break.
 * Bootstrap admin promotion is no longer needed — the backend's isCallerAdmin()
 * returns true directly for the hardcoded bootstrap principal.
 */
interface BootstrapAdminContextValue {
  isBootstrapPromotionPending: boolean;
  setBootstrapPromotionPending: (pending: boolean) => void;
}

const BootstrapAdminContext = createContext<BootstrapAdminContextValue>({
  isBootstrapPromotionPending: false,
  setBootstrapPromotionPending: () => {},
});

export function BootstrapAdminProvider({ children }: { children: ReactNode }) {
  // No state needed — bootstrap promotion is handled by the backend directly
  return (
    <BootstrapAdminContext.Provider
      value={{
        isBootstrapPromotionPending: false,
        setBootstrapPromotionPending: () => {},
      }}
    >
      {children}
    </BootstrapAdminContext.Provider>
  );
}

export function useBootstrapAdminContext() {
  return useContext(BootstrapAdminContext);
}
