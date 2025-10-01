
import React from 'react';

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'success' | 'error';

interface FileInputProps {
  id: string;
  label: string;
  onChange: (file: File | null) => void;
  file: File | null;
  status: UploadStatus;
  progress: number;
  error?: string;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, onChange, file, status, progress, error }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    } else {
      onChange(null);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'uploading':
        return (
          <div className="w-full px-4 text-center">
            <p className="text-sm text-gray-300 mb-2 truncate" title={file?.name}>Enviando: {file?.name}</p>
            <div className="w-full bg-gray-600 rounded-full h-2.5">
              <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{progress}%</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center text-center px-2">
            <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-sm text-green-400 font-semibold truncate max-w-full" title={file?.name}>Enviado: {file?.name}</p>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center px-2">
             <svg className="w-8 h-8 mb-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-sm text-red-400 font-semibold">Falha no envio</p>
            <p className="text-xs text-gray-400 mt-1 max-w-full" title={error}>{error || 'Tente novamente.'}</p>
          </div>
        );
      case 'selected':
        return (
           <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-2">
             <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
               <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
             </svg>
             <p className="text-sm text-gray-300 truncate max-w-full">Arquivo selecionado:</p>
             <p className="text-sm font-semibold text-blue-400 truncate max-w-full" title={file?.name}>{file?.name}</p>
          </div>
        )
      case 'idle':
      default:
        return (
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-blue-400">Clique para enviar</span> ou arraste e solte</p>
            <p className="text-xs text-gray-500">Foto ou PDF (MAX. 10MB)</p>
          </div>
        );
    }
  };

  const isUploading = status === 'uploading';
  const isActionable = status === 'idle' || status === 'selected' || status === 'error';

  const labelClasses = `flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg bg-slate-800 transition-colors
    ${isActionable ? 'cursor-pointer hover:bg-slate-700 hover:border-blue-500' : ''}
  `;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex items-center justify-center w-full">
        <label htmlFor={id} className={labelClasses}>
          {renderContent()}
          <input id={id} type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" disabled={isUploading} />
        </label>
      </div>
    </div>
  );
};

export default FileInput;