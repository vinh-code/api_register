import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  return !isLoggedIn ? children : <Navigate to="/" replace />;
}

function App() {
  const handleLoginSuccess = (userData) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home onLogout={handleLogout} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login onLoginSuccess={handleLoginSuccess} />
            </PublicRoute>
          } 
        />
        <Route 
          path="/register" 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
