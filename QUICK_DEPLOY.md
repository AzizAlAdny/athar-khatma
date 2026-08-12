# Quick Deployment Guide

Fastest path to deploy Athar Khatma to production in 15 minutes.

## 🚀 Option 1: Vercel + Render (Recommended)

### Step 1: Deploy Frontend to Vercel (5 minutes)

1. **Sign up**
   - Go to https://vercel.com/signup
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select `athar_khatma` repository
   - Set **Root Directory** to `client`
   - Click **Import**

3. **Configure**
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next`

4. **Environment Variables**
   Add these in Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url.onrender.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. **Deploy**
   - Click **Deploy**
   - Wait 2-3 minutes
   - Your frontend is live!

### Step 2: Deploy Backend to Render (10 minutes)

1. **Sign up**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Database**
   - Click **New** → **Database**
   - Select **PostgreSQL**
   - Click **Create Database**
   - Wait for it to be ready
   - Copy the **Internal Database URL**

3. **Create Web Service**
   - Click **New** → **Web Service**
   - Select `athar_khatma` repository
   - Set **Root Directory** to `athar-api`

4. **Configure**
   - **Name**: athar-api
   - **Runtime**: PHP
   - **Build Command**: `composer install && php artisan key:generate`
   - **Start Command**: `php artisan serve --host=0.0.0.0 --port=$PORT`

5. **Environment Variables**
   Add these in Render dashboard:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-api-url.onrender.com
   DB_CONNECTION=postgresql
   DATABASE_URL=your-internal-database-url-from-step-2
   CACHE_DRIVER=database
   SESSION_DRIVER=database
   SANCTUM_TOKEN_EXPIRATION=60
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=SecureAdminPassword123!
   ```

6. **Deploy**
   - Click **Create Web Service**
   - Wait 3-5 minutes
   - Your API is live!

### Step 3: Connect Frontend to Backend (2 minutes)

1. **Update Vercel Environment Variables**
   - Go to Vercel dashboard → your project → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_BASE_URL` to your Render API URL
   - Redeploy Vercel

2. **Test**
   - Open your Vercel URL
   - Try logging in
   - Verify API calls work

---

## 🎯 Option 2: Netlify + Railway

### Deploy Frontend to Netlify

1. **Sign up**: https://app.netlify.com/signup
2. **Add site**: "Add new site" → "Import an existing project"
3. **Connect GitHub**
4. **Build settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `.next`
5. **Add environment variables**
6. **Deploy**

### Deploy Backend to Railway

1. **Sign up**: https://railway.app
2. **New Project** → Select repo
3. **Select** `athar-api` directory
4. **Add PostgreSQL database**
5. **Configure environment variables**
6. **Deploy**

---

## 📋 Pre-Deployment Checklist

### Backend (athar-api)
- [ ] Create `.env.production` file
- [ ] Set `APP_DEBUG=false`
- [ ] Configure database connection
- [ ] Set strong admin password
- [ ] Run `composer install`
- [ ] Run `php artisan migrate --force`
- [ ] Run `php artisan db:seed --force`

### Frontend (client)
- [ ] Create `.env.production` file
- [ ] Set `NEXT_PUBLIC_API_BASE_URL`
- [ ] Set `NEXT_PUBLIC_APP_URL`
- [ ] Run `npm install`
- [ ] Run `npm run build`
- [ ] Test build locally

---

## 🔧 Environment Variables Template

### Backend (.env.production)
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-api-url.com
DB_CONNECTION=postgresql
DATABASE_URL=postgresql://user:password@host:5432/dbname
CACHE_DRIVER=database
SESSION_DRIVER=database
SANCTUM_TOKEN_EXPIRATION=60
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=SecureAdminPassword123!
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-url.com
```

---

## ⚡ After Deployment

### Verify Backend
```bash
# Test health endpoint
curl https://your-api-url.com/api/health

# Test stats endpoint (requires auth)
curl https://your-api-url.com/api/stats
```

### Verify Frontend
1. Open frontend URL in browser
2. Test login with admin credentials
3. Check browser console for errors
4. Test all major features

---

## 🆘 Troubleshooting

### Frontend won't build
- Delete `node_modules` and `.next` folders
- Run `npm install` again
- Check Node.js version (should be 18+)

### Backend won't start
- Check environment variables
- Verify database connection
- Check Render logs
- Ensure PHP version is correct

### API calls failing
- Check CORS settings
- Verify API URL is correct
- Check if backend is running
- Check browser console for errors

---

## 📱 Mobile Testing

After deployment:
1. Open frontend URL on mobile device
2. Test responsive design
3. Test touch interactions
4. Verify all features work

---

## 💡 Pro Tips

1. **Use Preview Deployments**: Vercel and Render offer preview URLs for each branch
2. **Set Up Monitoring**: Use UptimeRobot to monitor your deployments
3. **Keep Secrets Safe**: Never commit environment variables
4. **Test Locally First**: Always test changes locally before deploying
5. **Use Git Branches**: Use `develop` for staging, `main` for production

---

## 🎉 You're Live!

Once deployed:
- Frontend: Available at your Vercel/Netlify URL
- Backend: Available at your Render/Railway URL
- Admin: Use credentials from environment variables

For detailed documentation, see [DEPLOYMENT.md](./DEPLOYMENT.md)
