import React, { useState, useEffect } from 'react';
import api from '../api';
import './MinhasReservas.css';

export default function MinhasReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);

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

  const handleCancelar = async (id) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) {
      return;
    }

    try {
      setCancelando(id);
      await api.delete(`/reservas/${id}`);
      await loadReservas();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao cancelar reserva');
    } finally {
      setCancelando(null);
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(date);
  };

  const isReservaAtiva = (dataFim) => {
    return new Date(dataFim) > new Date();
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
        <>
          <div className="reservas-section">
            <h3>Reservas Ativas</h3>
            <div className="reservas-grid">
              {reservas
                .filter(reserva => isReservaAtiva(reserva.data_fim))
                .map((reserva) => (
                  <div key={reserva.id} className="reserva-card ativa">
                    <div className="reserva-tipo">{reserva.tipo}</div>
                    <h4>{reserva.item_nome}</h4>
                    <div className="reserva-periodo">
                      <div>
                        <strong>Início:</strong> {formatDateTime(reserva.data_inicio)}
                      </div>
                      <div>
                        <strong>Fim:</strong> {formatDateTime(reserva.data_fim)}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCancelar(reserva.id)}
                      disabled={cancelando === reserva.id}
                      className="cancelar-button"
                    >
                      {cancelando === reserva.id ? 'Cancelando...' : 'Cancelar Reserva'}
                    </button>
                  </div>
                ))}
            </div>
          </div>

          <div className="reservas-section passadas">
            <h3>Reservas Passadas</h3>
            <div className="reservas-grid">
              {reservas
                .filter(reserva => !isReservaAtiva(reserva.data_fim))
                .map((reserva) => (
                  <div key={reserva.id} className="reserva-card passada">
                    <div className="reserva-tipo">{reserva.tipo}</div>
                    <h4>{reserva.item_nome}</h4>
                    <div className="reserva-periodo">
                      <div>
                        <strong>Início:</strong> {formatDateTime(reserva.data_inicio)}
                      </div>
                      <div>
                        <strong>Fim:</strong> {formatDateTime(reserva.data_fim)}
                      </div>
                    </div>
                    <div className="reserva-status">Finalizada</div>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
