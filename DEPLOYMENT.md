# Deployment Guide

This guide provides step-by-step instructions for deploying the Athar Khatma project to various hosting platforms, including free options for both the client (Next.js) and API (Laravel/PHP).

## Table of Contents

- [Free Hosting Options](#free-hosting-options)
- [Deployment Options](#deployment-options)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

---

## Free Hosting Options

### Client (Next.js Frontend)

#### 1. Vercel ⭐ Recommended
- **URL**: https://vercel.com
- **Features**:
  - Free forever for personal projects
  - Automatic deployments from Git
  - Built-in CDN
  - SSL certificates
  - Preview deployments
  - Serverless functions
- **Pros**: Best for Next.js, automatic optimization, excellent performance
- **Cons**: Limited server-side functions on free tier
- **Best for**: Production deployment

#### 2. Netlify
- **URL**: https://netlify.com
- **Features**:
  - Free tier with 100GB bandwidth/month
  - Automatic deployments
  - Form handling
  - Edge functions
  - SSL certificates
- **Pros**: Great static site hosting, easy setup
- **Cons**: Not optimized for Next.js like Vercel
- **Best for**: Static sites, simple deployments

#### 3. GitHub Pages
- **URL**: https://pages.github.com
- **Features**:
  - Free hosting from GitHub repositories
  - Automatic deployments
  - SSL certificates
  - Jekyll support
- **Pros**: Completely free, integrates with GitHub
- **Cons**: Static only, no server-side rendering
- **Best for**: Static export builds

#### 4. Cloudflare Pages
- **URL**: https://pages.cloudflare.com
- **Features**:
  - Free tier with unlimited bandwidth
  - Global CDN
  - Automatic deployments
  - D1 database (SQLite)
  - Edge functions
- **Pros**: Excellent performance, D1 database included
- **Cons**: Newer platform, smaller community
- **Best for**: Performance-focused deployments

---

### API (Laravel/PHP Backend)

#### 1. Render ⭐ Recommended
- **URL**: https://render.com
- **Features**:
  - Free tier for web services
  - 750 hours/month free
  - PostgreSQL database included
  - Automatic SSL
  - Docker support
  - Easy environment variable management
- **Pros**: Best free tier for PHP/Laravel, includes database
- **Cons**: Sleeps after 15 minutes of inactivity on free tier
- **Best for**: Production API deployment

#### 2. Railway
- **URL**: https://railway.app
- **Features**:
  - $5 free credit/month
  - PostgreSQL database
  - Redis support
  - Automatic deployments
  - CLI tool
- **Pros**: Excellent developer experience, includes Redis
- **Cons**: Free credit runs out after first month
- **Best for**: Full-stack deployments with caching

#### 3. Fly.io
- **URL**: https://fly.io
- **Features**:
  - Free tier for small apps
  - Global deployment
  - PostgreSQL included
  - Docker support
  - Edge computing
- **Pros**: True serverless, great performance
- **Cons**: More complex setup, learning curve
- **Best for**: Advanced users, global deployments

#### 4. Koyeb
- **URL**: https://koyeb.com
- **Features**:
  - 512MB RAM free tier
  - 5GB storage
  - Global edge network
  - Automatic SSL
  - Docker support
- **Pros**: Never sleeps, good for APIs
- **Cons**: Limited resources on free tier
- **Best for**: Always-on API endpoints

#### 5. Alternatives (Not Free but Affordable)
- **DigitalOcean**: $4/month droplet
- **Linode**: $5/month VPS
- **Heroku**: $5/month dyno (no longer free)
- **AWS Lightsail**: $3.50/month

---

## Deployment Options

### Option 1: Vercel + Render (Recommended)

#### Deploy Client to Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com/signup
   - Sign up with GitHub, GitLab, or Bitbucket

2. **Import Project**
   - Click "Add New Project"
   - Select your `athar_khatma` repository
   - Set root directory to `client`

3. **Configure Build Settings**
   ```yaml
   Framework Preset: Next.js
   Root Directory: client
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm ci
   ```

4. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-api-url.onrender.com
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Access at `https://your-app.vercel.app`

#### Deploy API to Render

1. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**
   - Click "New Web Service"
   - Select your `athar_khatma` repository
   - Set root directory to `athar-api`

3. **Configure Runtime**
   ```yaml
   Runtime: PHP
   Build Command: composer install && php artisan key:generate
   Start Command: php artisan serve --host=0.0.0.0 --port=$PORT
   ```

4. **Environment Variables**
   Add these in Render dashboard:
   ```
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-api-url.onrender.com
   DB_CONNECTION=postgresql
   DB_HOST=your-db-host.render.com
   DB_PORT=5432
   DB_DATABASE=your_db_name
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   CACHE_DRIVER=database
   SESSION_DRIVER=database
   SANCTUM_TOKEN_EXPIRATION=60
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=SecureAdminPassword123!
   ```

5. **Create PostgreSQL Database**
   - Click "New Database"
   - Select PostgreSQL
   - Free tier available
   - Copy connection details to web service environment variables

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment
   - Access at `https://your-api-url.onrender.com`

---

### Option 2: Netlify + Railway

#### Deploy Client to Netlify

1. **Create Netlify Account**
   - Go to https://app.netlify.com/signup
   - Sign up with GitHub

2. **Build Configuration**
   - Add `netlify.toml` to `client` directory:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

3. **Deploy**
   - Connect GitHub repository
   - Set base directory to `client`
   - Add environment variables
   - Deploy

#### Deploy API to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create Project**
   - Click "New Project"
   - Select repository
   - Select `athar-api` directory

3. **Configure**
   - Runtime: PHP
   - Build command: `composer install`
   - Start command: `php artisan serve --host=0.0.0.0 --port=$PORT`

4. **Add Database**
   - Click "Add Database"
   - Select PostgreSQL
   - Copy connection string to environment variables

5. **Deploy**
   - Railway will auto-deploy on push

---

### Option 3: Cloudflare Pages + Fly.io

#### Deploy Client to Cloudflare Pages

1. **Create Cloudflare Account**
   - Go to https://dash.cloudflare.com/sign-up

2. **Create Pages Project**
   - Go to Pages → Create project
   - Connect to Git
   - Set build settings:
   ```
   Build command: npm run build
   Build output directory: .next
   Root directory: client
   ```

3. **Add Environment Variables**
   - Add in Cloudflare dashboard

4. **Deploy**

#### Deploy API to Fly.io

1. **Install Fly CLI**
   ```bash
   npm install -g flyctl
   ```

2. **Login**
   ```bash
   flyctl auth login
   ```

3. **Initialize**
   ```bash
   cd athar-api
   flyctl launch
   ```

4. **Configure fly.toml**
   ```toml
   [build]
     builder = "heroku/builder:22"
     buildpacks = ["heroku/php"]

   [env]
     APP_ENV = "production"
     APP_DEBUG = "false"
     PORT = "8080"

   [services]
     [[services.ports]]
       handlers = ["http"]
       port = 8080
   ```

5. **Deploy**
   ```bash
   flyctl deploy
   ```

---

## Environment Configuration

### Backend (.env.production)

```env
APP_NAME=Laravel
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-api-url.com

APP_LOCALE=en
APP_FALLBACK_LOCALE=en

# Database (PostgreSQL recommended for production)
DB_CONNECTION=pgsql
DB_HOST=your-db-host.com
DB_PORT=5432
DB_DATABASE=athar_db
DB_USERNAME=your_user
DB_PASSWORD=your_secure_password

# Cache & Session
CACHE_DRIVER=database
SESSION_DRIVER=database
QUEUE_CONNECTION=database

# Email Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@athar.com"
MAIL_FROM_NAME="ختمة وأثر"

# Admin Configuration
ADMIN_EMAIL=admin@athar.com
ADMIN_PASSWORD=SecureAdminPassword123!

# Sanctum
SANCTUM_TOKEN_EXPIRATION=60
```

### Frontend (.env.production)

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api
NEXT_PUBLIC_APP_URL=https://your-frontend-url.com
```

---

## Database Setup

### PostgreSQL (Recommended for Production)

#### Create Database on Render
1. Go to Render dashboard
2. Click "New Database"
3. Select PostgreSQL
4. Choose free tier
5. Copy connection string

#### Run Migrations
```bash
cd athar-api
php artisan migrate --force
php artisan db:seed --force
```

#### Seed Admin User
```bash
php artisan db:seed --class=AdminSeeder
```

### SQLite (Development Only)
```env
DB_CONNECTION=sqlite
DB_DATABASE=database.sqlite
```

---

## Pre-Deployment Checklist

### Backend
- [ ] Update `.env.production` with production values
- [ ] Set `APP_DEBUG=false`
- [ ] Configure production database
- [ ] Set strong admin password
- [ ] Configure email settings
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Run seeders: `php artisan db:seed --force`
- [ ] Clear cache: `php artisan cache:clear`
- [ ] Optimize: `php artisan optimize`
- [ ] Test API endpoints locally

### Frontend
- [ ] Update `.env.production` with production URLs
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` to production API
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Build locally: `npm run build`
- [ ] Test build locally: `npm start`
- [ ] Verify API connectivity
- [ ] Check all routes work

---

## Post-Deployment Steps

### Backend
1. **Verify Health Endpoint**
   ```bash
   curl https://your-api-url.com/api/health
   ```

2. **Test Authentication**
   ```bash
   curl -X POST https://your-api-url.com/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"password"}'
   ```

3. **Check Logs**
   - Render: Dashboard → Logs
   - Railway: Dashboard → Logs
   - Fly.io: `flyctl logs`

### Frontend
1. **Test in Browser**
   - Open production URL
   - Test login flow
   - Test all major features

2. **Check Console**
   - Open browser DevTools
   - Check for errors
   - Verify API calls

3. **Test Mobile**
   - Open on mobile device
   - Test responsive design

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
**Problem**: SQLSTATE connection refused
**Solution**:
- Check database credentials
- Verify database is running
- Check firewall settings
- Verify database host is accessible

#### 2. CORS Errors
**Problem**: API calls blocked by CORS
**Solution**:
- Add CORS middleware to Laravel
- Configure allowed origins
- Check frontend API URL

#### 3. Build Failures
**Problem**: Next.js build fails
**Solution**:
- Check Node.js version (should be 18+)
- Clear `.next` directory
- Delete `node_modules` and reinstall
- Check environment variables

#### 4. API Sleep Issues (Render Free Tier)
**Problem**: API goes to sleep after inactivity
**Solution**:
- Upgrade to paid tier
- Use cron job to ping endpoint
- Use Railway (better free tier)

#### 5. File Upload Issues
**Problem**: Cannot upload files
**Solution**:
- Use object storage (AWS S3, Cloudflare R2)
- Configure filesystem settings
- Check file permissions

#### 6. Email Not Sending
**Problem**: Email notifications fail
**Solution**:
- Check SMTP credentials
- Verify email provider settings
- Check spam folder
- Use email service like SendGrid or Mailgun

---

## Monitoring & Maintenance

### Health Checks
- Set up uptime monitoring (UptimeRobot, Pingdom)
- Monitor API health endpoint
- Set up alerts for downtime

### Logs
- Centralize logs (Logtail, Papertrail)
- Monitor error rates
- Set up alerting

### Backups
- Database backups (Render auto-backups)
- Code backups (Git)
- Configuration backups

### Updates
- Keep dependencies updated
- Security patches
- Monitor for vulnerabilities

---

## Cost Comparison

### Free Tier Limitations

| Platform | Free Tier | Limitations | Paid Tier |
|----------|-----------|--------------|-----------|
| Vercel | Forever | Serverless functions limited | $20/month |
| Render | 750h/mo | Sleeps after 15min | $7/month |
| Railway | $5 credit | Credit expires | $5/mo |
| Fly.io | 512MB RAM | Limited resources | $5/mo |
| Netlify | 100GB/mo | Functions limited | $19/mo |

### Recommended Upgrade Path
1. Start with free tiers
2. Monitor usage
3. Upgrade when limits reached
4. Typical cost: $10-30/month for production

---

## Security Best Practices

1. **Always use HTTPS**
   - All platforms provide free SSL
   - Force HTTPS redirects

2. **Environment Variables**
   - Never commit secrets
   - Use platform's secret management
   - Rotate keys regularly

3. **Database Security**
   - Use strong passwords
   - Restrict access
   - Enable SSL connections

4. **API Security**
   - Rate limiting
   - Authentication tokens
   - Input validation

5. **Regular Updates**
   - Update dependencies
   - Security patches
   - Monitor vulnerabilities

---

## Support Resources

- **Vercel**: https://vercel.com/docs
- **Render**: https://render.com/docs
- **Railway**: https://docs.railway.app
- **Fly.io**: https://fly.io/docs
- **Next.js**: https://nextjs.org/docs
- **Laravel**: https://laravel.com/docs

---

## Quick Start Guide

### Fastest Deployment (15 minutes)

1. **Frontend to Vercel**
   - Sign up at vercel.com
   - Import GitHub repo
   - Set root to `client`
   - Add environment variables
   - Deploy

2. **Backend to Render**
   - Sign up at render.com
   - Import GitHub repo
   - Set root to `athar-api`
   - Add PostgreSQL database
   - Add environment variables
   - Deploy

3. **Configure**
   - Update frontend `NEXT_PUBLIC_API_BASE_URL`
   - Test both deployments
   - Done!

---

## Conclusion

This guide provides multiple deployment options ranging from completely free to affordable paid tiers. For production use, we recommend:

- **Frontend**: Vercel (best Next.js support)
- **Backend**: Render (best Laravel support + free database)

Total cost: $0 for free tiers, $7-20/month for production.

For questions or issues, refer to platform documentation or community forums.
