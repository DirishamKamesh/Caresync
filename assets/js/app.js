/**
 * CareSync — Core Application Utilities
 * app.js: Storage layer, auth guard, toast, pagination, helpers
 */

/* ============================================================
   TAILWIND CONFIG (shared — loaded before Tailwind CDN)
   ============================================================ */
window.CS_TAILWIND_CONFIG = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container-lowest": "#ffffff",
        "inverse-primary": "#80d5cb",
        "on-background": "#181c1c",
        "surface-container-high": "#e5e9e7",
        "tertiary": "#7f4025",
        "secondary": "#545f73",
        "primary-fixed": "#9cf2e8",
        "primary-container": "#0f766e",
        "primary-fixed-dim": "#80d5cb",
        "tertiary-container": "#9c573a",
        "surface-bright": "#f7faf8",
        "background": "#f7faf8",
        "tertiary-fixed": "#ffdbce",
        "tertiary-fixed-dim": "#ffb598",
        "secondary-fixed": "#d8e3fb",
        "outline": "#6e7977",
        "secondary-container": "#d5e0f8",
        "on-surface-variant": "#3e4947",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "surface": "#f7faf8",
        "surface-container-highest": "#e0e3e1",
        "primary": "#005c55",
        "surface-container": "#ebefed",
        "surface-variant": "#e0e3e1",
        "on-primary-container": "#a3faef",
        "surface-container-low": "#f1f4f3",
        "outline-variant": "#bdc9c6",
        "on-surface": "#181c1c",
        "on-primary": "#ffffff",
        "on-secondary": "#ffffff",
        "surface-dim": "#d7dbd9",
        "on-secondary-container": "#586377",
        "on-primary-fixed": "#00201d",
        "on-primary-fixed-variant": "#00504a",
        "inverse-surface": "#2d3130",
        "on-tertiary-fixed": "#370e00",
        "on-tertiary": "#ffffff",
        "on-secondary-fixed": "#111c2d",
        "on-tertiary-fixed-variant": "#72361b",
        "secondary-fixed-dim": "#bcc7de",
        "on-tertiary-container": "#ffe5db",
        "on-secondary-fixed-variant": "#3c475a",
        "inverse-on-surface": "#eef1f0",
        "surface-tint": "#006a63",
        "on-error": "#ffffff",
        "on-error-container": "#93000a"
      },
      borderRadius: {
        DEFAULT: "0.25rem", lg: "0.5rem", xl: "0.75rem", full: "9999px"
      },
      spacing: {
        "container-padding": "24px",
        "stack-lg": "24px", "stack-sm": "4px",
        "sidebar-width": "260px", "gutter": "16px",
        "stack-md": "12px", "base": "8px"
      },
      fontFamily: {
        h2: ["Inter"], display: ["Inter"], "label-caps": ["Inter"],
        h1: ["Inter"], "body-lg": ["Inter"], "body-sm": ["Inter"], badge: ["Inter"]
      },
      fontSize: {
        h2: ["20px", { lineHeight: "1.4", fontWeight: "600" }],
        display: ["36px", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "label-caps": ["12px", { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" }],
        h1: ["24px", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-sm": ["14px", { lineHeight: "1.5", fontWeight: "400" }],
        badge: ["12px", { lineHeight: "1", fontWeight: "500" }]
      }
    }
  }
};

/* ============================================================
   STORAGE LAYER & BACKEND SYNC
   ============================================================ */
const APP_CONFIG = {
  USE_BACKEND: false, // Disabling Node.js backend for now
  USE_FIREBASE: true, // Using Firebase directly from browser
  BACKEND_URL: 'http://localhost:5000/api'
};

const KEYS = {
  USERS:        'hms_users',
  PATIENTS:     'hms_patients',
  DOCTORS:      'hms_doctors',
  APPOINTMENTS: 'hms_appointments',
  PRESCRIPTIONS:'hms_prescriptions',
  AUDIT_LOGS:   'hms_audit_logs',
  SETTINGS:     'hms_settings',
  SESSION:      'hms_session'    // sessionStorage
};

const Sync = {
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (APP_CONFIG.USE_FIREBASE) {
      const token = sessionStorage.getItem('firebase_token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },
  /**
   * Pushes data directly to Firebase Firestore from the browser
   */
  async toFirestore(key, data) {
    if (!APP_CONFIG.USE_FIREBASE || !window.FirebaseDB) return;
    
    try {
      // For MVP, we save the entire array as a single document to mirror localStorage
      // In a real app, you would save each item as a separate document
      const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
      await setDoc(doc(window.FirebaseDB, "data", key), { 
        content: data,
        updatedAt: new Date().toISOString()
      });
      console.log(`[Firestore] Saved ${key}`);
    } catch (err) {
      console.error(`[Firestore] Error saving ${key}:`, err);
    }
  },

  /**
   * Pulls data from Firestore to sync with local storage
   */
  async fromFirestore(key) {
    if (!APP_CONFIG.USE_FIREBASE || !window.FirebaseDB) return null;

    try {
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js");
      const docSnap = await getDoc(doc(window.FirebaseDB, "data", key));
      if (docSnap.exists()) {
        return docSnap.data().content;
      }
    } catch (err) {
      console.error(`[Firestore] Error fetching ${key}:`, err);
    }
    return null;
  },

  async push(key, data) {
    // Keep backend sync if user ever enables it again
    if (APP_CONFIG.USE_BACKEND) {
      this.toBackend(key, data);
    }
    
    // Always sync to Firestore if enabled
    if (APP_CONFIG.USE_FIREBASE) {
      this.toFirestore(key, data);
    }
  },
  async pullFromFirestoreAll() {
    if (!APP_CONFIG.USE_FIREBASE) return;
    console.log('[Sync] Starting Firestore to LocalStorage sync...');
    for (const key of Object.values(KEYS)) {
      const data = await this.fromFirestore(key);
      if (data) {
        localStorage.setItem(key, JSON.stringify(data));
      }
    }
    console.log('[Sync] Firestore sync complete.');
  },

  async pullAll() {
    if (APP_CONFIG.USE_BACKEND) {
       // Original backend pull logic...
       try {
         const res = await fetch(`${APP_CONFIG.BACKEND_URL}/patients`, { headers: this.getHeaders() });
         if (res.ok) {
           const json = await res.json();
           localStorage.setItem(KEYS.PATIENTS, JSON.stringify(json.data));
         }
       } catch (err) {
         console.error('[Sync] Pull failed', err);
       }
    }
    if (APP_CONFIG.USE_FIREBASE) {
      await this.pullFromFirestoreAll();
    }
  },

  async push(endpoint, method, data) {
    if (!APP_CONFIG.USE_BACKEND) return;
    try {
      await fetch(`${APP_CONFIG.BACKEND_URL}/${endpoint}`, {
        method,
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      });
    } catch (err) {
      console.error('[Sync] Push failed', err);
    }
  }
};

const Store = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  },
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
    // Background sync trigger
    if (APP_CONFIG.USE_BACKEND && Array.isArray(data) && data.length > 0) {
      const lastItem = data[data.length - 1];
      let endpoint = '';
      if (key === KEYS.PATIENTS) endpoint = 'patients';
      if (key === KEYS.DOCTORS) endpoint = 'doctors';
      if (key === KEYS.APPOINTMENTS) endpoint = 'appointments';
      if (key === KEYS.PRESCRIPTIONS) endpoint = 'prescriptions';
      if (endpoint) Sync.push(endpoint, 'POST', lastItem);
    }
  },
  getObj(key) {
    try { return JSON.parse(localStorage.getItem(key) || '{}'); }
    catch { return {}; }
  },
  setObj(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  },
  clear(key) { localStorage.removeItem(key); }
};

