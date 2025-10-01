
export interface FormData {
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  proofOfResidence: File | null;
  photoId: File | null;
  otherDocuments: File | null;
}

export type AppStep = 'form' | 'scheduler';
export type BookingStatus = 'idle' | 'submitting' | 'success';

export interface Appointment {
  id: number;
  created_at: string;
  full_name: string;
  cpf: string;
  email: string;
  phone: string;
  appointment_datetime: string;
  proof_of_residence_url: string | null;
  photo_id_url: string | null;
  other_documents_url: string | null;
}

// Representa os dados do formulário de criação/edição de agendamentos
export type AppointmentFormData = Omit<Appointment, 'id' | 'created_at' | 'proof_of_residence_url' | 'photo_id_url' | 'other_documents_url'>;
