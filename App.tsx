
import React, { useState, useCallback } from 'react';
import DataForm from './components/DataForm';
import Scheduler from './components/Scheduler';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import { AppStep, BookingStatus, FormData } from './types';
import { LoginIcon } from './components/icons/LoginIcon';
import { supabase } from './lib/supabaseClient';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxayos1VfiQm34KmEdzFahSkx5Ii4tiTlLqZ0Se8xyThIjuD6OyOY5e6kwDvk47FKYX/exec';

const App: React.FC = () => {
  const { user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // State for booking flow
  const [step, setStep] = useState<AppStep>('form');
  const [formData, setFormData] = useState<FormData | null>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle');
  const [confirmedSlot, setConfirmedSlot] = useState<Date | null>(null);

  const handleFormSubmit = useCallback((data: FormData) => {
    setFormData(data);
    setStep('scheduler');
  }, []);

  const sendDataToGoogleSheets = useCallback(async (data: Record<string, any>) => {
    if (!GOOGLE_SCRIPT_URL.startsWith('https://')) {
      console.warn('URL do Google Apps Script não configurada. Dados não foram enviados para a planilha.');
      return;
    }

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Falha ao enviar dados para o Google Sheets:', error);
    }
  }, []);


  const handleConfirmBooking = useCallback(async (slotDate: Date) => {
    if (!formData) return;

    setBookingStatus('submitting');

    try {
      const sanitizeFolderName = (name: string) => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '_');
      };

      const uploadFile = async (file: File | null, fieldName: string): Promise<string | null> => {
        if (!file) return null;
        
        const folderName = sanitizeFolderName(formData.fullName);
        const filePath = `${folderName}/${fieldName}-${Date.now()}-${file.name}`;
        
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error(`Falha no upload do arquivo ${fieldName}: ${uploadError.message}`);
        }

        const { data } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);
        
        return data.publicUrl;
      };

      const [proofOfResidenceUrl, photoIdUrl, otherDocumentsUrl] = await Promise.all([
        uploadFile(formData.proofOfResidence, 'proofOfResidence'),
        uploadFile(formData.photoId, 'photoId'),
        uploadFile(formData.otherDocuments, 'otherDocuments'),
      ]);

      const { error: insertError } = await supabase.from('appointments').insert({
        full_name: formData.fullName,
        cpf: formData.cpf,
        email: formData.email,
        phone: formData.phone,
        appointment_datetime: slotDate.toISOString(),
        proof_of_residence_url: proofOfResidenceUrl,
        photo_id_url: photoIdUrl,
        other_documents_url: otherDocumentsUrl,
      });

      if (insertError) {
        throw new Error(`Falha ao salvar o agendamento: ${insertError.message}`);
      }
      
      supabase.functions.invoke('sync-to-google-drive', {
        body: {
          folderName: sanitizeFolderName(formData.fullName),
          proofOfResidenceUrl,
          photoIdUrl,
          otherDocumentsUrl,
        },
      }).then(({ data, error }) => {
        if (error) {
          console.error('Falha ao invocar a Edge Function para sincronizar com o Google Drive:', error);
        } else {
          console.log('Sincronização com Google Drive iniciada com sucesso:', data);
        }
      });
      
      const sheetData = {
        fullName: formData.fullName,
        cpf: formData.cpf,
        email: formData.email,
        phone: formData.phone,
        appointmentDateTime: slotDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + slotDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        proof_of_residence_url: proofOfResidenceUrl,
        photo_id_url: photoIdUrl,
        other_documents_url: otherDocumentsUrl,
      };
      await sendDataToGoogleSheets(sheetData);

      setConfirmedSlot(slotDate);
      setBookedSlots(prev => [...prev, slotDate.toISOString()]);
      setBookingStatus('success');

    } catch (error) {
      console.error("Erro ao processar o agendamento:", error);
      alert(`Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Por favor, tente novamente.`);
      setBookingStatus('idle');
    }
  }, [formData, sendDataToGoogleSheets]);

  const handleReset = useCallback(() => {
    setStep('form');
    setFormData(null);
    setConfirmedSlot(null);
    setBookingStatus('idle');
  }, []);

  const renderBookingFlow = () => {
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
        handleReset();
        return null;
      default:
        return <DataForm onSubmit={handleFormSubmit} />;
    }
  };

  return (
    <>
      {!user && (
        <button
          onClick={() => setIsLoginModalOpen(true)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="Acesso do Administrador"
        >
          <LoginIcon className="w-6 h-6" />
        </button>
      )}

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto">
          {user 
            ? <AdminDashboard /> 
            : <div className="w-full max-w-4xl mx-auto">{renderBookingFlow()}</div>
          }
        </div>
      </div>
    </>
  );
};

export default App;
