import React from 'react';
import { Toaster } from 'react-hot-toast';
import { DynamicProvider } from '@contexts/DynamicContext';
import { SignatureProvider } from '@contexts/SignatureContext';
import { useDynamicAuth } from '@hooks/useDynamicAuth';
import LandingPage from '@pages/LandingPage';
import Dashboard from '@pages/Dashboard';
import Loading from '@components/ui/Loading';
import './App.css';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useDynamicAuth();

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  return isAuthenticated ? <Dashboard /> : <LandingPage />;
};

const App: React.FC = () => {
  return (
    <DynamicProvider>
      <SignatureProvider>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1e293b',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </SignatureProvider>
    </DynamicProvider>
  );
};

export default App;
