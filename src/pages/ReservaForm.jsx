import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Calendar from '../components/Calendar';
import { useAuth } from '../contexts/AuthContext';
import './ReservaForm.css';

const ReservaForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('sala');
  const [itemNome, setItemNome] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState({ hour: '', minute: '' });
  const [duration, setDuration] = useState({ hours: 1, minutes: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [checking, setChecking] = useState(false);

  const carregarReservas = async (tipo, item) => {
    try {
      setChecking(true);
      const response = await api.get('/reservas/calendario');
      // Filtra apenas as reservas do mesmo item
      const reservasDoItem = response.data.filter(
        reserva => reserva.tipo === tipo && reserva.item_nome === item
      );
      setReservas(reservasDoItem);
    } catch (err) {
      console.error('Erro ao carregar reservas:', err);
    } finally {
      setChecking(false);
    }
  };

  const verificarDisponibilidade = (data, horaInicio, duracao) => {
    if (!data || !horaInicio.hour || !horaInicio.minute) return true;

    const inicio = new Date(data);
    inicio.setHours(parseInt(horaInicio.hour), parseInt(horaInicio.minute), 0);
    
    const fim = new Date(inicio);
    fim.setHours(
      inicio.getHours() + duracao.hours,
      inicio.getMinutes() + duracao.minutes
    );

    // Verifica se está no passado
    if (inicio < new Date()) {
      return false;
    }

    // Verifica conflito apenas com reservas do mesmo item
    const conflito = reservas.some(reserva => {
      const reservaInicio = new Date(reserva.data_inicio);
      const reservaFim = new Date(reserva.data_fim);
      
      // Verifica se há sobreposição de horários
      const temSobreposicao = (
        (inicio >= reservaInicio && inicio < reservaFim) ||
        (fim > reservaInicio && fim <= reservaFim) ||
        (inicio <= reservaInicio && fim > reservaFim)
      );
      
      return temSobreposicao;
    });

    return !conflito;
  };

  const handleItemSelect = (tipo, item) => {
    setTipo(tipo);
    setItemNome(item);
    carregarReservas(tipo, item);
  };

  const handleDateChange = (e) => {
    // Pega a data no fuso horário local
    const [year, month, day] = e.target.value.split('-').map(Number);
    const date = new Date(year, month - 1, day); // mês é 0-based
    date.setHours(0, 0, 0, 0);
    setSelectedDate(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime.hour || !selectedTime.minute) {
      setError('Por favor, selecione uma data e horário');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dataInicio = new Date(selectedDate);
      dataInicio.setHours(parseInt(selectedTime.hour), parseInt(selectedTime.minute), 0);
      
      const dataFim = new Date(dataInicio);
      dataFim.setHours(
        dataInicio.getHours() + duration.hours,
        dataInicio.getMinutes() + duration.minutes
      );

      await api.post('/reservas', {
        tipo,
        item_nome: itemNome,
        data_inicio: dataInicio.toISOString(),
        data_fim: dataFim.toISOString()
      });

      alert('Reserva criada com sucesso!');
      navigate('/minhas-reservas');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="error-message">Por favor, faça login para criar uma reserva.</div>;
  }

  const isHorarioDisponivel = selectedDate && verificarDisponibilidade(selectedDate, selectedTime, duration);

  return (
    <div className="reserva-form-container">
      <h2>Nova Reserva</h2>
      
      <form onSubmit={handleSubmit} className="reserva-form">
        <div className="form-section">
          <h3>1. Selecione o Item</h3>
          <Calendar
            onSlotSelect={handleItemSelect}
          />
        </div>

        {itemNome && (
          <div className="form-section">
            <h3>2. Data e Horário</h3>
            <div className="form-group">
              <label>Data da Reserva:</label>
              <input
                type="date"
                value={selectedDate ? 
                  `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` 
                  : ''}
                onChange={handleDateChange}
                min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                required
                className="date-input"
              />
            </div>

            <div className="form-group time-group">
              <label>Horário de Início:</label>
              <div className="time-inputs">
                <select
                  value={selectedTime.hour}
                  onChange={(e) => setSelectedTime(prev => ({ ...prev, hour: e.target.value }))}
                  required
                >
                  <option value="">Hora</option>
                  {Array.from({ length: 10 }, (_, i) => (
                    <option key={i+8} value={i+8}>
                      {String(i+8).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={selectedTime.minute}
                  onChange={(e) => setSelectedTime(prev => ({ ...prev, minute: e.target.value }))}
                  required
                >
                  <option value="">Min</option>
                  <option value="00">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
              </div>
            </div>

            <div className="form-group time-group">
              <label>Duração:</label>
              <div className="time-inputs">
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={duration.hours}
                  onChange={(e) => setDuration(prev => ({ ...prev, hours: parseInt(e.target.value) || 0 }))}
                  required
                />
                <span>h</span>
                <select
                  value={duration.minutes}
                  onChange={(e) => setDuration(prev => ({ ...prev, minutes: parseInt(e.target.value) }))}
                >
                  <option value="0">00</option>
                  <option value="15">15</option>
                  <option value="30">30</option>
                  <option value="45">45</option>
                </select>
                <span>min</span>
              </div>
            </div>

            {selectedDate && selectedTime.hour && selectedTime.minute && (
              <div className={`disponibilidade-info ${isHorarioDisponivel ? 'disponivel' : 'indisponivel'}`}>
                {isHorarioDisponivel ? 
                  'Horário disponível' : 
                  'Horário indisponível'
                }
              </div>
            )}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading || !itemNome || !selectedDate || (selectedDate && !isHorarioDisponivel)}
            className="submit-button"
          >
            {loading ? 'Criando reserva...' : 'Criar Reserva'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="cancel-button"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
//         required
//       />

//       <label>Tipo de Recurso:</label>
//       <select
//         name="tipo"
//         value={formData.tipo}
//         onChange={e => {
//           setTipo(e.target.value);
//           handleChange(e);
//         }}
//         required
//       >
//         <option value="">Selecione</option>
//         <option value="sala">Sala de Reunião</option>
//         <option value="carro">Carro</option>
//       </select>

//       <label>Recurso:</label>
//       <select
//         name="recursoId"
//         value={formData.recursoId}
//         onChange={handleChange}
//       >
//         <option value="">Selecione</option>
//         {recursos.map(recurso => (
//           <option key={recurso.id} value={recurso.id}>
//             {recurso.nome}
//           </option>
//         ))}
//       </select>

//       <label>Data:</label>
//       <input
//         type="date"
//         name="data"
//         value={formData.data}
//         onChange={handleChange}
//         required
//       />

//       <label>Hora de Início:</label>
//       <input
//         type="time"
//         name="horaInicio"
//         value={formData.horaInicio}
//         onChange={handleChange}
//         required
//       />

//       <label>Hora de Término:</label>
//       <input
//         type="time"
//         name="horaFim"
//         value={formData.horaFim}
//         onChange={handleChange}
//         required
//       />

//       <button type="submit">Salvar Reserva</button>
//     </form>
//   );
// };

export default ReservaForm;
