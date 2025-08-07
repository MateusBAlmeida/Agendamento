import React, { useState, useEffect } from 'react';
import api from '../api';
import './Calendar.css';

const ITENS = {
  'Salas': ['Sala de Reuniões', 'Sala de Reunião 1', 'Sala de Reunião 2'],
  'Veículos': ['Kwid TEG6F93', 'Sandero SHO8G56'],
};

const DiaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function Calendar({ onSlotSelect }) {
  const [tipoSelecionado, setTipoSelecionado] = useState(Object.keys(ITENS)[0]);
  const [itemSelecionado, setItemSelecionado] = useState(ITENS[Object.keys(ITENS)[0]][0]);
  const [reservas, setReservas] = useState([]);
  const [semanaAtual, setSemanaAtual] = useState(() => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return hoje;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);

  useEffect(() => {
    loadReservas();
  }, [tipoSelecionado]);

  const loadReservas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reservas', {
        params: { tipoSelecionado, item_nome: itemSelecionado }
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

  const getReservaNoHorario = (date, hour) => {
    const targetDate = new Date(date);
    targetDate.setHours(hour, 0, 0, 0);
    
    return reservas.find(reserva => {
      const inicio = new Date(reserva.data_inicio);
      const fim = new Date(reserva.data_fim);
      return targetDate >= inicio && targetDate < fim;
    });
  };

  const handleSlotClick = (date, hour) => {
    const reserva = getReservaNoHorario(date, hour);
    if (!reserva) {
      onSlotSelect(date, hour);
    }
  };

  const navegarSemana = (direcao) => {
    const novaData = new Date(semanaAtual);
    novaData.setDate(novaData.getDate() + (7 * direcao));
    setSemanaAtual(novaData);
  };

  const formatarHorarioReserva = (data) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(data));
  };

  const isDataPassada = (date, hour) => {
    const agora = new Date();
    const dataHora = new Date(date);
    dataHora.setHours(hour, 0, 0, 0);
    return dataHora < agora;
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h3>Selecione um Item para Reserva</h3>
        <div className="item-selection">
          <div className="tipo-selector">
            {Object.keys(ITENS).map(tipo => (
              <button
                type="button"
                key={tipo}
                className={`tipo-button ${tipo === tipoSelecionado ? 'selected' : ''}`}
                onClick={() => {
                  setTipoSelecionado(tipo);
                  setItemSelecionado(ITENS[tipo][0]);
                }}
              >
                {tipo}
              </button>
            ))}
          </div>
          <div className="items-grid">
            {ITENS[tipoSelecionado].map(item => (
              <div
                key={item}
                className={`item-card ${item === itemSelecionado ? 'selected' : ''}`}
                onClick={() => {
                  setItemSelecionado(item);
                  onSlotSelect(tipoSelecionado, item);
                }}
              >
                <div className="item-name">{item}</div>
                {reservas.some(reserva => reserva.item_nome === item)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
