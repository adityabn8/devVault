# DevVault — Complete Application Specification

> **Purpose:** This document is a complete, unambiguous specification for building DevVault — a developer learning tracker and resource organizer. Feed this to Claude Code to build the entire application.

---

## 1. Project Overview

**App Name:** DevVault  
**Tagline:** "Stop losing what you learn. Save, organize, and track your developer knowledge."  
**What it does:** Developers save resources (articles, videos, repos, docs, code snippets) from anywhere, organize them into vaults (folders), add personal notes and key takeaways, track learning progress, and share vaults with friends.  
**Why it exists:** Browser bookmarks become graveyards. Notion is too generic. GitHub stars are a dump. No existing tool connects "what you saved" with "what you actually learned."

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React (Create React App) | 18.x |
| UI Styling | Tailwind CSS | 3.x |
| State Management | React Context + useReducer | — |
| Routing | React Router | 6.x |
| HTTP Client | Axios | 1.x |
| Rich Text / Markdown | react-markdown + react-simplemde-editor | latest |
| Code Highlighting | react-syntax-highlighter (Prism) | latest |
| Backend | Node.js + Express | 20.x / 4.x |
| Database | MongoDB Atlas (free M0 cluster) | 7.x |
| ODM | Mongoose | 8.x |
| Authentication | Passport.js + passport-github2 + JWT | latest |
| Metadata Extraction | open-graph-scraper (for URL metadata) | latest |
| Testing (Backend) | Jest + Supertest | latest |
| Testing (Frontend) | Jest + React Testing Library | latest |
| E2E Testing | Cypress | latest |
| Linting | ESLint + Prettier | latest |
| Containerization | Docker + Docker Compose | latest |
| CI/CD | GitHub Actions | — |
| Frontend Hosting | Vercel | free tier |
| Backend Hosting | Render | free tier |

---

## 3. Folder Structure

```
devvault/
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── MobileMenu.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── resources/
│   │   │   │   ├── ResourceCard.jsx
│   │   │   │   ├── ResourceDetail.jsx
│   │   │   │   ├── ResourceForm.jsx
│   │   │   │   ├── SnippetForm.jsx
│   │   │   │   ├── ResourceGrid.jsx
│   │   │   │   ├── ResourceFilters.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   ├── vaults/
│   │   │   │   ├── VaultCard.jsx
│   │   │   │   ├── VaultForm.jsx
│   │   │   │   └── VaultSelector.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCards.jsx
│   │   │   │   ├── LearningStreak.jsx
│   │   │   │   ├── RecentActivity.jsx
│   │   │   │   └── ContinueLearning.jsx
│   │   │   ├── search/
│   │   │   │   ├── SearchModal.jsx
│   │   │   │   └── SearchResults.jsx
│   │   │   └── common/
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── ConfirmDialog.jsx
│   │   │       ├── Toast.jsx
│   │   │       ├── TagInput.jsx
│   │   │       └── MarkdownEditor.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Vaults.jsx
│   │   │   ├── VaultDetail.jsx
│   │   │   ├── ResourceDetailPage.jsx
│   │   │   ├── AddResource.jsx
│   │   │   ├── SharedVault.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useResources.js
│   │   │   ├── useVaults.js
│   │   │   ├── useSearch.js
│   │   │   └── useKeyboardShortcut.js
│   │   ├── services/
│   │   │   ├── api.js               # Axios instance with interceptors
│   │   │   ├── authService.js
│   │   │   ├── resourceService.js
│   │   │   ├── vaultService.js
│   │   │   ├── dashboardService.js
│   │   │   └── profileService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── formatters.js
│   │   │   └── validators.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css                # Tailwind imports
│   ├── cypress/
│   │   ├── e2e/
│   │   │   ├── auth.cy.js
│   │   │   ├── dashboard.cy.js
│   │   │   ├── resources.cy.js
│   │   │   ├── vaults.cy.js
│   │   │   └── search.cy.js
│   │   └── support/
│   │       └── commands.js
│   ├── Dockerfile
│   ├── .eslintrc.json
│   ├── .prettierrc
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   ├── passport.js              # GitHub OAuth strategy
│   │   └── constants.js
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification middleware
│   │   ├── errorHandler.js          # Global error handler
│   │   ├── rateLimit.js             # Rate limiting
│   │   └── validate.js              # Request validation middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Resource.js
│   │   ├── Vault.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── resources.js
│   │   ├── vaults.js
│   │   ├── dashboard.js
│   │   ├── search.js
│   │   └── profile.js
│   ├── services/
│   │   ├── metadataService.js       # URL metadata extraction
│   │   └── activityService.js       # Activity logging
│   ├── validators/
│   │   ├── resourceValidator.js
│   │   └── vaultValidator.js
│   ├── __tests__/
│   │   ├── auth.test.js
│   │   ├── resources.test.js
│   │   ├── vaults.test.js
│   │   ├── dashboard.test.js
│   │   └── search.test.js
│   ├── app.js                       # Express app (no listen — for testing)
│   ├── index.js                     # Entry point (calls app.listen)
│   ├── Dockerfile
│   ├── .eslintrc.json
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 4. Database Schema

### 4.1 `users` collection

```javascript
const userSchema = new mongoose.Schema({
  githubId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: null
  },
  avatarUrl: {
    type: String,
    required: true
  },
  bio: {
    type: String,
    default: ""
  },
  profileUrl: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
    // IMPORTANT: encrypt this field before storing using crypto.createCipheriv
  },
  preferences: {
    defaultVaultView: {
      type: String,
      enum: ["grid", "list"],
      default: "grid"
    },
    learningReminder: {
      type: Boolean,
      default: false
    }
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true  // adds createdAt, updatedAt
});
```

### 4.2 `vaults` collection

```javascript
const vaultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    default: "",
    maxlength: 200
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  color: {
    type: String,
    default: "#2563EB",
    // Must be a valid hex color from the allowed palette
    enum: ["#2563EB", "#DC2626", "#16A34A", "#9333EA", "#EA580C", "#0891B2", "#4F46E5", "#BE185D"]
  },
  icon: {
    type: String,
    default: "folder",
    // Lucide icon name
    enum: ["folder", "code", "book", "globe", "database", "server", "terminal", "cpu", "cloud", "lock"]
  },
  parentVault: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vault",
    default: null
    // null = top-level vault, ObjectId = sub-vault
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    permission: {
      type: String,
      enum: ["view", "edit"],
      default: "view"
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shareLink: {
    type: String,
    default: null
    // null = no public link, string = active share link token
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  resourceCount: {
    type: Number,
    default: 0
    // Denormalized count — update via pre/post hooks when resources are added/removed
  },
  completedCount: {
    type: Number,
    default: 0
    // Denormalized count of resources with status "completed"
  }
}, {
  timestamps: true
});

