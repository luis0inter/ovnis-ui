# Shared Home Page and Role-Based Navigation

## Objective

The application needed to provide a single home experience for both authenticated roles while exposing only role-appropriate navigation.

The implementation establishes this behavior:

- `ADMIN` and `USER` users share the `/` home route.
- Both roles render the same `UserHome` component.
- The sidebar displays administrator links for an `ADMIN` user.
- The sidebar displays standard-user links for a `USER` user.
- Role-specific routes are protected on the client.
- Unauthenticated users are redirected to `/login`.
- Authenticated users cannot use a route that belongs to another role.

## Project structure involved

The main implementation files are:

- `../../src/App.tsx`
- `../../src/auth/AuthContext.tsx`
- `../../src/auth/guards.tsx`
- `../../src/auth/jwt.ts`
- `../../src/components/Layout.tsx`
- `../../src/components/NavBar.tsx`
- `../../src/pages/user/userHome/UserHome.tsx`
- `../../src/pages/admin/AdminHome.tsx`
- `../../src/styles/index.css`
- `../../src/styles/UserHome.css`
- `../../types.ts`

## 1. Authentication and role storage

Authentication is managed with React Context.

`AuthProvider` wraps the application and provides the authenticated user, authentication status, login, registration, logout, and authenticated fetch functions through `AuthContext`.

The relevant concepts are:

- **React Context**: avoids passing the authenticated user through every React component as a prop.
- **Custom hook**: `useAuth()` provides controlled access to the authentication context.
- **Provider**: `AuthProvider` owns authentication state and makes it available to descendant components.
- **Derived state**: the current user is created from the decoded JWT instead of being stored separately.

The JWT contains the claims:

```tsx
interface Claims {
  sub: string
  role: Role
  exp: number
}
```

Here:

- `sub` is the username or subject.
- `role` identifies authorization level.
- `exp` is the expiration time.

A role is only accepted as:

```tsx
export type Role = 'USER' | 'ADMIN'
```

This type union restricts the role values used by the frontend.

## 2. JWT role validation

JWT decoding occurs in `../../src/auth/jwt.ts`.

The base64 payload is decoded, parsed, and checked for:

- A valid subject
- A valid numeric expiration
- An unexpired token
- A supported role

The supported role values are normalized to `USER` or `ADMIN`.

An unknown, missing, malformed, or expired role does not create an authenticated user. This prevents an unsupported role from reaching the navigation and route components.

When a token is received during login, `AuthContext` verifies it before saving it:

```tsx
const claims = readToken(res.accessToken)

if (!claims) {
  throw new Error('Invalid authentication token')
}

saveToken(res.accessToken)
```

The application then derives the user:

```tsx
const user: User | null = claims
  ? { username: claims.sub, role: claims.role }
  : null
```

This makes `user.role` the single source of truth used for role-aware rendering.

## 3. Authentication versus authorization

Authentication and authorization serve different purposes:

- **Authentication** answers: “Who is this user?”
- **Authorization** answers: “What is this user allowed to access?”

Authentication is represented by `isAuthenticated` and `user`.

Authorization is represented by checks such as:

```tsx
user.role === 'ADMIN'
user.role === 'USER'
```

The role checks are used in both route guards and navigation rendering.

The frontend protection improves navigation and user experience, but backend endpoints must also enforce roles. A React route guard is not secure authorization by itself because browser code can be inspected or modified.

## 4. Shared home route

The application previously had separate `/user` and `/admin` home concepts. The route configuration was consolidated so both roles render `UserHome` at `/`.

The relevant `App.tsx` structure is:

```tsx
<Route element={<RequireAuth />}>
  <Route element={<Layout />}>
    <Route index element={<UserHome />} />

    <Route element={<RequireRole role="USER" />}>
      <Route path="profile" element={<UserProfile />} />
      <Route path="settings" element={<UserSettings />} />
      <Route path="sightings" element={<SightingsPage />} />
    </Route>

    <Route element={<RequireRole role="ADMIN" />}>
      <Route path="admin/users" element={<AdminUsers />} />
      <Route path="admin/settings" element={<AdminSettings />} />
      <Route path="admin/sightings" element={<SightingsPage />} />
    </Route>
  </Route>
</Route>
```

