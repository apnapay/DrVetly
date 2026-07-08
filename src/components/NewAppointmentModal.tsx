import React, { useEffect, useState } from 'react';
import { Clock, Stethoscope, X, Search } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Patient, VetUser } from '../lib/types';

interface NewAppointmentModalProps {
  clinicId: string;
  vets: VetUser[];
  onClose: () => void;
  onCreated: () => void;
}

/**
 * The staff-facing "quick book" popup — a direct INSERT into `appointments`,
 * distinct from the public booking flow (create-booking edge function).
 * Same underlying table, so it shows up in the calendar identically and is
 * still protected by the `no_overlapping_vet_appointments` DB constraint.
 */
export default function NewAppointmentModal({ clinicId, vets, onClose, onCreated }: NewAppointmentModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [patientId, setPatientId] = useState('');
  const [vetId, setVetId] = useState(vets[0]?.id ?? '');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('09:00');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatients() {
      const query = supabase
        .from('patients')
        .select('id, clinic_id, client_id, name, species, breed, dob, weight_kg, microchip, notes, client:clients(first_name,last_name)')
        .order('name', { ascending: true })
        .limit(50);

      const { data } = search ? await query.ilike('name', `%${search}%`) : await query;
      if (data) setPatients(data as any);
    }
    loadPatients();
  }, [search]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !vetId) {
      setError('Select a patient and a veterinarian');
      return;
    }
    setSubmitting(true);
    setError(null);

    const startAt = new Date(`${date}T${time}:00`);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60000);

    const { error: insertError } = await supabase.from('appointments').insert({
      clinic_id: clinicId,
      patient_id: patientId,
      vet_id: vetId,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      reason: reason || 'General visit',
      status: 'SCHEDULED',
    });

    setSubmitting(false);

    if (insertError) {
      // Postgres code 23P01 = exclusion constraint violation, i.e. this vet
      // already has an overlapping appointment at this time.
      if ((insertError as any).code === '23P01') {
        setError('This veterinarian already has an appointment at that time. Please choose another slot.');
      } else {
        setError(insertError.message);
      }
      return;
    }

    onCreated();
  }

  return (
    <div className="fixed inset-0 bg-[#04044A]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-[460px] shadow-lg overflow-hidden border border-[#e3eaf6]">
        <div className="bg-[#04044A] p-6 text-white flex justify-between items-center border-b border-white/10">
          <div>
            <h3 className="font-bold text-lg tracking-tight">New appointment</h3>
            <p className="text-[11px] text-white/70 mt-0.5">Book a visit directly onto the schedule</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors border-none cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Patient</label>
            <div className="relative mb-2">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a92b8]" />
              <input
                type="text"
                placeholder="Search patients by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10"
              />
            </div>
            <select
              className="w-full px-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 font-semibold"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
            >
              <option value="">Select a patient…</option>
              {patients.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species}
                  {p.client ? ` · ${p.client.first_name} ${p.client.last_name}` : ''})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Veterinarian</label>
            <select
              className="w-full px-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 font-semibold"
              value={vetId}
              onChange={(e) => setVetId(e.target.value)}
              required
            >
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  Dr. {v.first_name} {v.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Date</label>
              <input
                type="date"
                className="w-full px-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 font-semibold"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Time</label>
              <div className="relative">
                <Clock size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a92b8]" />
                <input
                  type="time"
                  className="w-full pl-9 pr-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 font-semibold"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Duration</label>
            <select
              className="w-full px-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 font-semibold"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Reason for visit</label>
            <div className="relative">
              <Stethoscope size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a92b8]" />
              <input
                type="text"
                className="w-full pl-9 pr-4 py-3 border border-[#e3eaf6] rounded-xl text-xs text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/10 font-semibold"
                placeholder="e.g. Annual vaccination"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}

          <div className="pt-4 border-t border-[#e3eaf6] flex gap-3 justify-end text-xs font-semibold">
            <button type="button" onClick={onClose} className="btn btn-outline py-2.5 px-4 cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary py-2.5 px-5 cursor-pointer disabled:opacity-60">
              {submitting ? 'Booking…' : 'Book appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
