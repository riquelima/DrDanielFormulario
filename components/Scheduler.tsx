import React, { useState, useMemo, useCallback } from 'react';
import { TIME_SLOTS } from '../constants';
import { ScalesOfJusticeIcon } from './icons/ScalesOfJusticeIcon';
import type { BookingStatus, FormData } from '../types';

interface SchedulerProps {
  formData: FormData;
  bookedSlots: string[];
  bookingStatus: BookingStatus;
  confirmedSlot: Date | null;
  onConfirmBooking: (slotDate: Date) => void;
  onReset: () => void;
}

const DetailItem: React.FC<{label: string, value: string | undefined}> = ({label, value}) => (
  <div>
      <dt className="text-sm font-medium text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-white">{value || 'Não informado'}</dd>
  </div>
);

const Scheduler: React.FC<SchedulerProps> = ({ formData, bookedSlots, bookingStatus, confirmedSlot, onConfirmBooking, onReset }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tentativeSlotDate = useMemo(() => {
    if (!selectedDate || !selectedTime) return null;
    const [hour, minute] = selectedTime.split(':').map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hour, minute, 0, 0);
    return slotDate;
  }, [selectedDate, selectedTime]);


  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleDayClick = useCallback((day: Date) => {
    const dayOfWeek = day.getDay();
    if (day < today || dayOfWeek === 0 || dayOfWeek === 6) {
      return;
    }
    setSelectedDate(day);
    setSelectedTime(null);
  }, [today]);

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
  };

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (bookingStatus === 'success' && confirmedSlot) {
    return (
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-gray-700 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-4">
            <ScalesOfJusticeIcon className="w-12 h-12 text-blue-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Agendamento Confirmado!</h1>
              <p className="text-gray-400 mt-2">Obrigado por enviar suas informações. Seu horário está reservado.</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 border border-gray-700 rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-3 bg-green-900/50 border border-green-700 p-3 rounded-lg">
            <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-sm font-medium text-green-300">Seus dados de agendamento foram enviados com sucesso.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-4">Horário Agendado</h3>
            <p className="text-2xl font-bold text-green-400">
              {confirmedSlot.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-xl text-green-400">
              às {confirmedSlot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-4">Resumo dos Dados</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <DetailItem label="Nome Completo" value={formData.fullName} />
              <DetailItem label="CPF" value={formData.cpf} />
              <DetailItem label="E-mail" value={formData.email} />
              <DetailItem label="Telefone" value={formData.phone} />
            </dl>
          </div>
        </div>
        <div className="mt-8">
          <button onClick={onReset} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-transform transform hover:scale-105">
            Agendar Outra Consulta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-gray-700 w-full max-w-4xl">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4">
          <ScalesOfJusticeIcon className="w-12 h-12 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Agende sua Consulta</h1>
            <p className="text-gray-400">Selecione uma data e um horário disponível</p>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900 p-6 rounded-lg">
        {/* Calendar implementation... */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-700 transition-colors">&lt;</button>
          <h2 className="text-xl font-bold text-blue-300 capitalize">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-700 transition-colors">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-center">
          {daysOfWeek.map(day => <div key={day} className="font-semibold text-sm text-gray-400">{day}</div>)}
          {calendarDays.map((day, index) => {
            if (!day) return <div key={`empty-${index}`}></div>;
            
            const dayOfWeek = day.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isPast = day < today;
            const isSelected = selectedDate?.getTime() === day.getTime();
            const isDisabled = isPast || isWeekend;

            let dayClasses = "w-10 h-10 flex items-center justify-center rounded-full transition-colors ";
            dayClasses += isDisabled ? "text-gray-600 cursor-not-allowed" : isSelected ? "bg-blue-600 text-white font-bold" : "cursor-pointer hover:bg-slate-700";

            return (
              <div key={day.toString()} className="flex justify-center">
                <button onClick={() => handleDayClick(day)} disabled={isDisabled} className={dayClasses}>
                  {day.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-8">
            <h3 className="text-lg font-semibold text-center text-blue-300 mb-4">
              Horários para {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {TIME_SLOTS.map(time => {
              const [hour, minute] = time.split(':').map(Number);
              const slotDate = new Date(selectedDate);
              slotDate.setHours(hour, minute, 0, 0);
              const isBooked = bookedSlots.includes(slotDate.toISOString());
              const isSelected = selectedTime === time;

              return (
                <button
                  key={time}
                  onClick={() => handleTimeClick(time)}
                  disabled={isBooked}
                  className={`w-full py-2 px-2 border rounded-md text-sm font-medium transition-colors
                    ${isBooked 
                      ? 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-blue-600 border-blue-500 text-white ring-2 ring-blue-400'
                      : 'bg-slate-700 border-slate-600 text-white hover:bg-blue-600 hover:border-blue-500'
                    }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {tentativeSlotDate && (
        <div className="mt-8 bg-slate-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-4">Resumo do Agendamento</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <DetailItem label="Nome Completo" value={formData.fullName} />
            <DetailItem label="CPF" value={formData.cpf} />
            <DetailItem label="E-mail" value={formData.email} />
            <DetailItem label="Telefone" value={formData.phone} />
            <div className="md:col-span-2">
              <dt className="text-sm font-medium text-gray-400">Horário Selecionado</dt>
              <dd className="mt-1 text-lg font-bold text-green-400">
                {tentativeSlotDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                {' às '}
                {tentativeSlotDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </dd>
            </div>
          </dl>
          <div className="mt-6 pt-6 border-t border-gray-700">
            <button
              onClick={() => onConfirmBooking(tentativeSlotDate)}
              disabled={bookingStatus === 'submitting'}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-blue-800 disabled:cursor-not-allowed disabled:transform-none"
            >
              {bookingStatus === 'submitting' ? 'Enviando...' : 'Realizar Agendamento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduler;
