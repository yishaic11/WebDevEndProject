import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { OAuthCallbackPage } from './pages/OAuthCallbackPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/login' replace />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/oauth-callback' element={<OAuthCallbackPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
