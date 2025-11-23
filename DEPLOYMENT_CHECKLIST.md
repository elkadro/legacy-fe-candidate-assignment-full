# 🚀 Deployment Checklist

## Pre-Deployment

- [ ] Get Dynamic.xyz Environment ID from https://app.dynamic.xyz
- [ ] Have Vercel account ready
- [ ] Have Render account ready
- [ ] Code is committed to GitHub

## Backend Deployment (Render)

- [ ] Create new Web Service on Render
- [ ] Set Root Directory: `server`
- [ ] Set Build Command: `npm install && npm run build`
- [ ] Set Start Command: `npm start`
- [ ] Add Environment Variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=8000`
  - [ ] `FRONTEND_URL` (will update after frontend deploy)
- [ ] Deploy and copy backend URL

## Frontend Deployment (Vercel)

- [ ] Create new project on Vercel
- [ ] Set Root Directory: `client`
- [ ] Add Environment Variables:
  - [ ] `VITE_DYNAMIC_ENVIRONMENT_ID=your_env_id`
  - [ ] `VITE_API_BASE_URL=your_render_backend_url`
- [ ] Deploy and copy frontend URL

## Post-Deployment

- [ ] Update `FRONTEND_URL` in Render with Vercel URL
- [ ] Test backend health: `https://legacy-fe-candidate-assignment-swop.onrender.com/health`
- [ ] Test frontend: Visit Vercel URL
- [ ] Test login flow
- [ ] Test MFA setup
- [ ] Test message signing
- [ ] Test signature verification
- [ ] Verify CORS is working (no CORS errors in console)

## Quick Reference

**Backend URL**: `https://legacy-fe-candidate-assignment-swop.onrender.com`  
**Frontend URL**: `https://legacy-fe-candidate-assignment-clie.vercel.app`

**Backend Env Vars**:
```
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://legacy-fe-candidate-assignment-clie.vercel.app
```

**Frontend Env Vars**:
```
VITE_DYNAMIC_ENVIRONMENT_ID=your_env_id
VITE_API_BASE_URL=https://legacy-fe-candidate-assignment-swop.onrender.com
```

