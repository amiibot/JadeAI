'use client';

import { createContext, useContext } from 'react';

interface RuntimeConfig {
  authEnabled: true;
}

const RuntimeConfigContext = createContext<RuntimeConfig>({ authEnabled: true });

export function RuntimeConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RuntimeConfigContext.Provider value={{ authEnabled: true }}>
      {children}
    </RuntimeConfigContext.Provider>
  );
}

export function useRuntimeConfig() {
  return useContext(RuntimeConfigContext);
}
