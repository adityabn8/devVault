# 📚 DevVault

> **Stop losing what you learn. Save, organize, and track your developer knowledge.**

DevVault is a full-stack web app for developers who want to actually remember what they've read. Save articles, videos, repos, docs, and code snippets into organized vaults, add personal notes and key takeaways, track your learning streaks, and share vaults with your team — all from the browser or directly via the Chrome extension.

---

## Table of Contents

- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1 · Clone the repo](#1--clone-the-repo)
  - [2 · Set up environment variables](#2--set-up-environment-variables)
  - [3 · Run the server](#3--run-the-server)
  - [4 · Run the client](#4--run-the-client)
  - [5 · Open the app](#5--open-the-app)
- [Browser extension](#browser-extension)
- [Running with Docker](#running-with-docker)
- [API overview](#api-overview)
- [Features at a glance](#features-at-a-glance)
- [Dark mode](#dark-mode)

---

## What it does

| Problem | How DevVault solves it |
|---|---|
| Browser bookmarks become a graveyard | Resources live in named, colored **Vaults** with progress tracking |
| You forget why you saved something | Every resource has **personal notes** (Markdown) and **key takeaways** |
| Hard to know what you've actually learned | **Dashboard** shows streaks, heatmap, and stats |
| You want to share reading lists | Vaults can be **shared** with team members or via a public link |
| Switching tabs just to save a link | **Browser extension** saves the current page in one click |

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Tailwind CSS 3, React Router 6 |
| Backend | Node.js 20, Express 4 |
| Database | MongoDB Atlas (free M0 tier works fine) |
| Auth | GitHub OAuth → JWT (stored as HTTP-only cookie) |
| Metadata | `open-graph-scraper` — auto-extracts title, image, description from URLs |
| Extension | Chrome MV3 (vanilla JS, no build step needed) |

---

## Project structure

```
devVault/
├── client/               # React app  (port 3000)
│   ├── src/
│   │   ├── components/   # layout/, common/, vaults/, resources/, search/
│   │   ├── context/      # AuthContext, ToastContext, ThemeContext
│   │   ├── hooks/        # useVaults, useResources, useSearch, …
│   │   ├── pages/        # Dashboard, Vaults, VaultDetail, AddResource, …
│   │   └── services/     # Axios wrappers for every API route
│   └── tailwind.config.js
│
├── server/               # Express API  (port 5000)
│   ├── config/           # db.js, passport.js
│   ├── middleware/        # auth.js, errorHandler.js, rateLimit.js
│   ├── models/           # User, Vault, Resource, Activity
│   ├── routes/           # auth, vaults, resources, dashboard, search, profile
│   ├── services/         # activityService, metadataService
│   └── validators/       # express-validator schemas
│
├── extension/            # Chrome extension (load unpacked, no build needed)
│   ├── manifest.json
│   ├── popup.html / popup.js / styles.css
│   └── background.js
│
└── docker-compose.yml    # Runs client + server together
```

---

## Getting started

### Prerequisites

Make sure you have these installed:

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm** (comes with Node)
- **MongoDB Atlas account** (free) — [mongodb.com/atlas](https://www.mongodb.com/atlas) — or a local MongoDB instance
- **GitHub OAuth App** — you need a Client ID + Secret

#### Creating a GitHub OAuth App

1. Go to **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App**
2. Fill in:
   - **Application name:** DevVault (or anything)
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:5000/api/auth/github/callback`
3. Click **Register application**
4. Copy the **Client ID** and generate a **Client Secret**

---

### 1 · Clone the repo

```bash
git clone <your-repo-url> devVault
cd devVault
```

---

### 2 · Set up environment variables

#### Server — create `server/.env`

```env
# MongoDB connection string from Atlas (or local)
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/devvault?retryWrites=true&w=majority

# GitHub OAuth (from the app you created above)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Random secret used to sign JWTs — make it long and random
JWT_SECRET=some_long_random_string_here

# URLs (leave as-is for local dev)
CLIENT_URL=http://localhost:3000
SERVER_URL=http://localhost:5000

# Environment
NODE_ENV=development
PORT=5000
```

#### Client — create `client/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### 3 · Run the server

```bash
cd server
npm install
npm run dev        # starts with nodemon, auto-restarts on file changes
```

You should see:
```
Server running on port 5000
MongoDB connected
```

---

### 4 · Run the client

Open a **second terminal**:

```bash
cd client
npm install
npm start          # starts on http://localhost:3000
```

---

### 5 · Open the app

Go to **http://localhost:3000** — click **Continue with GitHub** to log in.

That's it. You're in.

---

## Browser extension

The extension lets you save the current browser tab to DevVault in one click — without leaving the page or switching tabs. Built with Chrome Manifest V3 (MV3), no build step required.

### Files

```
extension/
├── manifest.json     # MV3 manifest — permissions, icons, popup entry
├── popup.html        # Extension popup shell (JS renders into #app)
├── popup.js          # All UI logic — auth flow, save form, tag pills
├── styles.css        # Full CSS with dark mode (prefers-color-scheme)
├── background.js     # MV3 service worker (minimal, required by MV3)
└── icons/            # Add icon16.png, icon48.png, icon128.png here
```

### Loading the extension in Chrome

1. Open **chrome://extensions** in Chrome
2. Toggle on **Developer mode** (top-right corner)
3. Click **Load unpacked**
4. Select the `extension/` folder from this project

The DevVault icon will appear in your toolbar.

> **Icons:** The extension looks for `icons/icon16.png`, `icons/icon48.png`, and `icons/icon128.png`. Create an `icons/` folder inside `extension/` and add those PNG files, or Chrome will show a blank placeholder in the toolbar.

### First-time setup

The extension authenticates by exchanging your existing web session for a long-lived token:

1. Log in to DevVault in a Chrome tab (`http://localhost:3000`)
2. Click the DevVault extension icon
3. Click **Connect to DevVault**
4. The extension calls `/api/auth/extension-token` using your browser session cookie and stores a **30-day Bearer token** in `chrome.storage.local`

You only need to do this once. The token persists across browser restarts. If it expires or is revoked, the extension shows the Connect screen again.

### Using the extension

Once connected, click the toolbar icon on any web page:

| Field | Details |
|---|---|
| **Title** | Auto-filled from the tab title, editable |
| **Vault** | Dropdown of your vaults (owner or editor access only) |
| **Tags** | Type a tag + Enter or comma to add; Backspace removes the last tag |
| **Status** | To Read / In Progress / Completed (button group) |
| **Save** | POSTs to `/api/resources`; OG metadata extracted in the background |

After saving, the success screen shows a **View in DevVault** button that opens the resource directly.

### How auth works (technical)

The web app stores the session in an HTTP-only cookie (inaccessible to JS). The extension can't read that cookie directly, but it can make a credentialed fetch to `/api/auth/extension-token` from the same browser profile — the browser attaches the cookie automatically. The server validates the session and returns a 30-day JWT, which the extension stores in `chrome.storage.local` and sends as `Authorization: Bearer <token>` on all subsequent requests.

---

## Running with Docker

If you prefer Docker instead of running the two servers manually:

```bash
# From the project root
docker compose up --build
```

- Client: http://localhost:3000
- Server: http://localhost:5000

Make sure your `.env` files are present before running.

---

## API overview

All routes are prefixed with `/api`. Authentication uses an HTTP-only cookie (`token`) for the web app and a `Authorization: Bearer <token>` header for the extension.

| Method | Route | Description |
|---|---|---|
| `GET` | `/auth/github` | Start GitHub OAuth login |
| `GET` | `/auth/me` | Get current user |
| `GET` | `/auth/extension-token` | Get 30-day token for the browser extension |
| `POST` | `/auth/logout` | Log out |
| `GET` | `/vaults` | List all vaults |
| `POST` | `/vaults` | Create a vault |
| `GET` | `/vaults/:id` | Get a single vault |
| `PUT` | `/vaults/:id` | Update a vault |
| `DELETE` | `/vaults/:id` | Delete a vault |
| `POST` | `/vaults/:id/share` | Share vault with a user |
| `POST` | `/vaults/:id/share-link` | Generate public share link |
| `GET` | `/resources` | List resources (supports filters) |
| `POST` | `/resources` | Save a new resource (URL or snippet) |
| `GET` | `/resources/:id` | Get a single resource |
| `PUT` | `/resources/:id` | Update resource (notes, tags, status, …) |
| `DELETE` | `/resources/:id` | Delete a resource |
| `GET` | `/dashboard/stats` | Learning stats |
| `GET` | `/dashboard/heatmap` | Activity heatmap data |
| `GET` | `/dashboard/activity` | Recent activity feed |
| `GET` | `/search?q=...` | Full-text search across resources |
| `GET` | `/profile` | Get profile |
| `PUT` | `/profile/preferences` | Update preferences |

---

## Features at a glance

- **Vaults** — color-coded folders with icons, sub-vaults, and progress bars
- **Resources** — save any URL; OG metadata (title, image, site name) extracted automatically
- **Code snippets** — save code with language-aware syntax highlighting
- **Notes** — per-resource Markdown notes with live autosave
- **Key takeaways** — bullet list of what you actually learned from a resource
- **Status tracking** — To Read → In Progress → Completed, with completion timestamps
- **Dashboard** — stats cards, 90-day activity heatmap, recent activity feed, "Continue Learning" quick links
- **Streak tracking** — current streak + longest streak shown on dashboard
- **Search** — full-text search across titles, notes, and tags (Ctrl+K)
- **Vault sharing** — share with a specific GitHub user (view or edit permission) or via public link
- **Dark / light mode** — auto-detects system preference, persists across sessions
- **Responsive** — full mobile support with a slide-out drawer menu
- **Browser extension** — Chrome MV3, save the current tab without leaving the page

---

## Dark mode

DevVault automatically picks up your OS preference on first visit. You can also toggle it manually using the button at the bottom of the sidebar (desktop) or in the top navbar (mobile). The choice is saved in `localStorage`.