// Compound index for fast lookup
vaultSchema.index({ owner: 1, parentVault: 1 });
```

### 4.3 `resources` collection

```javascript
const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  type: {
    type: String,
    required: true,
    enum: ["article", "video", "repo", "docs", "snippet", "course", "other"]
  },
  // --- URL-based resource fields ---
  url: {
    type: String,
    default: null
    // Required for all types EXCEPT "snippet"
    // Validated as a proper URL when present
  },
  metadata: {
    description: { type: String, default: "" },
    siteName: { type: String, default: "" },
    favicon: { type: String, default: "" },
    thumbnail: { type: String, default: "" },
    // Auto-extracted from URL using open-graph-scraper
  },
  // --- Snippet-specific fields ---
  snippet: {
    code: {
      type: String,
      default: null
      // Required when type is "snippet"
    },
    language: {
      type: String,
      default: null,
      // e.g., "javascript", "python", "bash", "css", "html", "java", "typescript", "sql", "json", "yaml"
    }
  },
  // --- Organization ---
  vault: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vault",
    required: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
    // Max 10 tags per resource
  }],
  // --- Learning Progress ---
  status: {
    type: String,
    enum: ["to_read", "in_progress", "completed"],
    default: "to_read"
  },
  notes: {
    type: String,
    default: ""
    // Markdown content — user's personal notes about this resource
  },
  keyTakeaways: [{
    type: String,
    trim: true
    // Short bullet points — max 10 takeaways, each max 300 chars
  }],
  // --- Tracking ---
  lastOpenedAt: {
    type: Date,
    default: null
    // Updated every time user opens/views this resource
  },
  completedAt: {
    type: Date,
    default: null
    // Set when status changes to "completed"
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
    // For shared vaults — who added this resource
    // null means same as owner
  }
}, {
  timestamps: true
});

// Text index for full-text search
resourceSchema.index({
  title: "text",
  notes: "text",
  "snippet.code": "text",
  tags: "text",
  keyTakeaways: "text"
});

// Compound indexes for common queries
resourceSchema.index({ owner: 1, vault: 1 });
resourceSchema.index({ owner: 1, status: 1 });
resourceSchema.index({ owner: 1, tags: 1 });
```

### 4.4 `activities` collection

```javascript
const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      "resource_saved",
      "resource_completed",
      "resource_deleted",
      "snippet_added",
      "notes_updated",
      "vault_created",
      "vault_shared",
      "status_changed"
    ]
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resource",
    default: null
  },
  vaultId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vault",
    default: null
  },
  details: {
    type: String,
    default: ""
    // Human-readable description, e.g., "Saved 'Docker Networking' to Docker vault"
  }
}, {
  timestamps: true
});

// Index for activity feed queries
activitySchema.index({ user: 1, createdAt: -1 });
// TTL index: auto-delete activities older than 90 days
activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

---

## 5. API Specification

**Base URL:** `/api`  
**Auth:** All protected routes require `Authorization: Bearer <jwt_token>` header.  
**Error format:** Every error response uses this shape:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

**Error codes:**
| Code | HTTP Status | When |
|------|-------------|------|
| UNAUTHORIZED | 401 | Missing or invalid JWT |
| FORBIDDEN | 403 | Accessing another user's resource they don't have permission for |
| NOT_FOUND | 404 | Resource/vault doesn't exist |
| VALIDATION_ERROR | 422 | Invalid input data |
| DUPLICATE | 409 | Duplicate vault name for same user |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

### 5.1 Authentication Routes

**`GET /api/auth/github`**
- Auth: No
- Action: Redirects browser to GitHub OAuth authorization page
- GitHub OAuth scopes requested: `read:user`, `user:email`

**`GET /api/auth/github/callback`**
- Auth: No
- Action: GitHub redirects here after user authorizes. Passport.js handles the callback.
- On success: Creates/updates user in DB, generates JWT, sets `token` as HTTP-only cookie (maxAge: 7 days), redirects to `CLIENT_URL/dashboard`
- On failure: Redirects to `CLIENT_URL/login?error=auth_failed`

