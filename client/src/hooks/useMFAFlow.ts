import { useState } from 'react';
import { useDynamicContext, useMfa, useSyncMfaFlow } from '@dynamic-labs/sdk-react-core';

export const useMFAFlow = () => {
  const [requiresMFA, setRequiresMFA] = useState(false);
  const { userWithMissingInfo } = useDynamicContext();
  const { getUserDevices, addDevice, authDevice, getRecoveryCodes, completeAcknowledgement } = useMfa();

  useSyncMfaFlow({
    handler: async () => {
      if (userWithMissingInfo?.scope?.includes('requiresAdditionalAuth')) {
        setRequiresMFA(true);
        // The handler doesn't need to return values - state updates are sufficient
        // The component will react to requiresMFA state changes
      } else {
        setRequiresMFA(false);
      }
    },
  });

  return {
    requiresMFA,
    getUserDevices,
    addDevice,
    authDevice,
    getRecoveryCodes,
    completeAcknowledgement,
  };
};