/* ============================================================
   SESSION / AUTH
   ============================================================ */
const Auth = {
  getSession() {
    try { return JSON.parse(sessionStorage.getItem(KEYS.SESSION) || 'null'); }
    catch { return null; }
  },
  setSession(user) {
    sessionStorage.setItem(KEYS.SESSION, JSON.stringify(user));
  },
  clearSession() {
    sessionStorage.removeItem(KEYS.SESSION);
    sessionStorage.removeItem('firebase_token');
    if (APP_CONFIG.USE_FIREBASE && window.FirebaseAuth) {
      window.FirebaseAuth.signOut(window.FirebaseAuth.auth).catch(console.error);
    }
  },
  isLoggedIn() {
    return !!this.getSession();
  },
  currentRole() {
    const s = this.getSession();
    return s ? s.role : null;
  },
  currentUser() {
    return this.getSession();
  },
  /**
   * Validate user login against backend/Firebase or local store
   */
  async loginWithGoogle(role) {
    if (!window.FirebaseAuth) return null;
    try {
      const { auth, googleProvider, signInWithPopup } = window.FirebaseAuth;
      const userCred = await signInWithPopup(auth, googleProvider);
      
      const mockUser = { 
        id: userCred.user.uid, 
        username: userCred.user.email, 
        role: role, 
        name: userCred.user.displayName || role 
      };
      
      this.setSession(mockUser);
      await Sync.pullAll();
      
      logAudit('USER_LOGIN', 'System', mockUser.id, `Google Login: ${role}`);
      return mockUser;
    } catch (err) {
      console.error('[Google Auth] Error:', err);
      return null;
    }
  },

  async login(username, password, role) {
    if (APP_CONFIG.USE_FIREBASE && window.FirebaseAuth) {
      try {
        // Ensure username is an email for Firebase
        const email = username.includes('@') ? username : `${username.toLowerCase()}@caresync.com`;
        
        const userCred = await window.FirebaseAuth.signInWithEmailAndPassword(window.FirebaseAuth.auth, email, password);
        const token = await userCred.user.getIdToken();
        sessionStorage.setItem('firebase_token', token);
        
        // Mock backend user resolution for MVP
        const mockUser = { id: userCred.user.uid, username: userCred.user.email, role: role, name: role };
        this.setSession(mockUser);
        
        // Pull cloud data from Firestore on login
        await Sync.pullAll();
        
        logAudit('USER_LOGIN', 'System', mockUser.id, `Firebase Login: ${role}`);
        return mockUser;
      } catch (err) {
        console.error('[Firebase Auth] Error:', err);
        return null; // Fallback to local if you want, but typically fail here
      }
    }

    // Local MVP Auth
    const users = Store.get(KEYS.USERS);
    const user = users.find(u => 
      u.username.toLowerCase() === username.toLowerCase() && 
      u.password === password &&
      u.role === role
    );
    if (user) {
      this.setSession(user);
      logAudit('USER_LOGIN', 'System', user.id, `Local Login: ${role}`);
    }
    return user || null;
  },


  logout() {
    this.clearSession();
    window.location.href = 'login.html';
  }
};

