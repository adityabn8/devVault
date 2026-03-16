/* ── Config ─────────────────────────────────────── */
const TOKEN_KEY = 'dv_token';

let API_URL    = CONFIG.prod.apiUrl;
let CLIENT_URL = CONFIG.prod.clientUrl;

// Detect dev mode (extension loaded unpacked) and switch URLs
const envReady = new Promise(resolve => {
  chrome.management.getSelf(info => {
    if (info.installType === 'development') {
      API_URL    = CONFIG.dev.apiUrl;
      CLIENT_URL = CONFIG.dev.clientUrl;
    }
    resolve();
  });
});

/* ── State ──────────────────────────────────────── */
let currentTab  = null;
let savedTags   = [];
let currentStatus = 'to_read';
let savedResourceId = null;

/* ── Storage helpers ────────────────────────────── */
const getToken  = async () => (await chrome.storage.local.get(TOKEN_KEY))[TOKEN_KEY] || null;
const setToken  = (t) => chrome.storage.local.set({ [TOKEN_KEY]: t });
const clearToken = () => chrome.storage.local.remove(TOKEN_KEY);

/* ── API helper ─────────────────────────────────── */
async function api(path, options = {}) {
  const token = await getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    // Use cookies only when trying to exchange web session (no stored token yet)
    credentials: token ? 'omit' : 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw Object.assign(new Error(body?.error?.message || `HTTP ${res.status}`), { status: res.status });
  }
  return res.json();
}

/* ── Utilities ──────────────────────────────────── */
const app = () => document.getElementById('app');
const esc = (str) => String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function isWebUrl(url) {
  return url && (url.startsWith('http://') || url.startsWith('https://'));
}

function hostFrom(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function faviconUrl(url) {
  try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`; } catch { return null; }
}

/* ── Entry point ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  await envReady;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTab = tab;

  if (!isWebUrl(tab?.url)) {
    renderNoPage();
    return;
  }

  renderLoading();
  const token = await getToken();

  if (token) {
    try {
      const { user } = await api('/auth/me');
      const { vaults } = await api('/vaults');
      renderSave(user, vaults);
    } catch (err) {
      if (err.status === 401) {
        await clearToken();
        renderLogin();
      } else {
        renderSave(null, []);
      }
    }
  } else {
    renderLogin();
  }
});

/* ──────────────────────────────────────────────────
   VIEWS
────────────────────────────────────────────────── */

function renderLoading() {
  app().innerHTML = `<div class="loading-view"><div class="spinner"></div></div>`;
}

function renderNoPage() {
  app().innerHTML = `
    ${header()}
    <div class="no-page-view">
      <p>Open a web page to save it to DevVault.</p>
    </div>`;
}

function renderLogin() {
  app().innerHTML = `
    <div class="login-view">
      <div class="login-logo">📚</div>
      <div class="login-title">DevVault</div>
      <div class="login-sub">Save web resources directly<br>from your browser.</div>
      <button class="btn btn-primary btn-full" id="connect-btn">Connect to DevVault</button>
      <p class="hint">Already logged in? Click Connect.<br>
        New user? <a href="#" id="open-web">Sign in at DevVault</a>
      </p>
      <p id="connect-msg" style="display:none; font-size:11px; color:var(--text-muted); margin-top:4px; text-align:center;"></p>
    </div>`;

  document.getElementById('connect-btn').onclick = handleConnect;
  document.getElementById('open-web').onclick = (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${CLIENT_URL}` });
  };
}