**`POST /api/auth/logout`**
- Auth: Yes
- Action: Clears the JWT cookie
- Response: `{ "message": "Logged out successfully" }`

**`GET /api/auth/me`**
- Auth: Yes
- Response:
```json
{
  "user": {
    "_id": "ObjectId",
    "username": "adityabn",
    "displayName": "Aditya Nagathan",
    "email": "aditya@email.com",
    "avatarUrl": "https://avatars.githubusercontent.com/...",
    "bio": "Frontend developer...",
    "profileUrl": "https://github.com/adityabn",
    "preferences": {
      "defaultVaultView": "grid",
      "learningReminder": false
    },
    "onboardingCompleted": true,
    "createdAt": "2026-03-15T..."
  }
}
```

---

### 5.2 Vault Routes

**`GET /api/vaults`**
- Auth: Yes
- Query params:
  - `parent` (optional): ObjectId — get sub-vaults of a parent. If omitted, returns top-level vaults.
  - `includeShared` (optional): `true`/`false` — include vaults shared with this user. Default: `true`
- Response:
```json
{
  "vaults": [
    {
      "_id": "ObjectId",
      "name": "Docker",
      "description": "Everything Docker",
      "color": "#2563EB",
      "icon": "server",
      "parentVault": null,
      "isOwner": true,
      "resourceCount": 12,
      "completedCount": 5,
      "subVaultCount": 2,
      "updatedAt": "2026-03-15T..."
    },
    {
      "_id": "ObjectId",
      "name": "CI/CD Shared",
      "description": "Shared by Rahul",
      "color": "#16A34A",
      "icon": "folder",
      "parentVault": null,
      "isOwner": false,
      "permission": "view",
      "sharedBy": {
        "username": "rahul-dev",
        "avatarUrl": "..."
      },
      "resourceCount": 8,
      "completedCount": 3,
      "subVaultCount": 0,
      "updatedAt": "2026-03-14T..."
    }
  ]
}
```

**`POST /api/vaults`**
- Auth: Yes
- Body:
```json
{
  "name": "Docker",              // required, 1-50 chars, unique per user+parent combination
  "description": "Everything Docker related",  // optional, max 200 chars
  "color": "#2563EB",            // optional, must be from allowed palette
  "icon": "server",              // optional, must be from allowed icons
  "parentVault": null            // optional, ObjectId of parent vault or null
}
```
- Validation rules:
  - `name` is required, trimmed, 1-50 characters
  - No two vaults with the same `name` under the same `parent` for the same `owner`
  - If `parentVault` is provided, it must exist and be owned by the same user
  - Max depth: 2 levels (top-level → sub-vault, no sub-sub-vaults)
  - Max 20 top-level vaults per user
- Response: `201` with the created vault object
- Activity logged: `vault_created`

**`PUT /api/vaults/:id`**
- Auth: Yes (owner only)
- Body: Same fields as POST (all optional, only provided fields are updated)
- Validation: Same as POST. Cannot change `parentVault` after creation.
- Response: `200` with the updated vault object

**`DELETE /api/vaults/:id`**
- Auth: Yes (owner only)
- Behavior:
  - If vault has resources: return `422` with `"Cannot delete vault with resources. Move or delete resources first."`
  - If vault has sub-vaults: return `422` with `"Cannot delete vault with sub-vaults. Delete sub-vaults first."`
  - Otherwise: delete the vault
- Response: `200` with `{ "message": "Vault deleted" }`

**`POST /api/vaults/:id/share`**
- Auth: Yes (owner only)
- Body:
```json
{
  "username": "rahul-dev",        // GitHub username to share with
  "permission": "view"            // "view" or "edit"
}
```
- Validation:
  - User must exist in the system
  - Cannot share with yourself
  - Cannot share a sub-vault (only top-level vaults)
  - Max 10 collaborators per vault
- Response: `200` with updated vault object
- Activity logged: `vault_shared`

**`DELETE /api/vaults/:id/share/:userId`**
- Auth: Yes (owner only)
- Action: Removes a collaborator from the vault
- Response: `200` with `{ "message": "Collaborator removed" }`

**`POST /api/vaults/:id/share-link`**
- Auth: Yes (owner only)
- Action: Generates a public share link token (UUID v4)
- Response: `200` with `{ "shareLink": "https://devvault.app/shared/abc-123-def" }`

**`DELETE /api/vaults/:id/share-link`**
- Auth: Yes (owner only)
- Action: Deactivates the public share link
- Response: `200` with `{ "message": "Share link deactivated" }`

**`GET /api/shared/:token`**
- Auth: No
- Action: Returns read-only vault data for the public share link
- Response: Vault object with its resources (no edit capabilities)

---

### 5.3 Resource Routes

**`GET /api/resources`**
- Auth: Yes
- Query params:
  - `vault` (required): ObjectId — which vault to get resources from
  - `status` (optional): `to_read` | `in_progress` | `completed`
  - `type` (optional): `article` | `video` | `repo` | `docs` | `snippet` | `course` | `other`
  - `tag` (optional): string — filter by tag
  - `sort` (optional): `newest` (default) | `oldest` | `last_opened` | `title_asc` | `title_desc`
  - `page` (optional): number, default 1
  - `limit` (optional): number, default 20, max 50