/* ============================================================
   ROUTE GUARD
   ============================================================ */
function guardRoute(allowedRoles) {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  const role = Auth.currentRole();
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own dashboard
    const redirects = { Admin: 'admin-dashboard.html', Doctor: 'doctor-dashboard.html', Patient: 'patient-dashboard.html' };
    window.location.href = redirects[role] || 'login.html';
    return false;
  }
  return true;
}

/* ============================================================
   ID GENERATORS
   ============================================================ */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function generatePatientId() {
  const year = new Date().getFullYear();
  const patients = Store.get(KEYS.PATIENTS);
  let seq = patients.length + 1;
  // Collision check
  const existing = patients.map(p => p.unique_patient_id);
  let candidate;
  do {
    candidate = `HOSP-${year}-${String(seq).padStart(4, '0')}`;
    seq++;
  } while (existing.includes(candidate));
  return candidate;
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function ensureToastContainer() {
  let el = document.getElementById('cs-toast-container');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cs-toast-container';
    document.body.appendChild(el);
  }
  return el;
}

function showToast(message, type = 'success', duration = 3500) {
  const container = ensureToastContainer();
  const icons = { success: 'check_circle', error: 'error', info: 'info', warning: 'warning' };
  const toast = document.createElement('div');
  toast.className = `cs-toast cs-toast-${type}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:20px">${icons[type] || 'info'}</span>
    <span style="flex:1">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:inherit;opacity:0.7;font-size:18px">×</button>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ============================================================
   CONFIRM DIALOG
   ============================================================ */
function confirmDialog(message, onConfirm, title = 'Confirm Action') {
  const overlay = document.createElement('div');
  overlay.className = 'cs-modal-overlay open';
  overlay.innerHTML = `
    <div class="cs-modal" style="max-width:400px">
      <div class="cs-modal-header">
        <h3 style="font-size:18px;font-weight:700;color:var(--on-surface,#181c1c)">${title}</h3>
      </div>
      <div class="cs-modal-body">
        <p style="font-size:14px;color:#3e4947">${message}</p>
      </div>
      <div class="cs-modal-footer">
        <button class="cs-btn cs-btn-outline" id="confirm-cancel">Cancel</button>
        <button class="cs-btn cs-btn-danger" id="confirm-ok">Delete</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('confirm-cancel').onclick = () => overlay.remove();
  document.getElementById('confirm-ok').onclick = () => { overlay.remove(); onConfirm(); };
}

