
import React from 'react';

interface FileInputProps {
  id: string;
  label: string;
  onChange: (file: File | null) => void;
  file: File | null;
}

const FileInput: React.FC<FileInputProps> = ({ id, label, onChange, file }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    } else {
      onChange(null);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 hover:border-blue-500 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-blue-400">Clique para enviar</span> ou arraste e solte</p>
            <p className="text-xs text-gray-500">Foto ou PDF (MAX. 10MB)</p>
          </div>
          <input id={id} type="file" className="hidden" onChange={handleFileChange} accept="image/*,.pdf" />
        </label>
      </div>
      {file && <p className="text-sm text-green-400 mt-2">Arquivo: {file.name}</p>}
    </div>
  );
};

export default FileInput;
