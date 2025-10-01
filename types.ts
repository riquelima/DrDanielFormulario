
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
