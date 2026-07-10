export interface Patient {
  id: string;
  name: string;
  species: 'Canine' | 'Feline' | 'Exotic' | string;
  breed: string;
  age: string;
  ownerName: string;
  avatar: string;
  status: string;
  lastVisit: string;
  weight: string;
  temp: string;
}

export interface Appointment {
  id: string;
  time: string; // e.g. "9:00 AM"
  patientId: string;
  reason: string;
  vetName: string;
  status: 'checkedin' | 'inprogress' | 'scheduled' | 'completed' | 'cancelled';
}

export interface SOAPNote {
  id: string;
  patientId: string;
  time: string;
  vetName: string;
  status: 'pending' | 'approved';
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  rawTranscript?: string;
}

export interface Invoice {
  id: string; // e.g. "#1046"
  patientId: string;
  clientName: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
}

export interface Message {
  id: string;
  senderName: string;
  text: string;
  time: string;
  isIncoming: boolean;
}

export interface Conversation {
  id: string;
  clientName: string;
  clientInitials: string;
  patientName: string;
  lastMessageText: string;
  lastMessageTime: string;
  isUnread: boolean;
  messages: Message[];
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'Lead Veterinarian' | 'Associate Veterinarian' | 'Vet Technician' | 'Receptionist' | 'Clinic Manager';
  status: 'Active' | 'Pending Invite' | 'Inactive';
  phone: string;
  avatar: string;
  notesCount: number;
  appointmentsCount: number;
  joinedDate: string;
}