The most important route is:

```tsx
<Route index element={<UserHome />} />
```

Because the route is inside the `/` layout branch, it renders `UserHome` for any authenticated role.

There is no conditional such as:

```tsx
role === 'ADMIN' ? <AdminHome /> : <UserHome />
```

The home component is therefore shared, while only role-specific destinations differ.

The old `AdminHome` component was converted into a re-export of the shared home:

```tsx
export { default } from '../user/userHome/UserHome.tsx'
```

This avoids maintaining two copies of the same home page.

## 5. Nested routes and layouts

React Router nested routes are used for composition.

`Layout` is the parent route element:

```tsx
<Route element={<Layout />}>
  <Route index element={<UserHome />} />
  {/* Role-specific routes */}
</Route>
```

`Layout` includes:

```tsx
<Outlet />
```

`Outlet` renders the child route selected by React Router.

This means:

- `/` renders `Layout` and `UserHome`.
- `/profile` renders `Layout` and `UserProfile`.
- `/admin/users` renders `Layout` and `AdminUsers`.

Only the child route changes. The application shell remains consistent.

## 6. Route guards

Route guards are React components that inspect authentication state before rendering a child route.

`RequireAuth` verifies authentication:

```tsx
export function RequireAuth() {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
```

If no authenticated user exists, React Router redirects with `<Navigate>`.

`RequireRole` verifies the required role:

```tsx
export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to="/" replace />

  return <Outlet />
}
```

The guard is used as a nested route:

```tsx
<Route element={<RequireRole role="USER" />}>
  <Route path="profile" element={<UserProfile />} />
</Route>
```

This pattern protects multiple routes without repeating the authorization check in every page.

`PublicOnly` prevents signed-in users from viewing login and registration pages:

```tsx
if (user) return <Navigate to="/" replace />
```

The wildcard route is also redirected:

```tsx
<Route path="*" element={<Redirect />} />
```

Unknown URLs therefore lead to `/` for authenticated users or `/login` for unauthenticated users.

## 7. Role-aware sidebar

The navigation component reads the authenticated role from `useAuth()`:

```tsx
const { user } = useAuth()

if (!user) return null

const links = user.role === 'ADMIN' ? adminLinks : userLinks
```

The navigation arrays are defined in `../../src/components/NavBar.tsx`:

```tsx
export const userLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/profile', label: 'Perfil' },
  { to: '/sightings', label: 'Avistamientos' },
  { to: '/settings', label: 'Ajustes' },
]

export const adminLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/admin/users', label: 'Usuarios' },
  { to: '/admin/sightings', label: 'Avistamientos' },
  { to: '/admin/settings', label: 'Ajustes' },
]
```

The links are rendered with `NavLink`:

```tsx
{links.map((link) => (
  <NavLink
    key={link.to}
    to={link.to}
    end={link.label === 'Inicio'}
  >
    {link.label}
  </NavLink>
))}
```

`NavLink` is used instead of a normal `<a>` so React Router controls navigation without a browser refresh.

The `end` property marks `/` as an exact match. Without it, a home link might appear active on every nested route.

## 8. Shared home role differences

`UserHome` is the common home component, but it reads the role from authentication context for role-specific links and cards:

```tsx
const { user } = useAuth()

{user?.role === 'ADMIN' ? (
  <Link to="/admin/users">Gestionar usuarios</Link>
) : (
  <Link to="/profile">Mi perfil</Link>
)}
```

It also renders administrator cards or standard-user cards according to `user.role`.

This is intentional:

- The overall home page is shared.
- The role-specific destinations are conditional.
- The structure, hero, styles, and layout remain consistent.

The administrator and user home content can later share even more reusable components if desired.

## 9. Shared layout and sidebar styling

`Layout` uses `useLocation()` to identify whether it is displaying `/`:

```tsx
const isHome = location.pathname === '/'

<main className={isHome ? 'app-main app-main--full' : 'app-main'}>
  <Outlet />
</main>
```

The home route receives a full-width main container:

```css
.app-main--full {
  max-width: none;
  margin: 0;
  padding: 0;
}
```

