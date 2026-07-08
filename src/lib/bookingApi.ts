import { supabase } from './supabaseClient';
import type { AvailabilitySlot, PublicBookingPageData } from './types';

export async function getBookingPage(clinicSlug: string): Promise<PublicBookingPageData> {
  if (!supabase) {
    return {
      clinic: { id: 'demo', name: 'HotiVet Animal Hospital', slug: clinicSlug, timezone: 'America/New_York' },
      eventTypes: [
        {
          id: 'et1',
          clinic_id: 'demo',
          name: '30-Min Wellness Exam',
          slug: 'wellness-exam',
          description: 'Comprehensive physical examination and vaccination review.',
          duration_minutes: 30,
          buffer_before_minutes: 0,
          buffer_after_minutes: 10,
          min_notice_hours: 2,
          max_days_in_advance: 45,
          location_type: 'IN_PERSON',
          location_details: 'Exam Room 1',
          color: '#0057D9',
          is_active: true,
          position: 0,
          booking_questions: [
            { id: 'q1', event_type_id: 'et1', label: "Pet's name and species", type: 'TEXT', required: true, position: 0 },
            { id: 'q2', event_type_id: 'et1', label: 'Reason for visit', type: 'TEXTAREA', required: true, position: 1 },
          ],
        },
      ],
    };
  }

  const { data: clinic, error: clinicErr } = await supabase.from('clinics').select('id, name, slug, timezone').eq('slug', clinicSlug).single();
  if (clinicErr || !clinic) throw new Error('Clinic not found');

  const { data: eventTypes, error: etErr } = await supabase
    .from('booking_event_types')
    .select('*, booking_questions(*)')
    .eq('clinic_id', clinic.id)
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (etErr) throw new Error('Could not load event types');

  return {
    clinic,
    eventTypes: eventTypes || [],
  };
}

export async function getAvailability(params: { clinicSlug: string; eventTypeSlug: string; from: string; to: string }): Promise<{ slots: AvailabilitySlot[] }> {
  const slots: AvailabilitySlot[] = [];
  const startDate = new Date(params.from);
  const endDate = new Date(params.to);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const hours = [9, 10, 11, 14, 15, 16];
    hours.forEach((h) => {
      const slotStart = new Date(d);
      slotStart.setHours(h, 0, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
      if (slotStart > new Date()) {
        slots.push({ start: slotStart.toISOString(), end: slotEnd.toISOString() });
      }
    });
  }

  return { slots };
}

export async function createBooking(params: {
  clinicSlug: string;
  eventTypeSlug: string;
  startAt: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone?: string;
  patientName: string;
  answers: { questionId?: string; label: string; answer: string }[];
}): Promise<{ success: boolean }> {
  if (!supabase) {
    return { success: true };
  }

  const { data: clinic } = await supabase.from('clinics').select('id').eq('slug', params.clinicSlug).single();
  if (!clinic) throw new Error('Clinic not found');

  const { data: et } = await supabase.from('booking_event_types').select('*').eq('clinic_id', clinic.id).eq('slug', params.eventTypeSlug).single();
  if (!et) throw new Error('Event type not found');

  let { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('clinic_id', clinic.id)
    .eq('email', params.clientEmail)
    .maybeSingle();

  if (!client) {
    const { data: newClient, error: clientErr } = await supabase
      .from('clients')
      .insert({ clinic_id: clinic.id, first_name: params.clientFirstName, last_name: params.clientLastName, email: params.clientEmail, phone: params.clientPhone })
      .select('id')
      .single();
    if (clientErr) throw new Error(clientErr.message);
    client = newClient;
  }

  const { data: patient, error: patientErr } = await supabase
    .from('patients')
    .insert({
      clinic_id: clinic.id,
      client_id: client.id,
      name: params.patientName,
      species: 'Canine',
      breed: 'Mixed',
    })
    .select('id')
    .single();

  if (patientErr) throw new Error(patientErr.message);

  const startAtDate = new Date(params.startAt);
  const endAtDate = new Date(startAtDate.getTime() + et.duration_minutes * 60000);

  const { data: appt, error: apptErr } = await supabase
    .from('appointments')
    .insert({
      clinic_id: clinic.id,
      patient_id: patient.id,
      vet_id: et.vet_id || null,
      start_at: startAtDate.toISOString(),
      end_at: endAtDate.toISOString(),
      reason: et.name,
      status: 'SCHEDULED',
    })
    .select('id')
    .single();

  if (apptErr) {
    if (apptErr.code === '23P01') {
      throw new Error('This time slot was just booked by someone else. Please choose another slot.');
    }
    throw new Error(apptErr.message);
  }

  await supabase.from('bookings').insert({
    clinic_id: clinic.id,
    event_type_id: et.id,
    appointment_id: appt.id,
    client_email: params.clientEmail,
    client_phone: params.clientPhone,
    patient_name: params.patientName,
    answers: params.answers,
    status: 'CONFIRMED',
  });

  return { success: true };
}
