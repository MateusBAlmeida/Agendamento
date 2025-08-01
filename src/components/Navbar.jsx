import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Sistema de Agendamentos
      </div>
      <div className="navbar-menu">
        <Link to="/calendario" className="navbar-item">Calendário</Link>
        <Link to="/nova-reserva" className="navbar-item">Nova Reserva</Link>
        <Link to="/minhas-reservas" className="navbar-item">Minhas Reservas</Link>
      </div>
      <div className="navbar-end">
        <span className="navbar-item user-name">
          Olá, {user.nome}
        </span>
        <button onClick={handleLogout} className="logout-button">
          Sair
        </button>
      </div>
    </nav>
  );
}