- Response:
```json
{
  "resources": [
    {
      "_id": "ObjectId",
      "title": "Understanding Docker Networking",
      "type": "article",
      "url": "https://dev.to/...",
      "metadata": {
        "description": "A deep dive into Docker networking...",
        "siteName": "DEV Community",
        "favicon": "https://dev.to/favicon.ico",
        "thumbnail": "https://dev.to/image.jpg"
      },
      "snippet": null,
      "vault": "ObjectId",
      "tags": ["docker", "networking"],
      "status": "completed",
      "notes": "Great explanation of bridge vs host...",
      "keyTakeaways": ["Bridge network is default", "Use custom bridge in production"],
      "lastOpenedAt": "2026-03-14T...",
      "completedAt": "2026-03-14T...",
      "addedBy": null,
      "createdAt": "2026-03-12T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "pages": 1
  }
}
```

**`POST /api/resources`**
- Auth: Yes
- Body (URL-based resource):
```json
{
  "url": "https://dev.to/some-article",  // required for non-snippet types
  "vault": "ObjectId",                    // required
  "tags": ["docker", "networking"],       // optional, max 10 tags, each max 30 chars
  "status": "to_read",                    // optional, default "to_read"
  "notes": ""                             // optional
}
```
- Body (code snippet):
```json
{
  "title": "Express error handler pattern",  // required
  "type": "snippet",                          // required
  "vault": "ObjectId",                        // required
  "snippet": {
    "code": "app.use((err, req, res, next) => { ... })",  // required for snippets
    "language": "javascript"                               // required for snippets
  },
  "tags": ["express", "error-handling"],
  "notes": "Use this pattern in every Express app"
}
```
- **Behavior for URL-based resources:**
  1. Server receives URL
  2. Server calls `metadataService.extractMetadata(url)` using `open-graph-scraper`
  3. Extracts: title (og:title or page title), description (og:description), siteName (og:site_name), favicon, thumbnail (og:image)
  4. Auto-detects `type` based on URL domain:
     - github.com → `repo`
     - youtube.com, youtu.be → `video`
     - docs.*, developer.* → `docs`
     - udemy.com, coursera.org, frontendmasters.com → `course`
     - Everything else → `article`
  5. User can override the auto-detected `type` and `title`
  6. Resource is saved to DB
- Validation rules:
  - `vault` must exist and user must have edit access (owner or edit collaborator)
  - `url` is required for all types except `snippet`
  - `snippet.code` and `snippet.language` are required when type is `snippet`
  - Duplicate URL check: if same URL already exists in the same vault, return `409` with `"This URL is already saved in this vault"`
  - Tags: max 10, each tag max 30 chars, auto-lowercase, auto-trim
- Response: `201` with the created resource object
- Side effects:
  - Increment `vault.resourceCount` by 1
  - Log activity: `resource_saved` or `snippet_added`

**`GET /api/resources/:id`**
- Auth: Yes (owner or vault collaborator)
- Action: Returns full resource detail
- Side effect: Updates `lastOpenedAt` to current timestamp
- Response: Full resource object

**`PUT /api/resources/:id`**
- Auth: Yes (owner or edit collaborator)
- Body: Any resource fields (all optional, only provided fields updated)
- Special behavior:
  - If `status` changes to `completed`: set `completedAt` to now, increment `vault.completedCount`
  - If `status` changes from `completed` to something else: set `completedAt` to null, decrement `vault.completedCount`
  - If `notes` changes: log activity `notes_updated`
  - If `status` changes: log activity `status_changed`
- Response: `200` with updated resource

**`DELETE /api/resources/:id`**
- Auth: Yes (owner or edit collaborator who added this resource)
- Side effects:
  - Decrement `vault.resourceCount` by 1
  - If resource was completed, decrement `vault.completedCount` by 1
  - Log activity: `resource_deleted`
- Response: `200` with `{ "message": "Resource deleted" }`

**`POST /api/resources/extract-metadata`**
- Auth: Yes
- Body: `{ "url": "https://dev.to/..." }`
- Action: Extracts metadata from URL without saving anything
- Purpose: Used by the frontend to preview metadata before saving
- Response:
```json
{
  "title": "Understanding Docker Networking",
  "description": "A deep dive into...",
  "siteName": "DEV Community",
  "favicon": "https://dev.to/favicon.ico",
  "thumbnail": "https://dev.to/image.jpg",
  "suggestedType": "article"
}
```

**`PUT /api/resources/:id/move`**
- Auth: Yes (owner only)
- Body: `{ "vault": "ObjectId" }` — the target vault ID
- Action: Moves resource from current vault to target vault
- Side effects: Update `resourceCount` and `completedCount` on both vaults
- Response: `200` with updated resource

---

### 5.4 Dashboard Routes

**`GET /api/dashboard/stats`**
- Auth: Yes
- Response:
```json
{
  "stats": {
    "totalResources": 47,
    "completedResources": 28,
    "totalSnippets": 12,
    "totalVaults": 6,
    "resourcesThisWeek": 7,
    "completedThisWeek": 4,
    "notesWordsThisWeek": 320,
    "currentStreak": 5,
    "longestStreak": 14
  }
}
```
- **Streak calculation:** A day counts as "active" if the user performed any of these on that day: saved a resource, completed a resource, added a snippet, or updated notes. Streak = consecutive days of activity counting backward from today. If today has no activity yet, check from yesterday.

