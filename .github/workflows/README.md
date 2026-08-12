# CI/CD Pipeline Documentation

This repository uses GitHub Actions for continuous integration, deployment, and security scanning.

## Workflows

### 1. Backend CI (`athar-api/.github/workflows/ci.yml`)
**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
- **Test**: Runs PHPUnit tests, Laravel Pint, and PHP security checks
- **Lint**: Performs code style checks with Laravel Pint and syntax validation

**Matrix:**
- PHP 8.2

### 2. Frontend CI (`.github/workflows/frontend-ci.yml`)
**Triggers:**
- Push to `main` or `develop` branches (client changes only)
- Pull requests to `main` or `develop` branches (client changes only)

**Jobs:**
- **Test**: TypeScript checking, ESLint, Prettier, build verification, and npm audit
- **Lint**: TypeScript and ESLint validation

**Matrix:**
- Node.js 18

### 3. Deploy to Production (`.github/workflows/deploy.yml`)
**Triggers:**
- Push to `main` branch
- Manual workflow dispatch

**Jobs:**
- **Backend Deploy**: Installs dependencies, runs migrations, caches config, and deploys via SSH
- **Frontend Deploy**: Builds Next.js application and deploys via SSH with PM2

**Environments:**
- Production (requires approval)

### 4. Security Scan (`.github/workflows/security.yml`)
**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Weekly schedule (Sundays at midnight)

**Jobs:**
- **Backend Security**: PHP security checker, composer audit, Trivy scanner
- **Frontend Security**: npm audit, Trivy scanner
- **CodeQL Analysis**: Advanced code analysis for JavaScript and PHP

## Required GitHub Secrets

For deployment workflows, configure these secrets in your repository settings:

### Deployment Secrets
- `SERVER_HOST`: Your server hostname/IP
- `SERVER_USER`: SSH username for deployment
- `SSH_PRIVATE_KEY`: Private SSH key for server access
- `API_BASE_URL`: Production API URL
- `APP_URL`: Production frontend URL

### How to Add Secrets
1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret with its value

## Code Quality Tools

### Backend (Laravel)
- **Laravel Pint**: PHP code style fixer
- **PHPUnit**: Unit and feature testing
- **PHP Security Checker**: Dependency vulnerability scanning

### Frontend (Next.js)
- **TypeScript**: Type checking
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **npm audit**: Dependency vulnerability scanning

## Branch Strategy

- `main`: Production branch (auto-deploys to production)
- `develop`: Development branch (runs CI but no deployment)
- Feature branches: Create from `develop`, PR to `develop`

## Manual Deployment

To manually trigger a deployment:
1. Go to Actions tab in GitHub
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Monitoring

- Check the Actions tab for workflow runs
- Failed workflows will show detailed error logs
- Security alerts appear in the Security tab
- CodeQL results appear in the Security tab

## Local Development

### Backend
```bash
cd athar-api
composer install
php artisan test
vendor/bin/pint --test
```

### Frontend
```bash
cd client
npm install
npm run lint
npm run format:check
npm run build
```

## Troubleshooting

### Backend CI Failures
- Check PHP version compatibility
- Verify all dependencies are in `composer.json`
- Ensure tests pass locally with `php artisan test`

### Frontend CI Failures
- Check Node.js version (should be 18)
- Verify TypeScript types are correct
- Run `npm run lint` locally to catch issues

### Deployment Failures
- Verify SSH keys are configured correctly
- Check server connectivity
- Ensure environment variables are set on server
- Review deployment logs in Actions tab

### Security Scan Failures
- Update vulnerable dependencies
- Review CodeQL alerts for false positives
- Check for security best practices violations
