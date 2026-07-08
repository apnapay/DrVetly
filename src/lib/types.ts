export type AppointmentStatus = 'SCHEDULED' | 'CHECKED_IN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type LocationType = 'IN_PERSON' | 'VIDEO' | 'PHONE';

export type QuestionType = 'TEXT' | 'TEXTAREA' | 'SELECT' | 'RADIO' | 'CHECKBOX';

export interface BookingQuestion {
  id: string;
  event_type_id: string;
  label: string;
  type: QuestionType;
  options?: string[] | null;
  required: boolean;
  position: number;
}

export interface BookingEventType {
  id: string;
  clinic_id: string;
  vet_id?: string | null;
  schedule_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  min_notice_hours: number;
  max_days_in_advance: number;
  location_type: LocationType;
  location_details?: string | null;
  color: string;
  is_active: boolean;
  position: number;
  booking_questions?: BookingQuestion[];
}

export interface VetUser {
  id: string;
  clinic_id: string;
  first_name: string;
  last_name: string;
  role: 'VET' | 'ADMIN';
  active: boolean;
}

export interface ClientRecord {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
}

export interface Patient {
  id: string;
  clinic_id?: string;
  client_id?: string;
  name: string;
  species: 'Canine' | 'Feline' | 'Exotic' | string;
  breed: string;
  age?: string;
  dob?: string;
  ownerName?: string;
  owner_name?: string;
  avatar?: string;
  status?: string;
  lastVisit?: string;
  weight?: string;
  weight_kg?: number;
  temp?: string;
  microchip?: string;
  notes?: string;
  client?: ClientRecord;
}

export interface BookingAnswer {
  questionId?: string;
  label: string;
  answer: string;
}

export interface BookingRecord {
  id: string;
  clinic_id: string;
  event_type_id: string;
  client_email: string;
  client_phone?: string;
  patient_name: string;
  answers: BookingAnswer[];
  status: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  patient_id: string;
  vet_id: string;
  start_at: string;
  end_at: string;
  reason?: string;
  status: AppointmentStatus;
  patient?: Patient;
  vet?: VetUser;
  booking?: BookingRecord;
  time?: string;
  patientId?: string;
  vetName?: string;
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
  id: string;
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

export interface AvailabilitySlot {
  start: string;
  end: string;
}

export interface PublicEventType extends BookingEventType {
  booking_questions: BookingQuestion[];
}

export interface PublicBookingPageData {
  clinic: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
  };
  eventTypes: PublicEventType[];
}