/* ============================================================
   PAGINATION
   ============================================================ */
function paginate(data, page, pageSize = 10) {
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    items: data.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total,
    start: start + 1,
    end: Math.min(start + pageSize, total)
  };
}

function renderPaginationControls(container, pag, onPageChange) {
  container.innerHTML = '';
  const { page, totalPages, start, end, total } = pag;

  const info = document.createElement('span');
  info.style.cssText = 'font-size:13px;color:#6e7977';
  info.textContent = `Showing ${start}–${end} of ${total}`;

  const nav = document.createElement('div');
  nav.className = 'cs-pagination';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'cs-page-btn';
  prevBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">chevron_left</span>';
  prevBtn.disabled = page <= 1;
  prevBtn.onclick = () => onPageChange(page - 1);

  const nextBtn = document.createElement('button');
  nextBtn.className = 'cs-page-btn';
  nextBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px">chevron_right</span>';
  nextBtn.disabled = page >= totalPages;
  nextBtn.onclick = () => onPageChange(page + 1);

  nav.appendChild(prevBtn);

  const maxVisible = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement('button');
    btn.className = `cs-page-btn ${i === page ? 'active' : ''}`;
    btn.textContent = i;
    btn.onclick = () => onPageChange(i);
    nav.appendChild(btn);
  }

  nav.appendChild(nextBtn);

  container.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-top:1px solid #f1f4f3;flex-wrap:wrap;gap:8px';
  container.appendChild(info);
  container.appendChild(nav);
}

/* ============================================================
   SEARCH / HIGHLIGHT
   ============================================================ */
function highlightText(text, query) {
  if (!query) return escHtml(text);
  const escaped = escapeRegex(query);
  const re = new RegExp(`(${escaped})`, 'gi');
  return escHtml(text).replace(re, '<mark class="cs-highlight">$1</mark>');
}

function escHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str ?? '')));
  return div.innerHTML;
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* ============================================================
   DARK MODE
   ============================================================ */
const DarkMode = {
  init() {
    const settings = Store.getObj(KEYS.SETTINGS);
    if (settings.darkMode) document.documentElement.classList.add('dark');
    // Sync all toggles
    this._syncToggles();
  },
  toggle() {
    const isDark = document.documentElement.classList.toggle('dark');
    const settings = Store.getObj(KEYS.SETTINGS);
    settings.darkMode = isDark;
    Store.setObj(KEYS.SETTINGS, settings);
    this._syncToggles();
  },
  _syncToggles() {
    document.querySelectorAll('.cs-dark-toggle').forEach(btn => {
      btn.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'));
    });
  }
};

/* ============================================================
   STATUS BADGE RENDERER
   ============================================================ */
function statusBadge(status) {
  const map = {
    Pending:   'cs-badge-pending',
    Approved:  'cs-badge-approved',
    Rejected:  'cs-badge-rejected',
    Completed: 'cs-badge-completed'
  };
  return `<span class="cs-badge ${map[status] || ''}">${escHtml(status)}</span>`;
}

function roleBadge(role) {
  const map = {
    Admin:   'cs-badge-admin',
    Doctor:  'cs-badge-doctor',
    Patient: 'cs-badge-patient'
  };
  return `<span class="cs-badge ${map[role] || ''}" style="border-radius:9999px;border:none">${escHtml(role)}</span>`;
}

/* ============================================================
   AVATAR INITIALS
   ============================================================ */
function getInitials(name) {
  return String(name || '?').split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();
}

const AVATAR_COLORS = [
  ['#9cf2e8', '#00201d'], ['#d8e3fb', '#111c2d'], ['#ffdbce', '#370e00'],
  ['#d5e0f8', '#111c2d'], ['#e8f5e9', '#1b5e20'], ['#f3e5f5', '#4a148c']
];

function avatarEl(name, size = 38) {
  const initials = getInitials(name);
  const idx = (name || '').charCodeAt(0) % AVATAR_COLORS.length;
  const [bg, fg] = AVATAR_COLORS[idx];
  return `<div class="cs-avatar" style="background:${bg};color:${fg};width:${size}px;height:${size}px;font-size:${Math.floor(size*0.36)}px">${initials}</div>`;
}

