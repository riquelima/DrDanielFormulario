import React, { useState, useCallback } from 'react';
import DataForm from './components/DataForm';
import Scheduler from './components/Scheduler';
import { AppStep, BookingStatus, FormData } from './types';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxayos1VfiQm34KmEdzFahSkx5Ii4tiTlLqZ0Se8xyThIjuD6OyOY5e6kwDvk47FKYX/exec';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('form');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle');
  const [confirmedSlot, setConfirmedSlot] = useState<Date | null>(null);

  const handleFormSubmit = useCallback((data: FormData) => {
    setFormData(data);
    setStep('scheduler');
  }, []);

  const sendDataToGoogleSheets = async (data: FormData, slot: Date) => {
    const dataToSend = {
      fullName: data.fullName,
      cpf: data.cpf,
      email: data.email,
      phone: data.phone,
      appointmentDateTime: slot.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).replace(',', ''),
    };

    try {
      // O Google Scripts com 'no-cors' não retorna um status de sucesso real para o cliente,
      // mas ainda envia os dados. Presumimos sucesso se não houver um erro de rede.
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(dataToSend),
        mode: 'no-cors',
      });
      console.log('Solicitação de envio para o Google Sheets enviada.');
      return true;
    } catch (error) {
      console.error("Erro ao enviar dados para o Google Sheets:", error);
      alert('Ocorreu um erro ao enviar seus dados. Por favor, tente novamente.');
      return false;
    }
  };

  const handleConfirmBooking = useCallback(async (slotDate: Date) => {
    if (!formData) return;

    setBookingStatus('submitting');
    const success = await sendDataToGoogleSheets(formData, slotDate);
    
    if (success) {
      setConfirmedSlot(slotDate);
      setBookedSlots(prev => [...prev, slotDate.toISOString()]);
      setBookingStatus('success');
    } else {
      setBookingStatus('idle'); // Reseta se houver falha
    }
  }, [formData]);

  const handleReset = useCallback(() => {
    setStep('form');
    setFormData(null);
    setConfirmedSlot(null);
    setBookingStatus('idle');
  }, []);

  const renderStep = () => {
    switch (step) {
      case 'form':
        return <DataForm onSubmit={handleFormSubmit} />;
      case 'scheduler':
        if (formData) {
          return (
            <Scheduler
              formData={formData}
              bookedSlots={bookedSlots}
              bookingStatus={bookingStatus}
              confirmedSlot={confirmedSlot}
              onConfirmBooking={handleConfirmBooking}
              onReset={handleReset}
            />
          );
        }
        // Se formData for nulo, volta ao formulário
        handleReset();
        return null;
      default:
        return <DataForm onSubmit={handleFormSubmit} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {renderStep()}
      </div>
    </div>
  );
};

export default App;
