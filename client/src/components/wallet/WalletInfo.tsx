import React from 'react';
import { Wallet, Copy, CheckCircle } from 'lucide-react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import Card from '@components/ui/Card';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';

const WalletInfo: React.FC = () => {
  const { primaryWallet, user } = useDynamicContext();
  const [copied, setCopied] = React.useState(false);

  const walletAddress = primaryWallet?.address;
  const walletChain = primaryWallet?.connector?.name;

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card variant="elevated" className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xs sm:text-sm text-slate-600 font-medium uppercase tracking-wide mb-1.5">
              Connected Wallet
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-base sm:text-lg font-mono font-semibold text-slate-800 break-all sm:break-normal">
                {walletAddress ? formatAddress(walletAddress) : 'Not connected'}
              </code>
              {walletAddress && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopy}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
            {walletChain && (
              <p className="text-xs text-slate-500 mt-1.5 truncate">
                {walletChain} • {user?.email}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-lg border border-green-200 self-start sm:self-auto">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm text-green-700 font-medium">Connected</span>
        </div>
      </div>
    </Card>
  );
};

export default WalletInfo;