**`GET /api/dashboard/heatmap`**
- Auth: Yes
- Query: `days` (optional, default 90, max 365)
- Response:
```json
{
  "heatmap": [
    { "date": "2026-03-15", "count": 3 },
    { "date": "2026-03-14", "count": 1 },
    { "date": "2026-03-13", "count": 0 },
    ...
  ]
}
```
- `count` = number of activities on that day (from activities collection)

**`GET /api/dashboard/activity`**
- Auth: Yes
- Query: `limit` (optional, default 20, max 50)
- Response:
```json
{
  "activities": [
    {
      "_id": "ObjectId",
      "action": "resource_saved",
      "details": "Saved 'Docker Networking' to Docker vault",
      "resourceId": "ObjectId",
      "vaultId": "ObjectId",
      "createdAt": "2026-03-15T10:30:00Z"
    }
  ]
}
```

**`GET /api/dashboard/continue`**
- Auth: Yes
- Action: Returns up to 5 resources with status `in_progress`, sorted by `lastOpenedAt` descending
- Response: Array of resource objects (same shape as resource detail)

---

### 5.5 Search Routes

**`GET /api/search`**
- Auth: Yes
- Query params:
  - `q` (required): search query string, min 2 chars
  - `type` (optional): filter by resource type
  - `vault` (optional): filter by vault ID
  - `limit` (optional): default 20, max 50
- **Search behavior:**
  1. Uses MongoDB text index to search across: title, notes, snippet.code, tags, keyTakeaways
  2. Only returns resources owned by the user OR in vaults shared with the user
  3. Results sorted by text relevance score
- Response:
```json
{
  "results": [
    {
      "_id": "ObjectId",
      "title": "Docker Networking Guide",
      "type": "article",
      "vault": {
        "_id": "ObjectId",
        "name": "Docker"
      },
      "tags": ["docker", "networking"],
      "status": "completed",
      "matchedField": "title",
      "createdAt": "2026-03-12T..."
    }
  ],
  "total": 3,
  "query": "docker network"
}
```

**`GET /api/search/tags`**
- Auth: Yes
- Query: `q` (optional) — prefix to autocomplete
- Action: Returns all unique tags used by the user, sorted by frequency
- Response:
```json
{
  "tags": [
    { "name": "docker", "count": 8 },
    { "name": "react", "count": 15 },
    { "name": "css", "count": 5 }
  ]
}
```

---

### 5.6 Profile Routes

**`GET /api/profile`**
- Auth: Yes
- Response: Full user object (same as `/api/auth/me`)

**`PUT /api/profile/preferences`**
- Auth: Yes
- Body:
```json
{
  "defaultVaultView": "list",
  "learningReminder": true
}
```
- Response: Updated user object

**`PUT /api/profile/onboarding`**
- Auth: Yes
- Body: `{ "completed": true }`
- Response: Updated user object

**`DELETE /api/profile`**
- Auth: Yes
- Action: Permanently deletes:
  1. All resources owned by user
  2. All vaults owned by user
  3. All activities by user
  4. Remove user from all shared vaults' `sharedWith` arrays
  5. Delete user record
- Response: `200` with `{ "message": "Account deleted" }`
- Side effect: Clear JWT cookie

**`GET /api/health`**
- Auth: No
- Response: `{ "status": "ok", "timestamp": "2026-03-15T..." }`

---

## 6. Pages — Detailed Specifications

### 6.1 Login Page (`/`)

**Layout:**
- Centered card on a light gray background
- DevVault logo (text-based: "DevVault" in bold + a small vault/box icon) at the top
- Tagline below: "Stop losing what you learn."
- One button: "Continue with GitHub" (GitHub icon + text, black background, white text)
- Below button: "Free forever. No credit card needed."
- If URL has `?error=auth_failed`, show a red banner: "Authentication failed. Please try again."

**Behavior:**
- If user is already authenticated (valid JWT cookie), redirect to `/dashboard`
- Clicking "Continue with GitHub" navigates to `API_URL/auth/github`

---

### 6.2 Dashboard Page (`/dashboard`)

**Layout (top to bottom):**

1. **Greeting bar:** "Good morning, Aditya" (time-based greeting) + today's date
   - If `learningReminder` is ON and user hasn't saved/completed anything today: show a subtle blue banner "You haven't learned anything new today — keep your streak alive!"

2. **Stats cards row** (4 cards in a horizontal row, wrap on mobile):
   - Card 1: "Resources Saved" — large number + "X this week" in smaller text
   - Card 2: "Completed" — large number + "X this week"
   - Card 3: "Snippets" — large number
   - Card 4: "Current Streak" — large number + "days" + small flame icon if streak >= 7

3. **Learning streak heatmap:**
   - Last 90 days, same layout as GitHub contribution graph
   - Colors: no activity = `#E5E7EB`, 1 = `#BBF7D0`, 2-3 = `#4ADE80`, 4+ = `#16A34A`
   - Tooltip on hover: "3 activities on Mar 14, 2026"
   - Below heatmap: "Longest streak: 14 days"

4. **Two-column layout below heatmap:**

   Left column (60% width):
   - **"Recent Activity"** feed (last 15 activities)
   - Each item: activity icon + description + relative timestamp ("2 hours ago")
   - "View all" link at bottom (scrolls or paginates)

   Right column (40% width):
   - **"Continue Learning"** section
   - Shows up to 5 resources with status `in_progress`
   - Each: title, vault name badge, type icon, "last opened 2 days ago"
   - "Resume" button → navigates to resource detail page
   - If empty: "Nothing in progress. Start learning!" with link to vaults

