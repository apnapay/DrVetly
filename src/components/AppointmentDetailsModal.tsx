import React, { useState } from 'react';
import { X, Clock, Stethoscope, Mail, Phone } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Appointment, AppointmentStatus } from '../lib/types';

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
  onStatusChanged: () => void;
}

const STATUS_FLOW: { value: AppointmentStatus; label: string }[] = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CHECKED_IN', label: 'Checked in' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No-show' },
];

export default function AppointmentDetailsModal({ appointment, onClose, onStatusChanged }: AppointmentDetailsModalProps) {
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState<AppointmentStatus>(appointment.status);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(next: AppointmentStatus) {
    setUpdating(true);
    setError(null);
    const { error: updateError } = await supabase.from('appointments').update({ status: next }).eq('id', appointment.id);
    setUpdating(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setStatus(next);
    onStatusChanged();
  }

  const client = appointment.patient?.client;
  const booking = appointment.booking;

  return (
    <div className="fixed inset-0 bg-[#04044A]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-[520px] shadow-2xl overflow-hidden border border-[#e3eaf6]">
        <div className="bg-[#04044A] px-6 py-5 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Visit details</h3>
            <p className="text-xs text-white/70">
              {booking ? 'Booked online by the client' : 'Booked directly by clinic staff'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer border-none"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-[#e3eaf6] space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 font-mono">Patient:</span>
              <span className="font-bold text-[#04044A]">
                {appointment.patient?.name} ({appointment.patient?.breed ?? appointment.patient?.species})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-mono flex items-center gap-1.5">
                <Clock size={12} /> Time:
              </span>
              <span className="font-bold text-[#0057D9]">
                {new Date(appointment.start_at).toLocaleString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-mono flex items-center gap-1.5">
                <Stethoscope size={12} /> Vet:
              </span>
              <span className="font-bold text-[#04044A]">
                {appointment.vet ? `Dr. ${appointment.vet.first_name} ${appointment.vet.last_name}` : 'Unassigned'}
              </span>
            </div>
            {client && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-mono flex items-center gap-1.5">
                    <Mail size={12} /> Client:
                  </span>
                  <span className="font-bold text-[#04044A]">
                    {client.first_name} {client.last_name}
                  </span>
                </div>
                {client.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-mono">Email:</span>
                    <span className="font-bold text-[#04044A]">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-mono flex items-center gap-1.5">
                      <Phone size={12} /> Phone:
                    </span>
                    <span className="font-bold text-[#04044A]">{client.phone}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {booking && booking.answers?.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-[#04044A] uppercase tracking-wider font-mono text-[11px]">Pre-qualification answers</h4>
              <div className="space-y-2">
                {booking.answers.map((a, idx) => (
                  <div key={a.questionId ?? idx} className="p-3 rounded-xl bg-blue-50/40 border border-blue-100">
                    <div className="text-[10px] text-blue-700 font-mono font-bold">{a.label}</div>
                    <div className="text-xs font-semibold text-[#04044A] mt-0.5">{a.answer}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 space-y-2">
            <h4 className="font-bold text-[#04044A] uppercase tracking-wider font-mono text-[11px]">Update status</h4>
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s.value}
                  disabled={updating}
                  onClick={() => handleStatusChange(s.value)}
                  className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all cursor-pointer disabled:opacity-50 ${
                    status === s.value ? 'bg-[#04044A] text-white border-[#04044A]' : 'bg-white text-[#5a6291] border-[#e3eaf6] hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-[#e3eaf6] flex justify-end">
          <button onClick={onClose} className="btn btn-primary btn-sm px-6 font-bold cursor-pointer text-xs">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
