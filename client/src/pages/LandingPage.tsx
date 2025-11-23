import React from 'react';
import { Mail, Shield, Sparkles, CheckCircle } from 'lucide-react';
import LoginForm from '@components/auth/LoginForm';
import Card from '@components/ui/Card';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '1280px' }}>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left side - Branding */}
          <div className="text-white space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-2xl">
                <Shield className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                SignVault
              </h1>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Secure Message
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Signing & Verification
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-slate-300 max-w-xl">
              Authenticate with your email, sign messages cryptographically, and verify signatures with Web3 technology.
            </p>

          {/* Features */}
          <div className="space-y-4 pt-6">
            {[
              { icon: Mail, text: 'Email-based authentication' },
              { icon: Shield, text: 'Multi-factor security (MFA)' },
              { icon: Sparkles, text: 'Cryptographic message signing' },
              { icon: CheckCircle, text: 'Instant signature verification' },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-slate-300">
                <feature.icon className="w-5 h-5 text-purple-400" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

          {/* Right side - Login Form */}
          <div className="w-full">
            <Card variant="elevated" className="glass p-6 sm:p-8 lg:p-10 animate-slide-up max-w-md mx-auto md:max-w-none">
              <LoginForm />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;