import { supabase, isSupabaseConfigured } from './supabaseClient';
import React from 'react';

/**
 * Render patient avatar (image or emoji)
 */
export function renderPatientAvatar(avatar?: string, sizeClass = 'w-10 h-10', textClass = 'text-lg') {
  if (avatar && (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('blob:'))) {
    return (
      <img 
        src={avatar} 
        alt="Patient Avatar" 
        className={`${sizeClass} rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0`} 
      />
    );
  }
  return (
    <span className={`patient-avatar ${sizeClass} flex items-center justify-center rounded-2xl bg-slate-100 ${textClass} flex-shrink-0 shadow-xs border border-slate-200/60`}>
      {avatar || '🐶'}
    </span>
  );
}

/**
 * Upload file to Supabase Storage Bucket ('patient-records' / 'clinical-attachments')
 */
export async function uploadToSupabaseStorage(file: File, folder: string = 'records'): Promise<string> {
  if (!isSupabaseConfigured || !supabase) {
    // Return mock object URL if Supabase storage is not configured
    return URL.createObjectURL(file);
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('patient-records')
    .upload(filePath, file, { upsert: true });

  if (error) {
    console.error('Supabase storage upload error:', error.message);
    throw new Error(`Failed to upload file to storage: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('patient-records')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Save Patient Record to Supabase
 */
export async function syncPatientToSupabase(patient: {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  ownerName: string;
  weight: string;
  temp: string;
  avatar?: string;
  status?: string;
  lastVisit?: string;
  clinicId?: string;
}) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;
    const isValidUuid = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    const { error } = await supabase.from('patients').upsert({
      id: patient.id,
      ...(isValidUuid ? { user_id: userId } : {}),
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      age: patient.age,
      owner_name: patient.ownerName,
      weight: patient.weight,
      temp: patient.temp,
      avatar: patient.avatar || '🐶',
      status: patient.status || 'New patient',
      last_visit: patient.lastVisit || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updated_at: new Date().toISOString()
    });
    if (error) {
      console.debug('Supabase patient sync notice:', error.message);
    }
  } catch (err) {
    // ignore network or offline exceptions gracefully
  }
}

/**
 * Save Invoice / Billing Record to Supabase
 */
export async function syncInvoiceToSupabase(invoice: {
  id: string;
  patientId: string;
  clientName: string;
  date: string;
  amount: number;
  status: string;
}) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase.from('invoices').upsert({
      id: invoice.id,
      patient_id: invoice.patientId,
      client_name: invoice.clientName,
      date: invoice.date,
      amount: invoice.amount,
      status: invoice.status.toUpperCase(),
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Supabase invoice sync error:', error.message);
  } catch (err) {
    console.error('Invoice sync exception:', err);
  }
}

/**
 * Save SOAP Note Record to Supabase
 */
export async function syncSoapNoteToSupabase(note: {
  id: string;
  patientId: string;
  time: string;
  vetName: string;
  status: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase.from('soap_notes').upsert({
      id: note.id,
      patient_id: note.patientId,
      time: note.time,
      vet_name: note.vetName,
      status: note.status.toUpperCase(),
      subjective: note.subjective,
      objective: note.objective,
      assessment: note.assessment,
      plan: note.plan,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Supabase SOAP note sync error:', error.message);
  } catch (err) {
    console.error('SOAP note sync exception:', err);
  }
}

/**
 * Save Booking Event Type to Supabase
 */
export async function syncEventTypeToSupabase(et: {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  location_type: string;
  location_details: string;
  color: string;
  is_active: boolean;
}) {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    const { error } = await supabase.from('booking_event_types').upsert({
      id: et.id,
      name: et.name,
      slug: et.slug,
      description: et.description,
      duration_minutes: et.duration_minutes,
      location_type: et.location_type,
      location_details: et.location_details,
      color: et.color,
      is_active: et.is_active,
      updated_at: new Date().toISOString()
    });
    if (error) console.error('Supabase event type sync error:', error.message);
  } catch (err) {
    console.error('Event type sync exception:', err);
  }
}
