import { Route, Routes } from 'react-router'
import { PublicOnly, Redirect, RequireRole } from './auth/guards.tsx'
import Layout from './components/Layout.tsx'
import LoginPage from './pages/loginPage/LoginPage.tsx'
import RegisterPage from './pages/registerPage/RegisterPage.tsx'
import UserHome from './pages/user/userHome/UserHome.tsx'
import UserProfile from './pages/user/userProfile/UserProfile.tsx'
import UserSettings from './pages/user/userSettings/UserSettings.tsx'
import AdminHome from './pages/admin/AdminHome.tsx'
import AdminUsers from './pages/admin/AdminUsers.tsx'
import AdminSettings from './pages/admin/AdminSettings.tsx'
import UserLayout from "./pages/user/UserLayout.tsx";

export const userLinks = [
  { to: '/user', label: 'Home' },
  { to: '/user/profile', label: 'Profile' },
  { to: '/user/settings', label: 'Settings' },
]

export const adminLinks = [
  { to: '/admin', label: 'Home' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/settings', label: 'Settings' },
]

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireRole role="USER" />}>
        <Route path="/user" element={<UserLayout/>}>
          <Route index element={<UserHome/>}/>
          <Route path="/user/profile" element={<UserProfile />} />
          <Route path="/user/settings" element={<UserSettings />} />
        </Route>
      </Route>

      <Route element={<RequireRole role="ADMIN" />}>
        <Route path="/admin" element={<Layout links={adminLinks} />}>
          <Route index element={<AdminHome />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Redirect />} />
    </Routes>
  )
}
