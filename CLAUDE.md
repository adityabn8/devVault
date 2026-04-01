# DevVault – Claude Instructions

## Git
**Never perform any git operations** (commit, push, pull, checkout, reset, etc.) unless the user explicitly asks. This includes staging files.

## Project Overview
Full-stack developer learning tracker. React SPA + Express REST API, deployed on Render (split: client on one service, server on another).

- **Client:** `localhost:3000` — React 18, Tailwind CSS 3, React Router 6, Axios, lucide-react
- **Server:** `localhost:5000` — Node/Express 4, Mongoose 8, Passport.js (GitHub OAuth), JWT
- **DB:** MongoDB Atlas (free M0)
- **Auth:** GitHub OAuth → JWT stored in `localStorage` as `dv_token`, sent as `Authorization: Bearer` header
- **Extension:** Chrome extension (`extension/`) — detects dev/prod via `chrome.management.getSelf`

## Local Dev Setup
1. `server/.env` — copy from `server/.env.example` (needs `MONGODB_URI`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `JWT_SECRET`, `CLIENT_URL=http://localhost:3000`, `SERVER_URL=http://localhost:5000`)
2. `client/.env` — copy from `client/.env.example` (`REACT_APP_API_URL=http://localhost:5000`)
3. `cd server && npm run dev`
4. `cd client && npm start`

## Key Conventions
- **API base:** client uses `REACT_APP_API_URL` env var (just the server origin, no `/api` suffix)
- **Auth middleware:** `server/middleware/auth.js` — reads JWT from `req.cookies.token` OR `Authorization: Bearer`
- **Error shape:** `{ error: { code, message } }` — always use this shape from the server
- **CORS:** allows `CLIENT_URL` origin + `chrome-extension://` and `moz-extension://` origins
- **Rate limiting:** global limiter in `server/middleware/rateLimit.js`
- **Validation:** express-validator schemas in `server/validators/`

## Structure
```
devVault/
├── client/src/
│   ├── components/{common,layout,resources,search,vaults}/
│   ├── context/{AuthContext,ThemeContext,ToastContext}.jsx
│   ├── hooks/{useAuth,useKeyboardShortcut,useResources,useSearch,useVaults}.js
│   ├── pages/{Login,AuthCallback,Dashboard,Vaults,VaultDetail,AddResource,
│   │         ResourceDetailPage,Profile,SharedVault}.jsx
│   ├── services/{api,authService,dashboardService,profileService,
│   │            resourceService,vaultService}.js
│   └── utils/{constants,formatters,validators}.js
├── server/
│   ├── config/{db,passport,constants}.js
│   ├── middleware/{auth,errorHandler,rateLimit}.js
│   ├── models/{User,Vault,Resource,Activity}.js
│   ├── routes/{auth,vaults,resources,dashboard,search,profile}.js
│   ├── services/{activityService,metadataService}.js
│   └── validators/{resourceValidator,vaultValidator}.js
└── extension/
    ├── config.js      — prod/dev URL config
    ├── popup.html/js  — extension popup
    └── background.js
```

## Behaviour Rules
- Read relevant files before suggesting or making changes — never propose changes blind
- Keep changes minimal and focused; don't refactor, add comments, or clean up surrounding code unless asked
- No extra error handling, fallbacks, or validation beyond what's needed for the task
- Don't create new files unless strictly necessary
- Prefer editing existing files over creating new abstractions
