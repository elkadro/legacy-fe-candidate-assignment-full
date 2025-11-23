import React, { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';
import { useMfa, useIsLoggedIn } from '@dynamic-labs/sdk-react-core';
import { MFADevice } from '@dynamic-labs/sdk-api-core';
import Button from '@components/ui/Button';

interface MFAStatusProps {
  onEnableMFA: () => void;
}

const MFAStatus: React.FC<MFAStatusProps> = ({ onEnableMFA }) => {
  const [userDevices, setUserDevices] = useState<MFADevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isLogged = useIsLoggedIn();
  const { getUserDevices } = useMfa();

  useEffect(() => {
    if (isLogged) {
      refreshUserDevices();
    }
  }, [isLogged]);

  const refreshUserDevices = async () => {
    try {
      setIsLoading(true);
      const devices = await getUserDevices();
      setUserDevices(devices);
    } catch (error) {
      console.error('Failed to get MFA devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasMFA = userDevices.length > 0;

  if (isLoading) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {hasMFA ? (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <Check className="w-4 h-4" />
          <span>MFA Enabled</span>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={onEnableMFA}>
          <Shield className="w-4 h-4 mr-2" />
          Enable MFA
        </Button>
      )}
    </div>
  );
};

export default MFAStatus;