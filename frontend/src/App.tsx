import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';
import { MainLayout } from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/login' replace />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/oauth-callback' element={<OAuthCallbackPage />} />

        <Route path='/home' element={<MainLayout>Home screen coming soon... </MainLayout>} />
        <Route path='/create' element={<MainLayout>Create post screen coming soon... </MainLayout>} />
        <Route path='/profile' element={<MainLayout>Profile screen coming soon... </MainLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
