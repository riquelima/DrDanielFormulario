import React, { useState, useCallback } from 'react';
import DataForm from './components/DataForm';
import Scheduler from './components/Scheduler';
import { AppStep, BookingStatus, FormData } from './types';
import { supabase } from './lib/supabaseClient';

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

  const handleConfirmBooking = useCallback(async (slotDate: Date) => {
    if (!formData) return;

    setBookingStatus('submitting');

    try {
      // Helper function to create a safe folder name from the client's name
      const sanitizeFolderName = (name: string) => {
        return name
          .normalize("NFD") // Decompose accented characters
          .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
          .replace(/[^\w\s-]/g, '') // Remove non-word characters (except spaces and hyphens)
          .trim()
          .replace(/\s+/g, '_'); // Replace spaces with underscores
      };

      // Helper para fazer upload de um arquivo e retornar sua URL pública
      const uploadFile = async (file: File | null, fieldName: string): Promise<string | null> => {
        if (!file) return null;
        
        // Cria um caminho de pasta usando uma versão higienizada do nome do cliente
        const folderName = sanitizeFolderName(formData.fullName);
        
        // Cria um caminho único para o arquivo
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

      // Faz o upload dos arquivos em paralelo
      const [proofOfResidenceUrl, photoIdUrl, otherDocumentsUrl] = await Promise.all([
        uploadFile(formData.proofOfResidence, 'proofOfResidence'),
        uploadFile(formData.photoId, 'photoId'),
        uploadFile(formData.otherDocuments, 'otherDocuments'),
      ]);

      // Insere os dados no banco de dados
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
      
      // Atualiza o estado da UI em caso de sucesso
      setConfirmedSlot(slotDate);
      setBookedSlots(prev => [...prev, slotDate.toISOString()]);
      setBookingStatus('success');

    } catch (error) {
      console.error("Erro ao processar o agendamento:", error);
      alert(`Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Por favor, tente novamente.`);
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