Secondary pages use a centered container:

```css
.app-main {
  width: 100%;
  max-width: 80rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}
```

The application shell now fills the viewport:

```css
html,
body,
#root {
  width: 100%;
  min-height: 100%;
  margin: 0;
}

.app-shell {
  width: 100%;
  min-height: 100vh;
}
```

The global header uses the dark OVNIS theme and is 66px tall:

```css
.app-header {
  width: 100%;
  height: 66px;
  display: grid;
  grid-template-columns: 220px minmax(280px, 1fr) auto;
  align-items: center;
  background: rgba(5, 9, 12, 0.98);
}
```

CSS media queries adapt the header for smaller screens:

```css
@media (max-width: 900px) {
  .app-header {
    height: auto;
    grid-template-columns: auto 1fr;
  }

  .app-header .uh-nav {
    grid-row: 2;
    grid-column: 1 / -1;
    overflow-x: auto;
  }
}
```

This keeps the navigation visible across desktop and mobile widths.

## 10. React concepts applied

### Context

`AuthContext` makes authentication state available across the component tree without manually passing props.

### Custom hooks

`useAuth()` centralizes access and throws an error if a component uses it outside `AuthProvider`.

### Conditional rendering

The role arrays and home links use conditional rendering:

```tsx
const links = user.role === 'ADMIN' ? adminLinks : userLinks
```

### Component composition

The layout, navigation, home page, role guard, and route page remain separate responsibilities:

- `Layout`: application shell
- `NavBar`: role-specific navigation
- `RequireAuth`: authentication guard
- `RequireRole`: role guard
- `UserHome`: shared home page
- Page components: route-specific content

### Controlled route structure

Nested routes and `Outlet` allow parent layouts to remain mounted while child pages change.

### Declarative navigation

`Navigate` handles redirects, while `NavLink` handles visible navigation links and active states.

### Derived state

The role is derived from the JWT claims. The application does not maintain a separate role field that could get out of sync.

## 11. Runtime behavior

### Anonymous user

1. The user opens `/`.
2. `RequireAuth` finds no user.
3. React Router redirects to `/login`.

### Standard user

1. The JWT contains `role: "USER"`.
2. `AuthContext` creates the authenticated user.
3. The user opens `/`.
4. `UserHome` is rendered.
5. `NavBar` selects `userLinks`.
6. The `/profile`, `/settings`, and `/sightings` routes are available.

### Administrator

1. The JWT contains `role: "ADMIN"`.
2. `AuthContext` creates the authenticated user.
3. The user opens `/`.
4. `UserHome` is rendered.
5. `NavBar` selects `adminLinks`.
6. The `/admin/users`, `/admin/settings`, and `/admin/sightings` routes are available.

### Cross-role route attempt

A user opens a route belonging to another role:

- A `USER` opening `/admin/users` is redirected to `/`.
- An `ADMIN` opening `/profile` is redirected to `/`.

This behavior is implemented by `RequireRole`.

## 12. Security boundaries

The role checks in React provide interface protection and prevent accidental navigation to unauthorized pages.

They do not replace server security.

The backend must independently verify:

- A valid JWT signature
- Token expiration
- The authenticated identity
- The requested role
- Permission for the requested operation

For example, hiding an administrator API call or button is insufficient. The API must reject unauthorized requests even if a client bypasses route guards.

## 13. Verification

The implementation was checked with:

```powershell
npm run typecheck
```

This runs the TypeScript project checks and verifies that:

- Route components have valid props.
- Context values use the correct types.
- Role values match the `Role` union.
- Layout and navigation components compile.
- JSX and imports are valid.

## Final architecture

The final architecture separates concerns as follows:

- `AuthContext` knows authentication state.
- `readToken` validates and normalizes JWT role data.
- `RequireAuth` permits authenticated users.
- `RequireRole` permits only the configured role.
- `Layout` provides the persistent application shell.
- `NavBar` renders role-specific navigation.
- `UserHome` provides the shared home experience.
- CSS provides the shared full-screen OVNIS design.

This fulfills the objective of a common home page for `ADMIN` and `USER` roles while presenting navigation and destinations appropriate to the signed-in role.

