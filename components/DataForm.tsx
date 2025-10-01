
import React, { useState, useCallback } from 'react';
import type { FormData, ClientData } from '../types';
import { ScalesOfJusticeIcon } from './icons/ScalesOfJusticeIcon';
import FileInput from './FileInput';
import { supabase } from '../lib/supabaseClient';

interface DataFormProps {
  onSubmit: (data: ClientData) => void;
}

type UploadStatus = 'idle' | 'selected' | 'uploading' | 'success' | 'error';
interface UploadProgress {
  status: UploadStatus;
  progress: number;
  error?: string;
}

const InputField: React.FC<{
  name: keyof Omit<FormData, 'proofOfResidence' | 'photoId' | 'otherDocuments'>;
  label: string;
  value: string;
  error: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}> = ({ name, label, value, error, onChange, type = 'text', placeholder }) => (
  <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input
          type={type}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-slate-800 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
  </div>
);

const DataForm: React.FC<DataFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    proofOfResidence: null,
    photoId: null,
    otherDocuments: null,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({
    proofOfResidence: { status: 'idle', progress: 0 },
    photoId: { status: 'idle', progress: 0 },
    otherDocuments: { status: 'idle', progress: 0 },
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let processedValue = value;

    switch (name) {
      case 'fullName':
        processedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
        break;
      case 'cpf':
        processedValue = value.replace(/\D/g, '').slice(0, 11);
        break;
      case 'phone':
        processedValue = value.replace(/\D/g, '').slice(0, 11);
        break;
      default:
        break;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  }, []);


  const handleFileChange = useCallback((name: keyof Omit<FormData, 'fullName' | 'cpf' | 'email' | 'phone'>, file: File | null) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    setUploadProgress(prev => ({
      ...prev,
      [name]: {
        status: file ? 'selected' : 'idle',
        progress: 0,
        error: undefined,
      },
    }));
    // Clear file-specific error on new file selection
    if (errors[name]) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
        });
    }
  }, [errors]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Nome completo é obrigatório.";
    
    if (!formData.cpf) {
      newErrors.cpf = "CPF é obrigatório.";
    } else if (formData.cpf.length !== 11) {
      newErrors.cpf = "CPF deve conter 11 dígitos.";
    }

    if (!formData.email) {
      newErrors.email = "E-mail é obrigatório.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Formato de e-mail inválido.";
    }
    
    if (!formData.phone) {
      newErrors.phone = "Telefone é obrigatório.";
    } else if (!/^\d{10,11}$/.test(formData.phone)) {
      newErrors.phone = "Telefone deve conter DDD + 8 ou 9 dígitos.";
    }

    if (!formData.proofOfResidence) newErrors.proofOfResidence = "Comprovante de residência é obrigatório.";
    if (!formData.photoId) newErrors.photoId = "Documento com foto é obrigatório.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFileWithProgress = (fieldName: string, file: File | null, folderName: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const filePath = `${folderName}/${fieldName}-${Date.now()}-${file.name}`;
        
        const upload = async () => {
          try {
            const { data: signedUrlData, error: signedUrlError } = await supabase.storage
              .from('documents')
              .createSignedUploadUrl(filePath);

            if (signedUrlError) throw signedUrlError;
            
            const { signedUrl } = signedUrlData;
            const xhr = new XMLHttpRequest();
            
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                setUploadProgress(prev => ({
                  ...prev,
                  [fieldName]: { ...prev[fieldName], status: 'uploading', progress: percentComplete }
                }));
              }
            };
            
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
                    setUploadProgress(prev => ({
                        ...prev,
                        [fieldName]: { ...prev[fieldName], status: 'success', progress: 100 }
                    }));
                    resolve(data.publicUrl);
                } else {
                     const errorMsg = `Erro no envio: ${xhr.statusText}`;
                     setUploadProgress(prev => ({
                        ...prev,
                        [fieldName]: { status: 'error', progress: 0, error: errorMsg }
                    }));
                    reject(new Error(errorMsg));
                }
            };

            xhr.onerror = () => {
              const errorMsg = 'Erro de rede durante o envio.';
              setUploadProgress(prev => ({
                  ...prev,
                  [fieldName]: { status: 'error', progress: 0, error: errorMsg }
              }));
              reject(new Error(errorMsg));
            };

            xhr.open('PUT', signedUrl, true);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
          
          } catch (error) {
              const message = error instanceof Error ? error.message : 'Erro desconhecido';
              const errorMsg = `Falha ao preparar upload: ${message}`;
              setUploadProgress(prev => ({
                  ...prev,
                  [fieldName]: { status: 'error', progress: 0, error: errorMsg }
              }));
              reject(error);
          }
        }
        upload();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const sanitizeFolderName = (name: string) => {
        return name
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '_');
    };

    const folderName = sanitizeFolderName(formData.fullName);

    try {
      const [proofOfResidenceUrl, photoIdUrl, otherDocumentsUrl] = await Promise.all([
        uploadFileWithProgress('proofOfResidence', formData.proofOfResidence, folderName),
        uploadFileWithProgress('photoId', formData.photoId, folderName),
        uploadFileWithProgress('otherDocuments', formData.otherDocuments, folderName),
      ]);
      
      const submittedData: ClientData = {
        fullName: formData.fullName,
        cpf: formData.cpf,
        email: formData.email,
        phone: formData.phone,
        proofOfResidenceUrl,
        photoIdUrl,
        otherDocumentsUrl
      };

      onSubmit(submittedData);

    } catch (error) {
      console.error("Falha no upload de um ou mais arquivos:", error);
      alert("Ocorreu um erro durante o envio dos arquivos. Verifique os campos marcados e tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-gray-700">
      <div className="text-center mb-8">
        <div className="flex justify-center items-center gap-4">
          <ScalesOfJusticeIcon className="w-12 h-12 text-blue-400"/>
          <div>
            <h1 className="text-3xl font-bold text-white">Dr. Daniel</h1>
            <p className="text-gray-400">Coleta de Dados para Consulta</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-6" disabled={isSubmitting}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField name="fullName" label="Nome Completo" placeholder="Apenas letras e espaços" value={formData.fullName} onChange={handleChange} error={errors.fullName} />
              <InputField name="cpf" label="CPF" placeholder="Apenas números" value={formData.cpf} onChange={handleChange} error={errors.cpf} />
              <InputField name="email" label="E-mail" type="email" placeholder="seuemail@exemplo.com" value={formData.email} onChange={handleChange} error={errors.email}/>
              <InputField name="phone" label="Telefone" type="tel" placeholder="DDD + número" value={formData.phone} onChange={handleChange} error={errors.phone}/>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div>
                  <FileInput 
                    id="proofOfResidence"
                    label="Comprovante de Residência"
                    file={formData.proofOfResidence}
                    onChange={(file) => handleFileChange('proofOfResidence', file)}
                    status={uploadProgress.proofOfResidence.status}
                    progress={uploadProgress.proofOfResidence.progress}
                    error={uploadProgress.proofOfResidence.error}
                  />
                  {errors.proofOfResidence && <p className="text-red-400 text-xs mt-1">{errors.proofOfResidence}</p>}
                </div>
                <div>
                  <FileInput 
                    id="photoId"
                    label="Documento com Foto (RG, CNH, etc.)"
                    file={formData.photoId}
                    onChange={(file) => handleFileChange('photoId', file)}
                    status={uploadProgress.photoId.status}
                    progress={uploadProgress.photoId.progress}
                    error={uploadProgress.photoId.error}
                  />
                  {errors.photoId && <p className="text-red-400 text-xs mt-1">{errors.photoId}</p>}
                </div>
                <div>
                  <FileInput 
                    id="otherDocuments"
                    label="Outros Documentos Relevantes"
                    file={formData.otherDocuments}
                    onChange={(file) => handleFileChange('otherDocuments', file)}
                    status={uploadProgress.otherDocuments.status}
                    progress={uploadProgress.otherDocuments.progress}
                    error={uploadProgress.otherDocuments.error}
                  />
                </div>
            </div>
        </fieldset>
        
        <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:bg-blue-800 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Enviando Arquivos...' : 'Avançar para Agendamento'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default DataForm;