/* ============================================================
   DATE HELPERS
   ============================================================ */
function fmtDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' +
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function fmtTime(isoStr) {
  if (!isoStr) return '—';
  return new Date(isoStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(isoStr) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

/* ============================================================
   AUDIT LOG
   ============================================================ */
function logAudit(action, entityType, entityId, details = '') {
  const session = Auth.getSession();
  if (!session) return;
  const logs = Store.get(KEYS.AUDIT_LOGS);
  logs.unshift({
    id: generateId(),
    actor_role: session.role,
    actor_username: session.username,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
    timestamp: new Date().toISOString()
  });
  // Keep last 200 logs
  Store.set(KEYS.AUDIT_LOGS, logs.slice(0, 200));
}

/* ============================================================
   SIDEBAR NAVIGATION BUILDER
   ============================================================ */
function buildNavLink(href, icon, label, isActive = false) {
  return `
    <a href="${href}" class="cs-nav-item ${isActive ? 'active' : ''}">
      <span class="material-symbols-outlined">${icon}</span>
      <span>${label}</span>
    </a>`;
}

function getSidebarConfig(role) {
  const configs = {
    Admin: [
      { href: 'admin-dashboard.html',     icon: 'dashboard',        label: 'Dashboard' },
      { href: 'admin-patients.html',       icon: 'group',            label: 'Patients' },
      { href: 'admin-doctors.html',        icon: 'medical_services', label: 'Doctors' },
      { href: 'admin-appointments.html',   icon: 'event',            label: 'Appointments' },
      { href: 'admin-reports.html',        icon: 'analytics',        label: 'Reports & Audit' }
    ],
    Doctor: [
      { href: 'doctor-dashboard.html',       icon: 'dashboard',        label: 'Dashboard' },
      { href: 'doctor-appointments.html',    icon: 'event',            label: 'Appointments' },
      { href: 'doctor-patients.html',        icon: 'group',            label: 'My Patients' },
      { href: 'doctor-prescriptions.html',   icon: 'medication',       label: 'Prescriptions' }
    ],
    Patient: [
      { href: 'patient-dashboard.html',      icon: 'dashboard',        label: 'Dashboard' },
      { href: 'patient-profile.html',        icon: 'person',           label: 'My Profile' },
      { href: 'patient-appointments.html',   icon: 'event',            label: 'Appointments' },
      { href: 'patient-prescriptions.html',  icon: 'medication',       label: 'Prescriptions' }
    ]
  };
  return configs[role] || [];
}

function renderSidebar(role, activePage) {
  const navLinks = getSidebarConfig(role);
  const links = navLinks.map(l =>
    buildNavLink(l.href, l.icon, l.label, activePage === l.href)
  ).join('');

  const user = Auth.currentUser();
  const linked = getLinkedProfile(role, user?.linkedProfileId);
  const displayName = linked?.name || user?.username || 'User';
  const displayRole = role;

  return `
    <div class="p-5 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-3 mb-3">
        ${avatarEl(displayName, 44)}
        <div>
          <p style="font-size:14px;font-weight:700;color:#181c1c" class="dark:text-white">${escHtml(displayName)}</p>
          <p style="font-size:12px;color:#005c55">${escHtml(linked?.specialisation || linked?.age && `Age ${linked.age}` || '')}</p>
        </div>
      </div>
      <div class="cs-demo-badge"><span class="material-symbols-outlined" style="font-size:14px">info</span>Demo Mode</div>
    </div>
    <nav class="flex-1 py-3 overflow-y-auto">${links}</nav>
    <div class="p-4 border-t border-slate-100 dark:border-slate-800">
      <div style="background:#f1f4f3;border-radius:10px;padding:12px;margin-bottom:12px">
        <p style="font-size:10px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:#545f73;margin-bottom:4px">SYSTEM STATUS</p>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="width:8px;height:8px;border-radius:50%;background:#22c55e"></div>
          <span style="font-size:13px;color:#181c1c">All systems active</span>
        </div>
      </div>
      <button onclick="Auth.logout()" class="cs-btn cs-btn-outline" style="width:100%;justify-content:center;gap:8px">
        <span class="material-symbols-outlined" style="font-size:18px">logout</span> Logout
      </button>
    </div>
  `;
}

function getLinkedProfile(role, linkedProfileId) {
  if (!linkedProfileId) return null;
  if (role === 'Doctor') {
    return Store.get(KEYS.DOCTORS).find(d => d.id === linkedProfileId) || null;
  }
  if (role === 'Patient') {
    return Store.get(KEYS.PATIENTS).find(p => p.id === linkedProfileId) || null;
  }
  return null;
}

/* ============================================================
   HEADER BUILDER
   ============================================================ */
function renderHeader(role, pageName) {
  const user = Auth.currentUser();
  const roleColors = { Admin: 'cs-badge-admin', Doctor: 'cs-badge-doctor', Patient: 'cs-badge-patient' };
  return `
    <button class="cs-btn-icon lg:hidden" id="sidebar-toggle" aria-label="Toggle menu">
      <span class="material-symbols-outlined">menu</span>
    </button>
    <a href="${role === 'Admin' ? 'admin-dashboard.html' : role === 'Doctor' ? 'doctor-dashboard.html' : 'patient-dashboard.html'}"
       style="font-size:20px;font-weight:800;color:#005c55;text-decoration:none;letter-spacing:-0.02em">
      CareSync
    </a>
    <div style="display:flex;align-items:center;gap:12px;margin-left:auto">
      <button class="cs-dark-toggle" onclick="DarkMode.toggle()" aria-label="Toggle dark mode" title="Toggle dark mode"></button>
      <span class="cs-badge ${roleColors[role] || ''}">${escHtml(role)}</span>
      <span style="font-size:14px;font-weight:600;color:#181c1c;display:none" class="md:!block">${escHtml(user?.username || '')}</span>
      ${avatarEl(user?.username || 'U', 36)}
    </div>
  `;
}

/* ============================================================
   INIT DASHBOARD PAGE
   ============================================================ */
function initDashboardPage(config) {
  const { role, activePage } = config;

  // Auth guard
  if (!guardRoute([role])) return;

  // Dark mode
  DarkMode.init();

  // AOS
  if (window.AOS) AOS.init({ duration: 500, easing: 'ease-out-cubic', once: true, offset: 40 });

  // Sidebar
  const sidebarEl = document.getElementById('cs-sidebar');
  if (sidebarEl) sidebarEl.innerHTML = renderSidebar(role, activePage);

  // Header
  const headerEl = document.getElementById('cs-header-inner');
  if (headerEl) headerEl.innerHTML = renderHeader(role, activePage);

  // Sidebar toggle (mobile)
  document.addEventListener('click', e => {
    const btn = e.target.closest('#sidebar-toggle');
    if (btn) sidebarEl?.classList.toggle('open');
    // Close on outside click
    if (!sidebarEl?.contains(e.target) && !btn && sidebarEl?.classList.contains('open')) {
      sidebarEl.classList.remove('open');
    }
  });

  // Expose Auth globally for logout buttons
  window.Auth = Auth;
  window.DarkMode = DarkMode;
}

/* ============================================================
   EXPORT
   ============================================================ */
window.KEYS = KEYS;
window.Store = Store;
window.Auth = Auth;
window.DarkMode = DarkMode;
window.generateId = generateId;
window.generatePatientId = generatePatientId;
window.showToast = showToast;
window.confirmDialog = confirmDialog;
window.paginate = paginate;
window.renderPaginationControls = renderPaginationControls;
window.highlightText = highlightText;
window.escHtml = escHtml;
window.statusBadge = statusBadge;
window.roleBadge = roleBadge;
window.getInitials = getInitials;
window.avatarEl = avatarEl;
window.fmtDate = fmtDate;
window.fmtDateTime = fmtDateTime;
window.fmtTime = fmtTime;
window.timeAgo = timeAgo;
window.logAudit = logAudit;
window.guardRoute = guardRoute;
window.renderSidebar = renderSidebar;
window.renderHeader = renderHeader;
window.initDashboardPage = initDashboardPage;
window.getLinkedProfile = getLinkedProfile;

// Auto-update demo badges if in cloud mode
document.addEventListener('DOMContentLoaded', () => {
  if (typeof APP_CONFIG !== 'undefined' && APP_CONFIG.USE_FIREBASE) {
    document.querySelectorAll('.cs-demo-badge').forEach(el => {
      el.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px">cloud_done</span> Cloud Mode Activated';
      el.style.background = '#e8f7f5';
      el.style.color = '#005c55';
    });
  }
});
