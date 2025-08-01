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

  const handleSlotSelect = (date) => {
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

  return (
    <div className="reserva-form-container">
      <h2>Nova Reserva</h2>
      
      <form onSubmit={handleSubmit} className="reserva-form">
        <div className="form-group">
          <label>Tipo:</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            required
          >
            <option value="sala">Sala</option>
            <option value="carro">Carro</option>
          </select>
        </div>

        <div className="form-group">
          <label>Nome do {tipo}:</label>
          <input
            type="text"
            value={itemNome}
            onChange={(e) => setItemNome(e.target.value)}
            placeholder={tipo === 'sala' ? 'Ex: Sala de Reunião 1' : 'Ex: Fiat Uno'}
            required
          />
        </div>

        {itemNome && (
          <>
            <Calendar
              tipo={tipo}
              itemNome={itemNome}
              onSlotSelect={handleSlotSelect}
            />

            {selectedDate && (
              <>
                <div className="form-group time-group">
                  <label>Horário de Início:</label>
                  <div className="time-inputs">
                    <select
                      value={selectedTime.hour}
                      onChange={(e) => setSelectedTime(prev => ({ ...prev, hour: e.target.value }))}
                      required
                    >
                      <option value="">Hora</option>
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {String(i).padStart(2, '0')}
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
              </>
            )}
          </>
        )}

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          disabled={loading || !selectedDate || selectedTime === null}
          className="submit-button"
        >
          {loading ? 'Criando reserva...' : 'Criar Reserva'}
        </button>
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
