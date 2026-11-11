# FocusFlow API

NestJS + MongoDB backend for FocusFlow. See the [main README](../README.md) for features and full setup.

```bash
npm install
cp .env.example .env   # MONGODB_URI and JWT_SECRET are required
npm run start:dev      # http://localhost:5000, Swagger at /docs
npm test
```

Every request is under `/api`. Settings are explained in [`.env.example`](.env.example).
