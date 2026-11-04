import { Routes, Route } from 'react-router-dom';
import { AuthProvider, Protected } from './auth';
import Login from './Login';
import Dashboard from './Dashboard';

export default function AdminApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="*"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
      </Routes>
    </AuthProvider>
  );
}