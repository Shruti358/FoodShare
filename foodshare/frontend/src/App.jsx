import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import DonorDashboard from './pages/DonorDashboard';
import DonateFood from './pages/DonateFood';
import MyDonations from './pages/MyDonations';

import NGODashboard from './pages/NGODashboard';
import AvailableDonations from './pages/AvailableDonations';

import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Shared (any authenticated role) */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Donor */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/donate"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonateFood />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donor/my-donations"
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <MyDonations />
              </ProtectedRoute>
            }
          />

          {/* NGO */}
          <Route
            path="/ngo"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <NGODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/available"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <AvailableDonations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngo/my-donations"
            element={
              <ProtectedRoute allowedRoles={['ngo']}>
                <MyDonations />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Landing />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