function renderSave(user, vaults) {
  const myVaults = (vaults || []).filter(v => v.isOwner || v.permission === 'edit');
  const favicon = faviconUrl(currentTab.url);

  app().innerHTML = `
    ${header(user)}
    <div class="page-card">
      ${favicon
        ? `<img class="page-favicon" src="${esc(favicon)}" alt="" onerror="this.style.display='none'">`
        : `<div class="page-favicon-fallback">🔗</div>`}
      <div class="page-info">
        <div class="page-title" title="${esc(currentTab.title)}">${esc(currentTab.title || 'Untitled')}</div>
        <div class="page-url">${esc(hostFrom(currentTab.url))}</div>
      </div>
    </div>

    <div class="save-form">
      <!-- Title -->
      <div class="field">
        <label class="label">Title</label>
        <input class="input" id="title-input" type="text" value="${esc(currentTab.title || '')}" placeholder="Resource title" />
      </div>

      <!-- Vault -->
      <div class="field">
        <label class="label">Vault</label>
        ${myVaults.length === 0
          ? `<div style="font-size:12px; color:var(--text-muted);">No vaults yet. <a href="#" id="open-vaults" style="color:var(--primary);">Create one</a></div>`
          : `<select class="select" id="vault-select">
               <option value="">Select a vault…</option>
               ${myVaults.map(v => `<option value="${esc(v._id)}">${esc(v.name)}</option>`).join('')}
             </select>`}
      </div>

      <!-- Tags -->
      <div class="field">
        <label class="label">Tags</label>
        <div class="tags-wrap" id="tags-wrap">
          <input class="tag-input" id="tag-input" type="text" placeholder="Add tag, press Enter…" />
        </div>
      </div>

      <!-- Status -->
      <div class="field">
        <label class="label">Status</label>
        <div class="status-group">
          <button class="status-btn active" data-status="to_read">To Read</button>
          <button class="status-btn" data-status="in_progress">In Progress</button>
          <button class="status-btn" data-status="completed">Completed</button>
        </div>
      </div>
    </div>

    <div class="save-footer">
      <div id="save-error" class="error-banner" style="display:none;"></div>
      <button class="btn btn-primary btn-full" id="save-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Save to DevVault
      </button>
    </div>`;

  // Wire up
  document.getElementById('open-vaults')?.addEventListener('click', (e) => {
    e.preventDefault(); chrome.tabs.create({ url: `${CLIENT_URL}/vaults` });
  });

  // Tag input
  const tagInput = document.getElementById('tag-input');
  tagInput.addEventListener('keydown', handleTagKeydown);
  tagInput.addEventListener('blur', () => { if (tagInput.value.trim()) addTag(tagInput.value); });

  // Status
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.dataset.status;
    });
  });

  document.getElementById('save-btn').onclick = handleSave;
}

function renderSuccess(vaultName) {
  app().innerHTML = `
    ${header()}
    <div class="success-view">
      <div class="success-icon">✓</div>
      <div class="success-title">Saved!</div>
      <div class="success-sub">Added to${vaultName ? ` <strong>${esc(vaultName)}</strong>` : ' your vault'}</div>
      <div class="success-actions">
        <button class="btn btn-secondary" id="save-another-btn">Save another</button>
        ${savedResourceId
          ? `<button class="btn btn-primary" id="view-btn">View in DevVault</button>`
          : ''}
      </div>
    </div>`;

  document.getElementById('save-another-btn').onclick = async () => {
    renderLoading();
    try {
      const { user } = await api('/auth/me');
      const { vaults } = await api('/vaults');
      savedResourceId = null;
      savedTags = [];
      currentStatus = 'to_read';
      renderSave(user, vaults);
    } catch { renderLogin(); }
  };

  document.getElementById('view-btn')?.addEventListener('click', () => {
    chrome.tabs.create({ url: `${CLIENT_URL}/resources/${savedResourceId}` });
  });
}

/* ── Shared header ──────────────────────────────── */
function header(user) {
  return `
    <div class="header">
      <div class="logo">
        <div class="logo-icon">📚</div>
        <span class="logo-text">DevVault</span>
      </div>
      <div class="header-right">
        ${user ? `
          <img class="avatar" src="${esc(user.avatarUrl)}" alt="${esc(user.displayName)}" title="${esc(user.displayName)}">
          <span class="username">@${esc(user.username)}</span>
          <button class="btn btn-ghost" id="logout-btn" title="Disconnect" style="padding:4px 6px; font-size:11px;">✕</button>
        ` : ''}
      </div>
    </div>`;
}

