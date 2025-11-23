import React from 'react';
import { DynamicContextProvider, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';

export const DynamicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID,
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      {children}
    </DynamicContextProvider>
  );
};

// Custom hook that wraps useDynamicContext for convenience
export const useDynamic = () => {
  return useDynamicContext();
};

// Re-export useDynamicContext for convenience
export { useDynamicContext } from '@dynamic-labs/sdk-react-core';

