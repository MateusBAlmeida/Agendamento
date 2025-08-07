import React, { useState, useEffect } from 'react';
import { publicApi } from '../api';
import './Calendario.css';

const DiaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const Meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function Calendario() {
  const [tipo, setTipo] = useState('sala');
  const [itemNome, setItemNome] = useState('');
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mesAtual, setMesAtual] = useState(() => new Date());
  const [diaVisualizado, setDiaVisualizado] = useState(null);
  const [reservasPorDia, setReservasPorDia] = useState({});

  useEffect(() => {
    carregarReservasMes();
  }, [tipo, itemNome, mesAtual]);

  const carregarReservasMes = async () => {
    try {
      setLoading(true);
      // Ajusta para pegar o mês inteiro e alguns dias antes/depois
      const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
      const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
      
      // Ajusta para o início do dia
      primeiroDia.setHours(0, 0, 0, 0);
      ultimoDia.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        tipo,
        ...(itemNome && { item_nome: itemNome }),
        data_inicio: primeiroDia.toISOString(),
        data_fim: ultimoDia.toISOString()
      });

      const response = await publicApi.get(`/reservas/calendario`);

      // const response = await publicApi.get('/reservas/calendario', {
      //   params: {
      //     tipo,
      //     ...(itemNome && { item_nome: itemNome }),
      //     data_inicio: primeiroDia.toISOString(),
      //     data_fim: ultimoDia.toISOString()
      //   }
      // });
      
      // Agrupa as reservas por dia
      const reservasDia = response.data.reduce((acc, reserva) => {
        const data = new Date(reserva.data_inicio).toISOString().split('T')[0];
        if (!acc[data]) acc[data] = [];
        acc[data].push(reserva);
        return acc;
      }, {});

      setReservasPorDia(reservasDia);
      setError(null);

      // Se estiver visualizando um dia, atualiza as reservas do dia
      if (diaVisualizado) {
        const dataStr = diaVisualizado.toISOString().split('T')[0];
        setReservas(reservasDia[dataStr] || []);
      }
    } catch (err) {
      setError('Erro ao carregar reservas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getDiasDoMes = () => {
    const primeiroDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), 1);
    const ultimoDia = new Date(mesAtual.getFullYear(), mesAtual.getMonth() + 1, 0);
    
    const dias = [];
    const diasAntes = primeiroDia.getDay();
    
    // Adiciona dias do mês anterior
    for (let i = diasAntes - 1; i >= 0; i--) {
      const dia = new Date(primeiroDia);
      dia.setDate(dia.getDate() - i - 1);
      dias.push({ data: dia, outroMes: true });
    }
    
    // Adiciona dias do mês atual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      const dia = new Date(mesAtual.getFullYear(), mesAtual.getMonth(), i);
      dias.push({ data: dia, outroMes: false });
    }
    
    // Completa a última semana se necessário
    const diasDepois = 7 - (dias.length % 7);
    if (diasDepois < 7) {
      for (let i = 1; i <= diasDepois; i++) {
        const dia = new Date(ultimoDia);
        dia.setDate(dia.getDate() + i);
        dias.push({ data: dia, outroMes: true });
      }
    }
    
    return dias;
  };

  const mudarMes = (delta) => {
    const novoMes = new Date(mesAtual);
    novoMes.setMonth(novoMes.getMonth() + delta);
    setMesAtual(novoMes);
    setDiaVisualizado(null);
  };

  const selecionarDia = (data) => {
    setDiaVisualizado(data);
    const dataStr = data.toISOString().split('T')[0];
    setReservas(reservasPorDia[dataStr] || []);
  };

  const isHorarioReservado = (horario) => {
    const [hour, minute] = horario.split(':').map(Number);
    const dataHorario = new Date(diaVisualizado);
    dataHorario.setHours(hour, minute, 0, 0);

    return reservas.find(reserva => {
      const inicio = new Date(reserva.data_inicio);
      const fim = new Date(reserva.data_fim);
      return dataHorario >= inicio && dataHorario < fim;
    });
  };

  const formatarData = (data) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(data));
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="calendario-container">
      
      <div className="calendario-header">
        <button onClick={() => mudarMes(-1)} className="mes-nav">&lt;</button>
        <h2>{Meses[mesAtual.getMonth()]} {mesAtual.getFullYear()}</h2>
        <button onClick={() => mudarMes(1)} className="mes-nav">&gt;</button>
      </div>

      <div className="calendario-mes">
        <div className="dias-semana">
          {DiaSemana.map(dia => (
            <div key={dia} className="dia-header">{dia}</div>
          ))}
        </div>

        <div className="dias-grid">
          {getDiasDoMes().map(({ data, outroMes }) => {
            const dataStr = data.toISOString().split('T')[0];
            const temReserva = reservasPorDia[dataStr]?.length > 0;
            const hoje = new Date().toISOString().split('T')[0] === dataStr;
            const selecionado = diaVisualizado?.toISOString().split('T')[0] === dataStr;

            return (
              <div
                key={dataStr}
                className={`dia-celula ${outroMes ? 'outro-mes' : ''} 
                           ${hoje ? 'hoje' : ''} 
                           ${selecionado ? 'selecionado' : ''} 
                           ${temReserva ? 'tem-reserva' : ''}`}
                onClick={() => !outroMes && selecionarDia(data)}
              >
                <span className="dia-numero">{data.getDate()}</span>
                {temReserva && <span className="reservas-badge">{reservasPorDia[dataStr].length}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {diaVisualizado && (
        <div className="dia-detalhes">
          <h3>Reservas - {diaVisualizado.toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            day: '2-digit',
            month: 'long'
          })}</h3>
          
          <div className="reservas-lista">
            {reservas.length === 0 ? (
              <p className="sem-reservas">Não há reservas para este dia</p>
            ) : (
              reservas.map(reserva => (
                <div key={reserva.id} className="reserva-card">
                  <div className="reserva-cabecalho">
                    <div className="reserva-tipo">{reserva.tipo}</div>
                    <div className={`reserva-status ${new Date(reserva.data_fim) < new Date() ? 'passada' : 'futura'}`}>
                      {new Date(reserva.data_fim) < new Date() ? 'Concluída' : 'Agendada'}
                    </div>
                  </div>
                  <h4>{reserva.item_nome}</h4>
                  <div className="reserva-horario">
                    <span>{new Date(reserva.data_inicio).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}</span>
                    {' - '}
                    <span>{new Date(reserva.data_fim).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="reserva-usuario">Por: {reserva.usuario_nome}</div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
