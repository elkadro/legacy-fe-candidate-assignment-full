# Quick Deployment Checklist

## 🚀 Fast Track Deployment

### Backend (Render) - 5 minutes

1. **Go to**: https://dashboard.render.com → New Web Service
2. **Connect**: Your GitHub repo
3. **Settings**:
   ```
   Name: dynamic-signer-backend
   Root Directory: server
   Build: npm install && npm run build
   Start: npm start
   ```
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=8000
   FRONTEND_URL=https://legacy-fe-candidate-assignment-clie.vercel.app (update after frontend deploy)
   ```
5. **Deploy** → Copy URL (e.g., `https://legacy-fe-candidate-assignment-swop.onrender.com`)

### Frontend (Vercel) - 5 minutes

1. **Go to**: https://vercel.com/dashboard → Add Project
2. **Import**: Your GitHub repo
3. **Settings**:
   ```
   Root Directory: client
   (Everything else auto-detected)
   ```
4. **Environment Variables**:
   ```
   VITE_DYNAMIC_ENVIRONMENT_ID=your_dynamic_env_id
   VITE_API_BASE_URL=https://legacy-fe-candidate-assignment-swop.onrender.com (from step above)
   ```
5. **Deploy** → Copy URL (e.g., `https://xxx.vercel.app`)

### Final Step - Update CORS

1. **Go back to Render**
2. **Update Environment Variable**:
   ```
   FRONTEND_URL=https://xxx.vercel.app (your Vercel URL)
   ```
3. **Redeploy** (auto or manual)

## ✅ Done!

Test: Visit your Vercel URL and try signing in!

---

## 📝 Environment Variables Reference

### Frontend (Vercel)
- `VITE_DYNAMIC_ENVIRONMENT_ID` - From Dynamic.xyz dashboard
- `VITE_API_BASE_URL` - Your Render backend URL

### Backend (Render)
- `NODE_ENV=production`
- `PORT=8000` (auto-set by Render)
- `FRONTEND_URL` - Your Vercel frontend URL

