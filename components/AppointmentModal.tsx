import React, { useState, useEffect } from 'react';
import type { Appointment, AppointmentFormData } from '../types';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AppointmentFormData) => void;
  appointment: Appointment | null;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSave, appointment }) => {
  const [formData, setFormData] = useState<AppointmentFormData>({
    full_name: '',
    cpf: '',
    email: '',
    phone: '',
    appointment_datetime: new Date().toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        full_name: appointment.full_name,
        cpf: appointment.cpf,
        email: appointment.email,
        phone: appointment.phone,
        appointment_datetime: new Date(appointment.appointment_datetime).toISOString().slice(0, 16),
      });
    } else {
      setFormData({
        full_name: '',
        cpf: '',
        email: '',
        phone: '',
        appointment_datetime: new Date().toISOString().slice(0, 16),
      });
    }
  }, [appointment, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Convert local datetime-local string back to ISO string for DB
    const dataToSave = {
      ...formData,
      appointment_datetime: new Date(formData.appointment_datetime).toISOString(),
    };
    await onSave(dataToSave);
    setLoading(false);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl border border-gray-700 w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          {appointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField name="full_name" label="Nome Completo" value={formData.full_name} onChange={handleChange} />
          <InputField name="cpf" label="CPF" value={formData.cpf} onChange={handleChange} />
          <InputField name="email" label="E-mail" type="email" value={formData.email} onChange={handleChange} />
          <InputField name="phone" label="Telefone" type="tel" value={formData.phone} onChange={handleChange} />
          <div>
            <label htmlFor="appointment_datetime" className="block text-sm font-medium text-gray-300 mb-2">Data e Hora</label>
            <input
              type="datetime-local"
              id="appointment_datetime"
              name="appointment_datetime"
              value={formData.appointment_datetime}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 [color-scheme:dark]"
              required
            />
          </div>
          <div className="mt-6 flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full justify-center py-2 px-4 border border-gray-600 rounded-md text-sm font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Agendamento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField: React.FC<{
  name: keyof Omit<AppointmentFormData, 'appointment_datetime'>;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}> = ({ name, label, value, onChange, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full bg-slate-900 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
  </div>
);

export default AppointmentModal;