// Attach logout handler after any render that includes the header with a user
document.addEventListener('click', async (e) => {
  if (e.target.id === 'logout-btn') {
    await clearToken();
    savedTags = [];
    renderLogin();
  }
});

/* ── Connect flow ───────────────────────────────── */
async function handleConnect() {
  const btn = document.getElementById('connect-btn');
  const msg = document.getElementById('connect-msg');
  btn.disabled = true;
  btn.textContent = 'Connecting…';

  try {
    // Try to exchange an existing web session cookie for a Bearer token
    const res = await fetch(`${API_URL}/auth/extension-token`, { credentials: 'include' });
    if (!res.ok) throw new Error('not logged in');
    const { token, user } = await res.json();
    await setToken(token);
    renderLoading();
    const { vaults } = await api('/vaults');
    renderSave(user, vaults);
  } catch {
    btn.disabled = false;
    btn.textContent = 'Connect to DevVault';
    msg.style.display = 'block';
    msg.textContent = 'Not logged in. Opening DevVault — log in there, then click Connect again.';
    chrome.tabs.create({ url: `${CLIENT_URL}` });
  }
}

/* ── Tag handling ───────────────────────────────── */
function handleTagKeydown(e) {
  const input = e.target;
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    if (input.value.trim()) addTag(input.value);
  }
  if (e.key === 'Backspace' && !input.value && savedTags.length) {
    removeTag(savedTags[savedTags.length - 1]);
  }
}

function addTag(raw) {
  const tag = raw.trim().toLowerCase().replace(/,/g, '');
  if (!tag || savedTags.includes(tag) || savedTags.length >= 10) return;
  savedTags.push(tag);
  renderTags();
  document.getElementById('tag-input').value = '';
}

function removeTag(tag) {
  savedTags = savedTags.filter(t => t !== tag);
  renderTags();
}

function renderTags() {
  const wrap = document.getElementById('tags-wrap');
  if (!wrap) return;
  // Remove existing pills, keep the input
  wrap.querySelectorAll('.tag-pill').forEach(p => p.remove());
  const input = wrap.querySelector('.tag-input');
  savedTags.forEach(tag => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.innerHTML = `${esc(tag)}<button data-tag="${esc(tag)}" title="Remove">×</button>`;
    pill.querySelector('button').onclick = () => removeTag(tag);
    wrap.insertBefore(pill, input);
  });
}

/* ── Save ───────────────────────────────────────── */
async function handleSave() {
  const btn      = document.getElementById('save-btn');
  const errDiv   = document.getElementById('save-error');
  const title    = document.getElementById('title-input')?.value.trim();
  const vaultEl  = document.getElementById('vault-select');
  const vault    = vaultEl?.value;

  // Validate
  if (!vault) {
    showError(errDiv, 'Please select a vault.');
    return;
  }

  // Flush any pending tag text
  const tagInput = document.getElementById('tag-input');
  if (tagInput?.value.trim()) addTag(tagInput.value);

  btn.disabled = true;
  btn.innerHTML = `<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div> Saving…`;
  errDiv.style.display = 'none';

  try {
    // Get vault name for success message
    const vaultOption = vaultEl?.querySelector(`option[value="${vault}"]`);
    const vaultName   = vaultOption?.textContent || '';

    const { resource } = await api('/resources', {
      method: 'POST',
      body: JSON.stringify({
        url:    currentTab.url,
        title:  title || currentTab.title || currentTab.url,
        vault,
        type:   'article',
        tags:   savedTags,
        status: currentStatus,
      }),
    });

    savedResourceId = resource?._id || null;
    renderSuccess(vaultName);
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Save to DevVault`;
    showError(errDiv, err.message || 'Failed to save. Please try again.');
  }
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}
