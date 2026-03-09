import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { MainLayout } from './layouts/MainLayout';
import { ProtectedRoute } from './components/Common/ProtectedRoute';
import { ProfilePage } from './pages/ProfilePage';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/home' replace />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/oauth-callback' element={<OAuthCallbackPage />} />

        <Route
          path='/home'
          element={
            <ProtectedRoute>
              <MainLayout>
                <HomePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/create'
          element={
            <ProtectedRoute>
              <MainLayout>Create post screen coming soon... </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
