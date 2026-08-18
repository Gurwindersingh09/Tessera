# INTEGRATION.md — Sentinel CaseDashboard

Step-by-step guide for dropping the **Sentinel CaseDashboard** feature into an existing React + Vite app that uses React Router and Zustand.

---

## 1. Copy the feature folder

Copy the entire `src/features/sentinel/` directory into your project's `src/features/` (create `features/` if it doesn't exist):

```
your-project/
└── src/
    └── features/
        └── sentinel/          ← copy this entire folder
            ├── index.js
            ├── sentinel.css
            ├── components/
            │   └── Sidebar.jsx
            ├── pages/
            │   └── CaseDashboard.jsx
            └── store/
                └── useSentinelStore.js
```

---

## 2. Install peer dependencies

Run this in your project root. Skip any that are already in your `package.json`:

```bash
npm install zustand react-router-dom @fontsource/inter @fontsource/ibm-plex-mono
```

| Package | Why |
|---------|-----|
| `zustand` | State management for cases and nav history |
| `react-router-dom` | `useNavigate`, `<Routes>`, `<Route>` |
| `@fontsource/inter` | UI font |
| `@fontsource/ibm-plex-mono` | Monospace font for IDs and numbers |

> **Already using Zustand?** See [Section 6](#6-merging-with-an-existing-zustand-store) before continuing.

---

## 3. Import the CSS

Add **one import** to your app entry point (`main.jsx`, `main.tsx`, `_app.jsx`, etc.):

```js
// main.jsx
import './features/sentinel/sentinel.css';
```

The CSS is fully scoped — it only affects elements inside `.sentinel-panel` divs (which `CaseDashboard` and `Sidebar` apply automatically). It will **not** override your global styles.

> **Already importing fonts globally?** You can delete the four `@import "@fontsource/..."` lines at the top of `sentinel.css` — the components will still use the correct font stacks via the CSS custom property fallbacks.

---

## 4. Add the layout

Wrap your page content with the Sentinel layout — `Sidebar` on the left, your routed content on the right:

```jsx
// App.jsx (or your root layout component)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar, CaseDashboard } from './features/sentinel';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', background: '#0A0A0C' }}>
        {/* Sentinel sidebar — sticky, 224px wide */}
        <Sidebar />

        {/* Your existing routes go here */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <Routes>
            {/* Dashboard route — mount at whatever path you prefer */}
            <Route path="/"          element={<CaseDashboard />} />

            {/* These two routes are navigated to by CaseDashboard */}
            <Route path="/case/:caseId" element={<YourCaseDetailPage />} />
            <Route path="/new-case"     element={<YourNewCasePage />} />

            {/* ...your other existing routes */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

> **Using React Router v6 nested routes / layout routes?** Mount `<Sidebar />` inside your layout component the same way — just make sure `<BrowserRouter>` (or equivalent) wraps the whole tree.

---

## 5. Wire up new pages

`CaseDashboard` navigates to two routes. You must provide components for them:

### `/case/:caseId` — Case Detail page

```jsx
// pages/CaseDetail.jsx (your implementation)
import { useParams } from 'react-router-dom';
import { useSentinelStore } from '../features/sentinel';

export default function CaseDetail() {
  const { caseId } = useParams();
  const { cases, pushNavHistory } = useSentinelStore();
  const caseData = cases.find(c => c.id === caseId);

  // Register in nav history so sidebar shows correct breadcrumb
  useEffect(() => {
    if (caseData) {
      pushNavHistory({
        id:    `case-${caseData.id}`,
        label: `Case: ${caseData.title}`,
        path:  `/case/${caseData.id}`,
        depth: 1,                      // indented one level in the sidebar
      });
    }
  }, [caseId]);

  // ...your case detail UI
}
```

### `/new-case` — New Case form

```jsx
// pages/NewCase.jsx (your implementation)
import { useSentinelStore } from '../features/sentinel';

export default function NewCase() {
  const { addCase, pushNavHistory } = useSentinelStore();

  useEffect(() => {
    pushNavHistory({ id: 'new-case', label: 'New Case', path: '/new-case', depth: 1 });
  }, []);

  const handleSubmit = (formData) => {
    addCase({
      title:        formData.title,
      status:       'active',
      priority:     formData.priority,
      entityCount:  0,
      anomalyCount: 0,
      investigator: formData.investigator,
    });
    navigate('/');
  };

  // ...your form UI
}
```

---

## 6. Merging with an existing Zustand store

If your project already uses Zustand, you have two options:

### Option A — Keep stores separate (recommended)

The Sentinel store uses its own localStorage key (`'sentinel-store'`) so it won't collide. Just import both hooks side-by-side:

```js
import { useSentinelStore } from './features/sentinel';
import { useYourStore }     from './store/yourStore';
```

No changes needed.

### Option B — Merge into your store

Copy the slices from `useSentinelStore.js` into your existing store:
- `cases`, `addCase`
- `navigationHistory`, `pushNavHistory`, `truncateNavAt`
- `filters`, `setFilter`, `resetFilters`

Then update the three import lines in the feature components:

```js
// Change this line in Sidebar.jsx, CaseDashboard.jsx:
import { useSentinelStore } from '../store/useSentinelStore';

// To point to your merged store:
import { useSentinelStore } from '../../store/yourStore';  // adjust path
// (or rename the hook to match your store's name)
```

---

## 7. Wiring up real data

The store ships with 12 seeded cases. To replace with real data:

```js
// Option A: fetch on mount in CaseDashboard.jsx
useEffect(() => {
  fetch('/api/cases')
    .then(r => r.json())
    .then(data => useSentinelStore.setState({ cases: data }));
}, []);

// Option B: Add a loadCases action to the store
loadCases: async () => {
  const data = await fetchCases();          // your API call
  set({ cases: data });
},
```

---

## 8. Customising the sidebar

Edit `NAV_ITEMS` in `Sidebar.jsx` to match your routes:

```js
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/',         icon: IconDashboard },
  { id: 'map',       label: 'Map View',  path: '/map',      icon: IconMap },
  // ...add or remove items
];
```

Replace the hardcoded user initials and name in the footer with your auth context:

```jsx
// In Sidebar.jsx, footer section:
const { user } = useAuth();  // your auth hook

<div>{ user.initials }</div>
<div>{ user.displayName }</div>
<div className="data-label">{ user.role }</div>
```

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Fonts not loading | `@fontsource` not installed | Run `npm install @fontsource/inter @fontsource/ibm-plex-mono` |
| CSS not applying | `sentinel.css` not imported | Add `import './features/sentinel/sentinel.css'` to `main.jsx` |
| `useNavigate` error | Not inside a Router | Ensure `<BrowserRouter>` wraps your whole app |
| Sidebar shows wrong active item | Another page isn't calling `pushNavHistory` | Call `pushNavHistory(...)` in a `useEffect` on every Sentinel page |
| LocalStorage conflict | Another Zustand store uses key `'sentinel-store'` | Change the `name:` field in `persist(...)` in `useSentinelStore.js` |
| Zustand not found | Wrong version | Requires Zustand v4+ (`npm install zustand@^4`) |

---

## File Reference

| File | Description |
|------|-------------|
| `sentinel/index.js` | Barrel export — single import point |
| `sentinel/sentinel.css` | All styles — import once in `main.jsx` |
| `sentinel/store/useSentinelStore.js` | Zustand store — cases, nav history, filters |
| `sentinel/components/Sidebar.jsx` | Sidebar with expanding history stack |
| `sentinel/pages/CaseDashboard.jsx` | Dashboard page — stat strip + table |
