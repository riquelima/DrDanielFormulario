import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment, AppointmentFormData } from '../types';
import { ScalesOfJusticeIcon } from './icons/ScalesOfJusticeIcon';
import AppointmentModal from './AppointmentModal';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { DeleteIcon } from './icons/DeleteIcon';

const AdminDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_datetime', { ascending: false });

    if (error) {
      setError(error.message);
      console.error("Erro ao buscar agendamentos:", error);
    } else {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAdd = () => {
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      const { error } = await supabase.from('appointments').delete().match({ id });
      if (error) {
        alert(`Erro ao excluir: ${error.message}`);
      } else {
        fetchAppointments();
      }
    }
  };

  const handleSave = async (formData: AppointmentFormData) => {
    if (editingAppointment) {
      // Update
      const { error } = await supabase
        .from('appointments')
        .update(formData)
        .match({ id: editingAppointment.id });
      if (error) {
        alert(`Erro ao atualizar: ${error.message}`);
      }
    } else {
      // Create
      const { error } = await supabase.from('appointments').insert(formData);
      if (error) {
        alert(`Erro ao criar: ${error.message}`);
      }
    }
    setIsModalOpen(false);
    fetchAppointments();
  };
  
  const DocumentLink: React.FC<{ url: string | null; defaultText?: string }> = ({ url, defaultText = 'Não enviado' }) => {
    if (!url) {
      return <span className="text-gray-500">{defaultText}</span>;
    }
    const fileName = decodeURIComponent(url.split('/').pop()?.split('?')[0].split('-').slice(2).join('-') || 'documento');
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline break-all">
        {fileName}
      </a>
    );
  };

  return (
    <>
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        appointment={editingAppointment}
      />
      <div className="bg-slate-800 p-4 sm:p-8 rounded-lg shadow-2xl border border-gray-700 w-full max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <ScalesOfJusticeIcon className="w-12 h-12 text-blue-400 flex-shrink-0" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Painel do Administrador</h1>
              <p className="text-gray-400">Gerenciamento de Agendamentos</p>
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
             <button
              onClick={handleAdd}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500"
            >
              <PlusIcon className="w-5 h-5" />
              Adicionar
            </button>
            <button
              onClick={logout}
              className="flex-1 sm:flex-none py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-lg">
          {loading && <p className="p-4 text-center text-gray-400">Carregando agendamentos...</p>}
          {error && <p className="p-4 text-center text-red-400">Erro ao carregar dados: {error}</p>}
          {!loading && !error && appointments.length === 0 && (
            <p className="p-4 text-center text-gray-500">Nenhum agendamento encontrado.</p>
          )}

          {/* Mobile View: Cards */}
          <div className="md:hidden space-y-4 p-2">
            {appointments.map(app => (
              <div key={app.id} className="bg-slate-800 rounded-lg p-4 border border-gray-700">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-white">{app.full_name}</div>
                    <div className="text-sm text-gray-400">{new Date(app.appointment_datetime).toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(app)} className="p-2 text-gray-400 hover:text-white"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(app.id)} className="p-2 text-gray-400 hover:text-red-400"><DeleteIcon className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-700 pt-4 space-y-2 text-sm">
                  <p><strong className="text-gray-400">CPF:</strong> {app.cpf}</p>
                  <p><strong className="text-gray-400">Email:</strong> {app.email}</p>
                  <p><strong className="text-gray-400">Telefone:</strong> {app.phone}</p>
                  <div className="space-y-1 pt-2">
                    <p><strong className="text-gray-400">Comp. Residência:</strong> <DocumentLink url={app.proof_of_residence_url} /></p>
                    <p><strong className="text-gray-400">Doc. Foto:</strong> <DocumentLink url={app.photo_id_url} /></p>
                    <p><strong className="text-gray-400">Outros:</strong> <DocumentLink url={app.other_documents_url} /></p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-slate-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data Agendamento</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contato</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Documentos</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-gray-700">
                {appointments.map(app => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{new Date(app.appointment_datetime).toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white"><div className="font-medium">{app.full_name}</div><div className="text-gray-400">CPF: {app.cpf}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white"><div>{app.email}</div><div className="text-gray-400">{app.phone}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white space-y-1 align-top">
                      <div><DocumentLink url={app.proof_of_residence_url} defaultText="Comp. Residência" /></div>
                      <div><DocumentLink url={app.photo_id_url} defaultText="Doc. Foto" /></div>
                      <div><DocumentLink url={app.other_documents_url} defaultText="Outros Docs" /></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                         <button onClick={() => handleEdit(app)} className="p-2 text-gray-400 hover:text-white"><EditIcon className="w-5 h-5" /></button>
                         <button onClick={() => handleDelete(app.id)} className="p-2 text-gray-400 hover:text-red-400"><DeleteIcon className="w-5 h-5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
