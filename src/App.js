import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import ReservaForm from './pages/ReservaForm';
import MinhasReservas from './pages/MinhasReservas';
import Navbar from './components/Navbar';
import Calendario from './pages/Calendario';
import './App.css';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/calendario" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route 
                path="/" 
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } 
              />
              <Route
                path="/nova-reserva"
                element={
                  <PrivateRoute>
                    <ReservaForm />
                  </PrivateRoute>
                }
              />
              <Route
                path="/minhas-reservas"
                element={
                  <PrivateRoute>
                    <MinhasReservas />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendario"
                element={<Calendario />}
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
