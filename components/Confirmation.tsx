import React from 'react';
import type { FormData } from '../types';
import { ScalesOfJusticeIcon } from './icons/ScalesOfJusticeIcon';

interface ConfirmationProps {
  formData: FormData;
  selectedSlot: Date;
  onReset: () => void;
  uploadSuccess: boolean;
}

const Confirmation: React.FC<ConfirmationProps> = ({ formData, selectedSlot, onReset, uploadSuccess }) => {
  const DetailItem: React.FC<{label: string, value: string | undefined}> = ({label, value}) => (
    <div>
        <dt className="text-sm font-medium text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-white">{value || 'Não informado'}</dd>
    </div>
  );
    
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
        {uploadSuccess && (
          <div className="flex items-center space-x-3 bg-green-900/50 border border-green-700 p-3 rounded-lg">
            <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-sm font-medium text-green-300">Seus documentos foram enviados com sucesso.</p>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-4">Horário Agendado</h3>
          <p className="text-2xl font-bold text-green-400">
            {selectedSlot.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-xl text-green-400">
            às {selectedSlot.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div>
            <h3 className="text-lg font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-4">Resumo dos Dados</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <DetailItem label="Nome Completo" value={formData.fullName} />
                <DetailItem label="CPF" value={formData.cpf} />
                <DetailItem label="E-mail" value={formData.email} />
                <DetailItem label="Telefone" value={formData.phone} />
                <DetailItem label="Comprovante de Residência" value={formData.proofOfResidence?.name} />
                <DetailItem label="Documento com Foto" value={formData.photoId?.name} />
                <DetailItem label="Outros Documentos" value={formData.otherDocuments?.name} />
            </dl>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onReset}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-transform transform hover:scale-105"
        >
          Agendar Outra Consulta
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
