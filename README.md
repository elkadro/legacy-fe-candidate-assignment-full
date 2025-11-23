# SignVault - Web3 Message Signer & Verifier

A production-ready full-stack Web3 application that enables secure cryptographic message signing and verification using Dynamic.xyz embedded wallets with headless email authentication and mandatory multi-factor authentication.

## 🚀 Live Demo

- **Frontend**: [https://legacy-fe-candidate-assignment-clie.vercel.app](https://legacy-fe-candidate-assignment-clie.vercel.app) _(Update with your Vercel URL)_
- **Backend API**: [https://legacy-fe-candidate-assignment-swop.onrender.com](https://legacy-fe-candidate-assignment-swop.onrender.com) _(Update with your Render URL)_
- **API Health Check**: [https://legacy-fe-candidate-assignment-swop.onrender.com/health](https://legacy-fe-candidate-assignment-swop.onrender.com/health)
- **API Documentation**: [https://legacy-fe-candidate-assignment-swop.onrender.com/api/docs](https://legacy-fe-candidate-assignment-swop.onrender.com/api/docs)

## 📖 What It Does

SignVault provides a complete Web3 authentication and message signing solution:

1. **Email-Based Authentication**: Users sign in with their email address using Dynamic.xyz's headless embedded wallet system
2. **OTP Verification**: Secure one-time password verification sent to user's email
3. **Mandatory MFA Setup**: Multi-factor authentication is required for all users using TOTP (Google Authenticator, Authy, etc.)
4. **Cryptographic Message Signing**: Users can sign custom messages (up to 500 characters) with their embedded wallet
5. **Backend Verification**: Express.js backend verifies signatures using ethers.js and recovers the signer address
6. **Signature History**: Persistent, per-user signature history stored locally with verification status
7. **Multi-User Support**: Each user's data is isolated by email address, allowing multiple users on the same browser

## 🏗️ Architecture

### Frontend Stack

**Core Technologies:**
- **React 19** with TypeScript for type-safe component development
- **Vite 7** for fast development and optimized production builds
- **Tailwind CSS v4** with custom purple gradient theme and responsive design
- **Dynamic.xyz SDK** for headless wallet integration (no UI widgets)

**State Management:**
- React Context API for global state (`DynamicContext`, `SignatureContext`)
- Custom hooks for authentication (`useDynamicAuth`), message signing (`useMessageSigner`), and MFA (`useMFAFlow`)
- LocalStorage with per-email isolation for multi-user support

**Key Features:**
- Headless authentication flow (email → OTP → wallet creation)
- Loading overlays with blur effects during signup
- Real-time signature verification feedback
- Responsive design with mobile-first approach
- Toast notifications for user feedback

### Backend Stack

**Core Technologies:**
- **Node.js 18+** with Express.js 5
- **TypeScript** with strict type checking
- **ethers.js v6** for signature recovery and verification
- **Winston** for structured logging
- **Prometheus** for metrics collection

**Security & Performance:**
- Rate limiting: 1 request per 5 seconds per IP address
- CORS configuration with credential support
- Input validation using express-validator
- Error handling with structured responses
- Graceful shutdown handling

**API Endpoints:**
- `POST /api/auth/verify-signature` - Verify message signatures
- `POST /api/auth/session` - Create authentication sessions
- `GET /api/auth/session` - Get current session
- `DELETE /api/auth/session` - Destroy session
- `GET /api/metrics` - Prometheus metrics
- `GET /api/docs` - Swagger API documentation

## 🛠️ Building & Development

### Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Dynamic.xyz Account**: Get your Environment ID from [app.dynamic.xyz](https://app.dynamic.xyz)

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>

# Install frontend dependencies
cd client
yarn install

# Install backend dependencies
cd ../server
yarn install
```

### Environment Variables

#### Frontend (`client/.env`)

Create `client/.env` with:

```env
# Dynamic.xyz Environment ID (Required)
# Get from: https://app.dynamic.xyz/ → Settings → API Keys
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id_here

# Backend API URL
# Development: Leave empty (uses Vite proxy)
# Production: Your Render backend URL
VITE_API_BASE_URL=http://localhost:8000
```

#### Backend (`server/.env`)

Create `server/.env` with:

```env
# Node Environment
NODE_ENV=development

# Server Port
PORT=8000

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000
```

### Development Commands

```bash
# Start frontend (http://localhost:3000)
cd client
yarn dev

# Start backend (http://localhost:8000)
cd server
yarn dev

# Build frontend for production
cd client
yarn build

# Build backend for production
cd server
yarn build
```

### Project Structure

```

├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── signer/         # Message signing components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   └── wallet/         # Wallet info display
│   │   ├── contexts/           # React contexts
│   │   │   ├── DynamicContext.tsx
│   │   │   └── SignatureContext.tsx
│   │   ├── hooks/              # Custom hooks
│   │   │   ├── useDynamicAuth.ts
│   │   │   ├── useMessageSigner.ts
│   │   │   └── useMFAFlow.ts
│   │   ├── pages/              # Page components
│   │   │   ├── LandingPage.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── services/           # API & storage services
│   │   │   ├── api.service.ts
│   │   │   └── storage.service.ts
│   │   └── types/              # TypeScript types
│   ├── vite.config.ts
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   └── auth.controller.ts
│   │   ├── middleware/         # Express middleware
│   │   │   ├── rateLimit.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── routes/             # API routes
│   │   │   ├── auth.routes.ts
│   │   │   └── metrics.routes.ts
│   │   ├── utils/              # Utilities
│   │   │   ├── signature.util.ts
│   │   │   ├── logger.ts
│   │   │   └── error.util.ts
│   │   └── types/              # TypeScript types
│   ├── swagger.yaml            # API documentation
│   └── package.json
│
├── vercel.json                  # Vercel deployment config
├── render.yaml                  # Render deployment config
├── DEPLOYMENT.md                # Full deployment guide
└── QUICK_DEPLOY.md              # Quick deployment checklist
```

## 🔐 Key Features

### Headless Authentication Flow

Unlike traditional wallet connectors, SignVault uses Dynamic.xyz's headless SDK for a fully custom authentication experience:

1. **Email Input**: User enters email address
2. **OTP Delivery**: Dynamic sends verification code to email
3. **OTP Verification**: User enters 6-digit code
4. **Wallet Creation**: Embedded wallet is automatically created
5. **MFA Setup**: Mandatory TOTP setup with QR code
6. **Dashboard Access**: Full access to signing features

### Multi-User Support

The application supports multiple users on the same browser:

- **Per-Email Storage**: Each user's signature history is stored separately
- **Email-Based Keys**: Storage keys include email address (e.g., `signature_history_user@example.com`)
- **Automatic Isolation**: Switching users automatically loads their respective data
- **Logout Cleanup**: Only current user's data is cleared on logout

### Security Features

- **Rate Limiting**: 1 request per 5 seconds per IP address to prevent abuse
- **MFA Enforcement**: Multi-factor authentication is mandatory for all users
- **Input Validation**: 500 character limit on messages with real-time feedback
- **CORS Protection**: Configured to allow only specified frontend origins
- **Error Handling**: Detailed error messages from API responses

### User Experience

- **Loading States**: Beautiful loading overlays during authentication
- **Toast Notifications**: Non-intrusive feedback for all actions
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Modern UI**: Purple gradient theme with smooth animations
- **Signature History**: Persistent history with expandable details

## 📡 API Usage

### Verify Signature

```bash
curl -X POST https://legacy-fe-candidate-assignment-swop.onrender.com/api/auth/verify-signature \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, Web3!",
    "signature": "0x8cf68efafba12b1b4749929a70925d23ad1413f2d9df628b0028a06304299bfe..."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "signer": "0xdb1c36A4EDFc5fB21bB28e10900AC2d58f0CbF50",
    "originalMessage": "Hello, Web3!",
    "timestamp": "2025-01-23T12:00:00.000Z"
  }
}
```

### Health Check

```bash
curl https://legacy-fe-candidate-assignment-swop.onrender.com/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-23T12:00:00.000Z",
  "uptime": 3600
}
```

## 🚢 Deployment

### Quick Deployment

See `QUICK_DEPLOY.md` for a fast-track deployment checklist.

### Full Deployment Guide

See `DEPLOYMENT.md` for comprehensive deployment instructions for:
- **Frontend**: Vercel deployment
- **Backend**: Render deployment
- **Environment Variables**: Complete configuration
- **Troubleshooting**: Common issues and solutions

### Production Environment Variables

**Frontend (Vercel):**
```env
VITE_DYNAMIC_ENVIRONMENT_ID=your_production_env_id
VITE_API_BASE_URL=https://legacy-fe-candidate-assignment-swop.onrender.com
```

**Backend (Render):**
```env
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://legacy-fe-candidate-assignment-clie.vercel.app/
```

## 🧪 Testing

### Server Tests (Jest)

```bash
cd server

# Run all tests
npm test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test:coverage
```

**Test Coverage:**
- ✅ Signature recovery and verification utilities
- ✅ Session management utilities
- ✅ Rate limiting middleware
- ✅ API endpoint integration tests

### Client Tests (Vitest)

```bash
cd client

# Run all tests
yarn test

# Run tests with UI
yarn test:ui

# Run tests with coverage
yarn test:coverage
```

**Test Coverage:**
- ✅ API service unit tests (mocked)
- ✅ API service integration tests (requires running backend)

See `TESTING.md` for detailed testing documentation.

## 📚 Technical Decisions

### Why Headless Dynamic.xyz?

- **Full Control**: Complete customization of authentication UI/UX
- **No Widgets**: No pre-built UI components, everything is custom
- **Better UX**: Seamless integration with our design system
- **Programmatic**: All authentication handled via SDK methods

### Why Per-Email Storage?

- **Multi-User Support**: Multiple users can use the same browser
- **Data Isolation**: Each user's signatures are completely separate
- **Privacy**: No data leakage between users
- **Scalability**: Easy to extend to cloud storage in the future

### Why Rate Limiting?

- **Abuse Prevention**: Protects against brute force and spam
- **Cost Control**: Prevents excessive API usage
- **Fair Usage**: Ensures all users get equal access
- **Production Ready**: Essential for public-facing APIs

## 🎨 Design Philosophy

SignVault emphasizes:

- **Modern Aesthetics**: Purple gradient theme with smooth animations
- **User Clarity**: Clear feedback for all actions and states
- **Mobile First**: Responsive design that works on all devices
- **Accessibility**: Proper contrast, focus states, and keyboard navigation
- **Performance**: Optimized builds with code splitting

## 📝 License

This project is part of a technical assessment.

## 🤝 Contributing

This is a demonstration project. For questions or issues, please refer to the deployment documentation.
