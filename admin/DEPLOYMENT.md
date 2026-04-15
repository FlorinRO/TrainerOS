# Admin Deployment

The admin app is a separate Vite application and must be deployed as its own service.

## Railway service

- Root directory: `admin`
- Build command: `npm install && npm run build`
- Start command: `npm run start`

## Required environment variables

- `VITE_API_BASE_URL=https://backend-production-9974.up.railway.app/api`

If you later attach a custom API domain, switch it to:

- `VITE_API_BASE_URL=https://api.traineros.org/api`

## Backend CORS

If admin is hosted on a Railway URL, the backend must allow that exact origin in `CORS_ORIGIN`.

Example:

```env
CORS_ORIGIN=https://traineros.org,https://frontend-production-a943.up.railway.app,https://admin-production-xxxx.up.railway.app
```

If admin is hosted on `https://admin.traineros.org`, the current backend origin check already allows it as a `*.traineros.org` subdomain.

## Expected login URL

Once deployed, the admin login will be:

- `https://<admin-service>.up.railway.app/login`

Or, with a custom domain:

- `https://admin.traineros.org/login`
