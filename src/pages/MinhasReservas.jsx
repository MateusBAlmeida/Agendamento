import React, { useState, useEffect } from 'react';
import api from '../api';
import './MinhasReservas.css';

export default function MinhasReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservas();
  }, []);

  const loadReservas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservas');
      setReservas(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="minhas-reservas">
      <h2>Minhas Reservas</h2>
      
      {reservas.length === 0 ? (
        <div className="no-reservas">
          Você ainda não tem reservas.
        </div>
      ) : (
        <div className="reservas-grid">
          {reservas.map((reserva) => (
            <div key={reserva.id} className="reserva-card">
              <div className="reserva-tipo">{reserva.tipo}</div>
              <h3>{reserva.item_nome}</h3>
              <div className="reserva-periodo">
                <div>
                  <strong>Início:</strong> {formatDateTime(reserva.data_inicio)}
                </div>
                <div>
                  <strong>Fim:</strong> {formatDateTime(reserva.data_fim)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