---

### 6.3 Vaults Page (`/vaults`)

**Layout:**

1. **Header row:** "My Vaults" title + "+ Create Vault" button (right side)

2. **Vault grid** (responsive: 3 columns desktop, 2 tablet, 1 mobile):
   Each vault card shows:
   - Colored left border (vault's color)
   - Icon + vault name (bold)
   - Description (truncated to 1 line)
   - Progress bar: `completedCount / resourceCount` with percentage
   - "12 resources • 5 completed"
   - Sub-vault indicator: "2 sub-vaults" if any
   - If shared: small avatar(s) of collaborators in bottom-right corner

3. **Shared Vaults section** (below "My Vaults" if any exist):
   - "Shared with Me" heading
   - Same card layout but with "Shared by [username]" badge
   - Permission badge: "Can view" or "Can edit"

4. **Clicking a vault** → navigates to `/vaults/:id`

5. **Create Vault Modal** (opens when "+ Create Vault" is clicked):
   - Name input (required)
   - Description textarea (optional)
   - Color picker (8 color circles to choose from)
   - Icon picker (10 icon options displayed as a grid)
   - Parent vault dropdown: "None (top-level)" or list of existing top-level vaults
   - "Create" button + "Cancel" button

---

### 6.4 Vault Detail Page (`/vaults/:id`)

**Layout:**

1. **Breadcrumb:** Vaults > Docker > Docker Networking (if sub-vault)

2. **Vault header:**
   - Icon + vault name (large, bold)
   - Description
   - Progress: "5 of 12 completed (41%)" with progress bar
   - Action buttons (right side):
     - "Add Resource" (primary button)
     - "Share" (opens share modal)
     - "Edit" (opens edit vault modal)
     - "Delete" (red, with confirmation)
   - If viewing shared vault: show "Shared by [username]" + permission badge instead of Edit/Delete

3. **Sub-vaults row** (if any):
   - Horizontal scrollable row of sub-vault chips/mini-cards
   - Clicking one navigates to that sub-vault
   - "+ Sub-vault" chip at the end

4. **Filters bar:**
   - Status filter: All | To Read | In Progress | Completed (tab-style buttons)
   - Type filter: All | Articles | Videos | Repos | Snippets | Docs | Courses
   - Sort dropdown: Newest | Oldest | Last Opened | Title A-Z | Title Z-A
   - View toggle: Grid / List (saves to user preferences)

5. **Resources grid/list:**
   Grid view (default):
   - Cards with: thumbnail (or type icon if no thumbnail), title (truncated 2 lines), source favicon + site name, tags (max 3 shown + "+N more"), status badge, relative date
   - Clicking a card → navigates to `/resources/:id`

   List view:
   - Compact rows: type icon, title, site name, tags, status badge, date
   - Clicking a row → navigates to `/resources/:id`

6. **Empty state:** "This vault is empty. Add your first resource!" with "Add Resource" button

---

### 6.5 Add Resource Page (`/add`)

**Layout — Two tabs at the top: "Save URL" and "Code Snippet"**

**Tab 1: Save URL**
1. URL input field (large, prominent) with "Paste a URL" placeholder
2. "Extract" button next to the input
3. After clicking Extract:
   - Loading spinner while metadata is fetched
   - Preview card appears showing: extracted thumbnail, title (editable), description, site name
   - Below preview:
     - Type dropdown (pre-selected based on URL, user can change)
     - Vault selector dropdown (required)
     - Tag input (type and press Enter to add tags, shows as chips)
     - Status: radio buttons — To Read (default) | In Progress | Completed
     - Notes: markdown editor (optional)
   - "Save to DevVault" button
4. Success: green toast "Resource saved to [vault name]!" + form resets
5. Error: red text below the field that failed validation

**Tab 2: Code Snippet**
1. Title input (required)
2. Language dropdown (required): JavaScript, TypeScript, Python, Java, HTML, CSS, Bash, SQL, JSON, YAML, Other
3. Code editor (monospace font, line numbers, syntax highlighting, min 5 rows)
4. Vault selector dropdown (required)
5. Tag input
6. Notes: markdown editor (optional)
7. "Save Snippet" button

---

### 6.6 Resource Detail Page (`/resources/:id`)

**Layout:**

1. **Back button:** "← Back to [Vault Name]"

2. **Resource header:**
   - Type icon + title (large)
   - Source: favicon + site name + external link icon (clicking opens URL in new tab)
   - Status: dropdown to change status inline (To Read → In Progress → Completed)
   - Tags: shown as chips + "Edit tags" pencil icon
   - Vault: shown as a badge with link to vault
   - Dates: "Saved Mar 12 • Last opened Mar 14 • Completed Mar 14"
   - If snippet: show language badge

3. **If URL resource:** "Open Resource" large button → opens URL in new tab + updates `lastOpenedAt`

4. **If snippet:** Code block with syntax highlighting and "Copy" button

5. **Key Takeaways section:**
   - Bullet list of existing takeaways
   - "Add takeaway" input at the bottom (type and press Enter)
   - Each takeaway has a delete (X) button on hover
   - Max 10 takeaways. If 10 reached, input is disabled with message "Max 10 takeaways"

6. **Notes section:**
   - Markdown editor (simplemde)
   - Auto-saves after 2 seconds of inactivity (debounced)
   - Shows "Saving..." indicator while saving, "Saved" checkmark after
   - Rendered markdown preview toggle

7. **Danger zone** (bottom):
   - "Delete Resource" red button
   - Confirmation dialog: "Delete '[title]'? This cannot be undone."
   - "Move to..." button → opens vault selector modal

---

### 6.7 Profile Page (`/profile`)

**Layout:**

1. **GitHub Info (read-only):**
   - Large avatar (120px circular)
   - Display name + username (@adityabn)
   - Bio
   - "View GitHub Profile" link

2. **DevVault Stats:**
   - Member since: Mar 15, 2026
   - Total resources: 47
   - Total vaults: 6
   - Learning streak record: 14 days

3. **Preferences:**
   - Default vault view: Grid / List radio toggle
   - Learning reminder: toggle switch
   - "Save Preferences" button → green toast "Preferences saved!"

4. **Danger Zone (red border section):**
   - "Delete Account" button
   - Dialog: "This will permanently delete your DevVault account, all vaults, and all resources. Your GitHub account will not be affected."
   - Must type "DELETE" to confirm
   - "Confirm Deletion" button (only enabled when input === "DELETE")

---

### 6.8 Shared Vault Page (`/shared/:token`)

**Layout:**
- Read-only view of a vault
- Banner at top: "This vault is shared by [username]. Sign in to save resources to your own vaults."
- Same layout as Vault Detail but:
  - No edit/delete buttons
  - No status changes
  - No add resource
  - Resources are view-only (can click URLs to open but can't modify)
- If token is invalid: "This share link is invalid or has been deactivated."

---

### 6.9 Search (Global — Modal)

**Trigger:** Cmd+K (Mac) or Ctrl+K (Windows) OR clicking search icon in navbar

**Layout:**
- Full-screen overlay with centered modal (600px wide)
- Search input at top with magnifying glass icon, auto-focused
- Results appear below as user types (debounced 300ms)
- Results grouped by type:
  - Articles (2)
  - Snippets (1)
  - Videos (1)
- Each result: type icon, title, vault badge, tags, status badge
- Clicking a result: closes modal, navigates to `/resources/:id`
- Press Escape or click outside: closes modal
- "No results for '[query]'" if nothing found

---

## 7. Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Desktop | 1024px+ | Sidebar navigation (collapsible), multi-column grids |
| Tablet | 768px–1023px | Top navbar, 2-column grids |
| Mobile | below 768px | Hamburger menu, single column, stacked cards |

---

## 8. Navigation

**Desktop (1024px+):**
- Left sidebar (240px width, collapsible to 64px icon-only):
  - DevVault logo at top
  - Nav items (with icons): Dashboard, My Vaults, Add Resource
  - Divider
  - "Quick Access" section: list of pinned/recent vaults
  - Bottom: user avatar + name, logout button
  - Cmd+K search button

**Tablet/Mobile:**
- Top navbar: hamburger menu icon (left), DevVault logo (center), avatar (right)
- Hamburger opens a slide-out drawer with same nav items as sidebar
- Search icon in navbar opens search modal

---

## 9. Design System

### Colors
```
Primary:       #2563EB (blue-600)
Primary hover: #1D4ED8 (blue-700)
Success:       #16A34A (green-600)
Warning:       #D97706 (amber-600)
Error:         #DC2626 (red-600)
Background:    #F9FAFB (gray-50)
Surface:       #FFFFFF
Border:        #E5E7EB (gray-200)
Text primary:  #111827 (gray-900)
Text secondary:#6B7280 (gray-500)
Text muted:    #9CA3AF (gray-400)
```

### Typography (Tailwind classes)
```
Font family:   Inter (import from Google Fonts)
H1:            text-2xl font-semibold (24px, 600)
H2:            text-xl font-semibold (20px, 600)
H3:            text-lg font-medium (18px, 500)
Body:          text-sm font-normal (14px, 400)
Small:         text-xs font-normal (12px, 400)
Code:          font-mono text-sm (JetBrains Mono or Fira Code)
```

### Component Patterns
```
Cards:         bg-white rounded-lg border border-gray-200 shadow-sm p-4
Buttons (primary): bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium
Buttons (secondary): bg-white border border-gray-300 hover:bg-gray-50 rounded-lg px-4 py-2 text-sm
Buttons (danger): bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm
Inputs:        border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500
Badges:        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
Toast:         fixed bottom-4 right-4, auto-dismiss after 3 seconds, slide-in animation
```

---

## 10. Environment Variables

### Backend (`server/.env`)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/devvault
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
JWT_SECRET=a_random_64_character_string
CLIENT_URL=http://localhost:3000
ENCRYPTION_KEY=a_random_32_character_string_for_encrypting_access_tokens
```

### Frontend (`client/.env`)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 11. Authentication Flow (Detailed)

```
1. User clicks "Continue with GitHub"
2. Browser navigates to: GET /api/auth/github
3. Server redirects to: https://github.com/login/oauth/authorize?client_id=X&scope=read:user,user:email
4. User authorizes on GitHub
5. GitHub redirects to: GET /api/auth/github/callback?code=XXXX
6. Passport.js exchanges code for access token
7. Passport.js fetches user profile from GitHub API
8. Server checks if user exists in DB (by githubId):
   - If exists: update accessToken, displayName, avatarUrl, bio
   - If not exists: create new user record
9. Server generates JWT containing: { userId: user._id }
   - Signed with JWT_SECRET
   - Expires in 7 days
10. Server sets HTTP-only cookie: token=<jwt>, maxAge=7days, secure=true (in production), sameSite=lax
11. Server redirects to: CLIENT_URL/dashboard
12. Frontend's AuthContext checks /api/auth/me on mount to get user data
13. All subsequent API calls include the cookie automatically
```

---

## 12. Rate Limiting

```javascript
// Global rate limit
app.use(rateLimit({
  windowMs: 1 * 60 * 1000,  // 1 minute
  max: 100                    // 100 requests per minute per IP
}));

// Metadata extraction (expensive operation)
router.use('/resources/extract-metadata', rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20                     // 20 extractions per minute
}));
```

---

## 13. Implementation Order

Build the app in this exact order. Each phase should be fully functional before starting the next.

### Phase 1: Project Setup and Auth
1. Initialize monorepo: `client/` (CRA + Tailwind) and `server/` (Express + Mongoose)
2. Set up MongoDB Atlas free cluster
3. Create GitHub OAuth App (Settings → Developer Settings → OAuth Apps)
4. Implement Passport.js GitHub strategy
5. Implement JWT generation and cookie handling
6. Implement `/api/auth/*` routes
7. Implement AuthContext on frontend
8. Build Login page
9. Build ProtectedRoute component
10. Build Navbar/Sidebar (navigation skeleton)
11. Verify: user can log in with GitHub, see their name, log out

### Phase 2: Vaults (CRUD)
1. Implement Vault model
2. Implement `/api/vaults/*` routes (CRUD, no sharing yet)
3. Build Vaults page with vault grid
4. Build Create Vault modal
5. Build Vault Detail page (empty, no resources yet)
6. Verify: user can create, edit, delete vaults and navigate between them

### Phase 3: Resources (Core Feature)
1. Implement Resource model
2. Implement metadata extraction service
3. Implement `/api/resources/*` routes
4. Build Add Resource page (both tabs: URL and Snippet)
5. Build Resource cards in Vault Detail page
6. Build Resource Detail page (full view with notes, takeaways)
7. Build filters and sorting on Vault Detail page
8. Implement resource status changes and progress tracking
9. Verify: user can save URLs (with auto-metadata), save snippets, organize in vaults, track progress

### Phase 4: Dashboard
1. Implement Activity model and activity logging service
2. Add activity logging to all resource/vault operations (from Phase 2 & 3)
3. Implement `/api/dashboard/*` routes
4. Build Dashboard page: stats cards, heatmap, activity feed, continue learning
5. Implement streak calculation
6. Verify: dashboard shows real data reflecting user's activity

### Phase 5: Search
1. Create MongoDB text indexes
2. Implement `/api/search` route
3. Build Search modal (Cmd+K trigger)
4. Build tag autocomplete
5. Verify: user can search across all resources, notes, snippets, tags

### Phase 6: Sharing
1. Implement sharing endpoints on vaults
2. Build Share modal on Vault Detail page
3. Implement shared vault access logic (permission checks)
4. Build Shared Vault public page
5. Verify: user can share vaults with friends and via public link

### Phase 7: Profile and Polish
1. Build Profile page
2. Implement preferences saving
3. Implement account deletion
4. Add loading states, skeleton loaders, empty states to all pages
5. Add toast notifications for all actions
6. Add error boundaries and error states
7. Mobile responsive pass on all pages
8. Verify: full app flow works end-to-end on desktop and mobile

### Phase 8: Testing
1. Backend unit tests: auth, resources CRUD, vaults CRUD, search, dashboard stats
2. Frontend component tests: ResourceCard, VaultCard, ResourceForm, SearchModal
3. E2E tests: login flow, create vault → add resource → complete → check dashboard
4. Aim for 70%+ backend coverage, 60%+ frontend coverage

### Phase 9: Docker and CI/CD
1. Write Dockerfile for client (multi-stage: build with Node, serve with Nginx)
2. Write Dockerfile for server
3. Write docker-compose.yml
4. Write GitHub Actions workflow: lint → test → build → Docker build → deploy
5. Set up Vercel (frontend) and Render (backend) deployments
6. Configure GitHub Secrets for all environment variables
7. Set up branch protection rules
8. Verify: push to main triggers full pipeline and deploys

---

## 14. What This App Does NOT Include (Scope Boundaries)

- No browser extension (future feature — web app only for now)
- No dark mode
- No drag-and-drop to move resources between vaults
- No import/export
- No notifications (email or push)
- No real-time collaboration (no WebSockets)
- No AI features
- No mobile app
- No payment or premium tier
- No admin panel
- No undo/redo
- No resource preview/embed (just links that open in new tab)
- No offline support

---

## 15. README Template

The project README.md should include:

1. **Title + badges** (CI status, deployment status)
2. **One-line description**
3. **Screenshot** of the dashboard
4. **Features list** (bullet points)
5. **Tech stack table**
6. **Getting Started** (local development setup)
   - Prerequisites (Node 20, MongoDB Atlas account, GitHub OAuth app)
   - Clone, install, env setup, run
7. **CI/CD Pipeline** section with architecture diagram
8. **API Documentation** link or summary
9. **Project Structure** overview
10. **Contributing** guidelines
11. **License** (MIT)
