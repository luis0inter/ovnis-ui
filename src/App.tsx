import { Route, Routes } from 'react-router'
import { PublicOnly, Redirect, RequireAuth, RequireRole } from './auth/guards.tsx'
import Layout from './components/Layout.tsx'
import LoginPage from './pages/loginPage/LoginPage.tsx'
import RegisterPage from './pages/registerPage/RegisterPage.tsx'
import UserHome from './pages/user/userHome/UserHome.tsx'
import UserProfile from './pages/user/userProfile/UserProfile.tsx'
import UserSettings from './pages/user/userSettings/UserSettings.tsx'
import AdminUsers from './pages/admin/AdminUsers.tsx'
import AdminSettings from './pages/admin/AdminSettings.tsx'
import SightingDetail from './pages/sightings/SightingDetail.tsx'
import SightingsPage from './pages/sightings/SightingsPage.tsx'
import AdminCharacteristics from "./components/admin/AdminCharacteristics.tsx";
export default function App() {
  return (
    <Routes>
      {/* Público: visitantes y usuarios registrados por igual (HU-009, criterio 3) */}
      <Route path="/sightings" element={<SightingsPage />} />
      <Route path="/sightings/:id" element={<SightingDetail />} />

      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route index element={<UserHome />} />

          <Route element={<RequireRole role="USER" />}>
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<UserSettings />} />
          </Route>

          <Route element={<RequireRole role="ADMIN" />}>
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/settings" element={<AdminSettings />} />
            <Route path="admin/sightings" element={<SightingsPage />} />
            <Route path="admin/characteristics" element={<AdminCharacteristics />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Redirect />} />
    </Routes>
  )
}
