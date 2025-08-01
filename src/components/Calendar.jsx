import React, { useState, useEffect } from 'react';
import api from '../api';
import './Calendar.css';

export default function Calendar({ tipo, itemNome, onSlotSelect }) {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservas();
  }, [tipo, itemNome]);

  const loadReservas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservas', {
        params: { tipo, item_nome: itemNome }
      });
      setReservas(response.data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isSlotAvailable = (date, hour) => {
    const targetDate = new Date(date);
    targetDate.setHours(hour);
    
    return !reservas.some(reserva => {
      const inicio = new Date(reserva.data_inicio);
      const fim = new Date(reserva.data_fim);
      return targetDate >= inicio && targetDate < fim;
    });
  };

  const handleSlotClick = (date, hour) => {
    if (isSlotAvailable(date, hour)) {
      onSlotSelect(date, hour);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3>Disponibilidade - {tipo}: {itemNome}</h3>
      </div>
      <div className="calendar-grid">
        {/* Cabeçalho com horários */}
        <div className="time-header">
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} className="time-slot-header">
              {`${String(i).padStart(2, '0')}:00`}
            </div>
          ))}
        </div>
        
        {/* Grid de horários para os próximos 7 dias */}
        {Array.from({ length: 7 }, (_, dayOffset) => {
          const date = new Date();
          date.setDate(date.getDate() + dayOffset);
          
          return (
            <div key={date.toISOString()} className="day-row">
              <div className="day-header">
                {date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}
              </div>
              {Array.from({ length: 24 }, (_, hour) => {
                const available = isSlotAvailable(date, hour);
                return (
                  <div
                    key={hour}
                    className={`time-slot ${available ? 'available' : 'unavailable'}`}
                    onClick={() => available && handleSlotClick(date, hour)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
