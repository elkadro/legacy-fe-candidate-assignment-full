# Installing Test Dependencies

## Server Tests (Jest)

Run these commands in the `server` directory:

```bash
cd server

# Install Jest and TypeScript support
yarn add -D jest @types/jest ts-jest

# Install Supertest for API integration tests
yarn add -D supertest @types/supertest
```

Or install all at once:

```bash
cd server
yarn add -D jest @types/jest ts-jest supertest @types/supertest
```

## Client Tests (Vitest)

Run these commands in the `client` directory:

```bash
cd client

# Install Vitest and React Testing Library
yarn add -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Or install all at once:

```bash
cd client
yarn add -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

## Quick Install (Both)

If you want to install all test dependencies for both server and client:

```bash
# Server
cd server && yarn add -D jest @types/jest ts-jest supertest @types/supertest && cd ..

# Client
cd client && yarn add -D vitest @vitest/ui @vitest/coverage-v8 @testing-library/react @testing-library/jest-dom @testing-library/user-event && cd ..
```

## Verify Installation

After installation, verify the setup:

```bash
# Server
cd server && yarn test

# Client
cd client && yarn test
```

