# Deployment Guide: Vercel (Frontend) + Render (Backend)

This guide will help you deploy the SignVault application to production.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **Dynamic.xyz Account**: Get your Environment ID from [app.dynamic.xyz](https://app.dynamic.xyz)

---

## Step 1: Deploy Backend to Render

### 1.1 Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `cursor-legacy-fe-candidate-assignment`
5. Configure the service:
   - **Name**: `dynamic-signer-backend` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `18` or `20` (Render will auto-detect)
   - **Plan**: Free (or paid if needed)

### 1.2 Set Environment Variables in Render

In the Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

**Note**: You'll update `FRONTEND_URL` after deploying the frontend.

### 1.3 Deploy

1. Click **"Create Web Service"**
2. Wait for the build to complete
3. Copy the **Service URL** (e.g., `https://legacy-fe-candidate-assignment-swop.onrender.com`)

---

## Step 2: Deploy Frontend to Vercel

### 2.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `client` (click "Edit" next to Root Directory)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### 2.3 Set Environment Variables in Vercel

In the Vercel project settings, go to **Environment Variables** and add:

```
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id_here
VITE_API_BASE_URL=https://legacy-fe-candidate-assignment-swop.onrender.com
```

**Important**: 
- Replace `your_dynamic_environment_id_here` with your actual Dynamic.xyz Environment ID
- Replace `https://legacy-fe-candidate-assignment-swop.onrender.com` with your Render backend URL from Step 1.3

### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Copy your **Production URL** (e.g., `https://legacy-fe-candidate-assignment-clie.vercel.app`)

---

## Step 3: Update Backend CORS

### 3.1 Update Render Environment Variables

Go back to Render dashboard and update:

```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Replace with your actual Vercel URL from Step 2.4.

### 3.2 Redeploy Backend

Render will automatically redeploy when environment variables change, or you can manually trigger a redeploy.

---

## Step 4: Verify Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test Backend Health**: Visit `https://legacy-fe-candidate-assignment-swop.onrender.com/health`
3. **Test API**: Try signing in and verifying a signature

---

## Environment Variables Summary

### Frontend (Vercel)
```
VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_environment_id
VITE_API_BASE_URL=https://legacy-fe-candidate-assignment-swop.onrender.com
```

### Backend (Render)
```
NODE_ENV=production
PORT=8000
FRONTEND_URL=https://your-vercel-app.vercel.app
```

---

## Troubleshooting

### Frontend Issues

**Problem**: API calls failing with CORS errors
- **Solution**: Ensure `FRONTEND_URL` in Render matches your Vercel URL exactly (including `https://`)

**Problem**: Dynamic.xyz not working
- **Solution**: Verify `VITE_DYNAMIC_ENVIRONMENT_ID` is set correctly in Vercel

### Backend Issues

**Problem**: Backend not starting
- **Solution**: Check Render logs, ensure `npm run build` completes successfully

**Problem**: Rate limiting too strict
- **Solution**: Adjust rate limit in `server/src/middleware/rateLimit.middleware.ts` if needed

### Common Issues

**Problem**: Environment variables not updating
- **Solution**: 
  - Vercel: Redeploy after changing env vars
  - Render: Service auto-redeploys, or trigger manually

**Problem**: Build fails
- **Solution**: Check build logs in respective dashboards for specific errors

---

## Quick Deploy Commands (Alternative)

### Deploy Frontend via CLI

```bash
cd client
npm install -g vercel
vercel --prod
```

### Deploy Backend via CLI (if using Render CLI)

```bash
cd server
render deploy
```

**Note**: For most users, using the web dashboards (Vercel & Render) is easier and recommended.

---

## Post-Deployment Checklist

- [ ] Backend health check works (`/health` endpoint)
- [ ] Frontend loads without errors
- [ ] User can sign in with email
- [ ] OTP verification works
- [ ] MFA setup works
- [ ] Message signing works
- [ ] Signature verification works
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] Rate limiting is working

---

## Production Considerations

1. **Rate Limiting**: Current limit is 1 request per 5 seconds. Adjust if needed for production.
2. **Error Logging**: Check Render logs for backend errors
3. **Monitoring**: Consider adding monitoring services (e.g., Sentry)
4. **Database**: If you need persistent storage, consider adding a database
5. **Redis**: For distributed rate limiting, consider Redis instead of in-memory store

---

## Support

If you encounter issues:
1. Check the logs in Vercel/Render dashboards
2. Verify all environment variables are set correctly
3. Ensure CORS allows your frontend URL
4. Check that both services are running and accessible

