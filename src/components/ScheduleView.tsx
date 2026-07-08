import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Activity,
  UserCheck,
  ExternalLink,
  Settings2,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useCurrentClinic } from '../lib/useCurrentClinic';
import { renderPatientAvatar } from '../lib/supabaseStorage';
import type { Appointment, VetUser } from '../lib/types';
import NewAppointmentModal from './NewAppointmentModal';
import AppointmentDetailsModal from './AppointmentDetailsModal';
import EventTypesManagerModal from './EventTypesManagerModal';

const HOURS = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'];
const DAY_START_HOUR = 8;
const SLOT_HEIGHT_PX = 64;

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function statusClass(status: Appointment['status']): string {
  switch (status) {
    case 'CHECKED_IN':
      return 'checkedin';
    case 'IN_PROGRESS':
      return 'inprogress';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
    case 'NO_SHOW':
      return 'cancelled';
    default:
      return 'scheduled';
  }
}

export default function ScheduleView() {
  const clinic = useCurrentClinic();

  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vets, setVets] = useState<VetUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [vetFilter, setVetFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'Time' | 'Urgency' | 'Vet Assigned'>('Time');

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [showEventTypesModal, setShowEventTypesModal] = useState(false);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d;
  }, [weekStart]);

  const fetchAppointments = useCallback(async () => {
    if (!clinic.clinicId) return;
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `id, clinic_id, patient_id, vet_id, start_at, end_at, reason, status, created_at, updated_at,
         patient:patients ( id, name, species, breed, avatar, client:clients ( id, first_name, last_name ) ),
         vet:users ( id, first_name, last_name ),
         booking:bookings ( id, event_type_id, answers, client_email, client_phone, patient_name, status )`,
      )
      .gte('start_at', weekStart.toISOString())
      .lt('start_at', weekEnd.toISOString())
      .order('start_at', { ascending: true });

    if (!error && data) {
      // Supabase returns joined singular relations as arrays in some setups —
      // normalize to a single object so the rest of the UI can rely on a
      // consistent shape regardless of the generated types.
      const normalized = data.map((row: any) => ({
        ...row,
        patient: Array.isArray(row.patient) ? row.patient[0] : row.patient,
        vet: Array.isArray(row.vet) ? row.vet[0] : row.vet,
        booking: Array.isArray(row.booking) ? row.booking[0] : row.booking,
      }));
      setAppointments(normalized as Appointment[]);
    }
    setLoading(false);
  }, [clinic.clinicId, weekStart, weekEnd]);

  const fetchVets = useCallback(async () => {
    if (!clinic.clinicId) return;
    const { data } = await supabase.from('users').select('id, clinic_id, first_name, last_name, role, active').eq('role', 'VET').eq('active', true);
    if (data) setVets(data as VetUser[]);
  }, [clinic.clinicId]);

  useEffect(() => {
    setLoading(true);
    fetchAppointments();
    fetchVets();
  }, [fetchAppointments, fetchVets]);

  // Realtime: any insert/update/delete on appointments for this clinic
  // (including ones created by the public booking page) refreshes the
  // view instantly — this is the "autopilot" piece the booking page feeds.
  useEffect(() => {
    if (!clinic.clinicId) return;

    const channel = supabase
      .channel(`schedule-appointments-${clinic.clinicId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `clinic_id=eq.${clinic.clinicId}` },
        () => {
          fetchAppointments();
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings', filter: `clinic_id=eq.${clinic.clinicId}` },
        (payload) => {
          // Distinct toast-style signal for online bookings specifically.
          // eslint-disable-next-line no-console
          console.info('New online booking received', payload.new);
          fetchAppointments();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [clinic.clinicId, fetchAppointments]);

  const filtered = useMemo(() => {
    let list = vetFilter === 'All' ? appointments : appointments.filter((a) => a.vet_id === vetFilter);
    
    return [...list].sort((a, b) => {
      if (sortBy === 'Time') {
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
      }
      if (sortBy === 'Urgency') {
        const rank = (status: string) => {
          if (status === 'CHECKED_IN') return 0;
          if (status === 'IN_PROGRESS') return 1;
          if (status === 'SCHEDULED') return 2;
          return 3;
        };
        const rA = rank(a.status);
        const rB = rank(b.status);
        if (rA !== rB) return rA - rB;
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
      }
      if (sortBy === 'Vet Assigned') {
        const nameA = (a.vet?.first_name || '') + (a.vet?.last_name || '');
        const nameB = (b.vet?.first_name || '') + (b.vet?.last_name || '');
        return nameA.localeCompare(nameB);
      }
      return 0;
    });
  }, [appointments, vetFilter, sortBy]);

  const checkedInCount = appointments.filter((a) => a.status === 'CHECKED_IN').length;
  const inProgressCount = appointments.filter((a) => a.status === 'IN_PROGRESS').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  function positionForAppt(appt: Appointment) {
    const start = new Date(appt.start_at);
    const end = new Date(appt.end_at);
    const startMinutesFromDayStart = (start.getHours() - DAY_START_HOUR) * 60 + start.getMinutes();
    const durationMinutes = (end.getTime() - start.getTime()) / 60000;
    const top = (startMinutesFromDayStart / 60) * SLOT_HEIGHT_PX;
    const height = Math.max((durationMinutes / 60) * SLOT_HEIGHT_PX, 36);
    return { top, height };
  }

  if (clinic.loading) {
    return <div className="p-10 text-sm text-[#5a6291]">Loading your clinic…</div>;
  }
  if (clinic.error) {
    return <div className="p-10 text-sm text-red-600">{clinic.error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 welcome-band fade-in">
        <div>
          <h2>Practice Schedule</h2>
          <p>Real-time clinical agenda — updates instantly when clients book online.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowEventTypesModal(true)}
            className="btn btn-outline bg-white hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
          >
            <Settings2 size={14} className="mr-1.5" /> Booking event types
          </button>
          {clinic.clinicSlug && (
            <a
              href={`/book/${clinic.clinicSlug}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-soft bg-blue-50 text-[#0057D9] hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer inline-flex items-center"
            >
              <ExternalLink size={14} className="mr-1.5" /> View public booking page
            </a>
          )}
          <button
            onClick={() => setShowNewModal(true)}
            className="btn btn-primary transition-all text-xs font-bold cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.4} /> New appointment
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid fade-in d1">
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-ic blue"><CalendarIcon size={17} className="text-white" /></div>
            <span className="kpi-trend up">Live</span>
          </div>
          <div className="kpi-label">This week</div>
          <div className="kpi-value">{appointments.length}</div>
          <div className="kpi-sub">Visits scheduled</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-ic green"><UserCheck size={17} className="text-white" /></div>
            <span className="kpi-trend up">Waiting</span>
          </div>
          <div className="kpi-label">Checked in</div>
          <div className="kpi-value text-[#00875A]">{checkedInCount}</div>
          <div className="kpi-sub">Waiting in lobby</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-ic cyan"><Activity size={17} className="text-white" /></div>
            <span className="kpi-trend up">Active</span>
          </div>
          <div className="kpi-label">In progress</div>
          <div className="kpi-value text-[#00A4FF]">{inProgressCount}</div>
          <div className="kpi-sub">Exams underway</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-top">
            <div className="kpi-ic navy"><Check size={17} className="text-white" /></div>
            <span className="kpi-trend up">Completed</span>
          </div>
          <div className="kpi-label">Closed visits</div>
          <div className="kpi-value text-[#5a6291]">{completedCount}</div>
          <div className="kpi-sub">Clinically resolved</div>
        </div>
      </div>

      {/* Week Calendar */}
      <div className="panel fade-in d2">
        <div className="panel-head">
          <div>
            <h3>
              Week of {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} &ndash;{' '}
              {weekDays[6].toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}
            </h3>
            <div className="ph-sub">{loading ? 'Loading…' : `${filtered.length} appointments shown (${appointments.length} total)`}</div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#5a6291]">
              <span>Clinician:</span>
              <select
                value={vetFilter}
                onChange={(e) => setVetFilter(e.target.value)}
                className="px-3 py-1.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white cursor-pointer"
              >
                <option value="All">All Vets</option>
                {vets.map((v) => (
                  <option key={v.id} value={v.id}>Dr. {v.first_name} {v.last_name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-[#5a6291]">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white cursor-pointer"
              >
                <option value="Time">Time (Earliest)</option>
                <option value="Urgency">Urgency (Status)</option>
                <option value="Vet Assigned">Vet Assigned</option>
              </select>
            </div>

            <div className="flex gap-1.5 border-l border-[#e3eaf6] pl-3">
              <button
                className="icon-btn"
                title="Previous week"
                onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() - 7); return n; })}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="btn btn-soft btn-sm font-semibold"
                onClick={() => setWeekStart(startOfWeek(new Date()))}
              >
                Today
              </button>
              <button
                className="icon-btn"
                title="Next week"
                onClick={() => setWeekStart((d) => { const n = new Date(d); n.setDate(n.getDate() + 7); return n; })}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[68px_repeat(7,1fr)] overflow-x-auto min-w-[700px] border-b border-[#e3eaf6] bg-white">
          <div className="flex items-center justify-center font-mono text-[9.5px] text-[#8a92b8] uppercase font-bold border-r border-[#e3eaf6] bg-slate-50/50">
            Time
          </div>
          {weekDays.map((d, i) => {
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={i} className="py-3.5 text-center border-r border-[#e3eaf6] last:border-r-0 bg-white">
                <div className="font-bold text-[10px] text-[#8a92b8] font-mono leading-none tracking-wider">
                  {d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                </div>
                <div className="mt-2.5 flex items-center justify-center">
                  <span
                    className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-xl transition-all ${
                      isToday
                        ? 'bg-gradient-to-tr from-[#04044A] to-[#0057D9] text-white shadow-[0_4px_10px_rgba(4,4,74,0.25)] scale-105'
                        : 'text-[#04044A] hover:bg-slate-50'
                    }`}
                  >
                    {d.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-[68px_repeat(7,1fr)] overflow-x-auto min-w-[700px] bg-slate-50/20 max-h-[440px] overflow-y-auto">
          <div className="border-r border-[#e3eaf6] bg-slate-50/40">
            {HOURS.map((h, i) => (
              <div
                key={i}
                className="pr-3 pt-2 text-right font-mono text-[10px] text-[#8a92b8] border-b border-[#e3eaf6]/60 last:border-b-0 leading-none"
                style={{ height: SLOT_HEIGHT_PX }}
              >
                {h}
              </div>
            ))}
          </div>

          {weekDays.map((day, colIdx) => {
            const dayAppts = filtered.filter((a) => new Date(a.start_at).toDateString() === day.toDateString());
            return (
              <div key={colIdx} className="relative border-r border-[#e3eaf6] last:border-r-0 bg-white/20">
                {HOURS.map((_, slotIdx) => (
                  <div key={slotIdx} className="border-b border-[#e3eaf6]/45 last:border-b-0" style={{ height: SLOT_HEIGHT_PX }} />
                ))}

                {dayAppts.map((appt) => {
                  const { top, height } = positionForAppt(appt);
                  const isOnline = Boolean(appt.booking);
                  return (
                    <div
                      key={appt.id}
                      onClick={() => setSelectedAppt(appt)}
                      className={`absolute left-1 right-1 rounded-xl p-2.5 flex flex-col justify-between text-[11px] shadow-sm font-semibold overflow-hidden group hover:scale-[1.02] transition-transform z-10 cursor-pointer ${
                        isOnline
                          ? 'bg-gradient-to-tr from-[#0057D9] to-[#00A4FF] text-white'
                          : 'bg-[#E6F5FF] text-[#0057D9] border border-[#BFE6FF] border-l-4 border-l-[#00A4FF]'
                      }`}
                      style={{ top, height }}
                    >
                      <div className={`text-[9px] leading-none font-mono flex items-center gap-1 ${isOnline ? 'opacity-85' : 'text-[#00A4FF]'}`}>
                        <Clock size={10} /> {fmtTime(appt.start_at)}
                      </div>
                      <div className={`truncate font-bold ${isOnline ? 'text-white' : 'text-[#04044A]'}`}>
                        {appt.patient?.name ?? 'Patient'} &bull; {appt.reason ?? 'Visit'}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Appointment List */}
      <div className="panel fade-in d3">
        <div className="panel-head">
          <div>
            <h3>Upcoming Clinical Sessions</h3>
            <div className="ph-sub">Review scheduled visits and assign clinicians.</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-5 border-b border-[#e3eaf6]/60 flex-wrap bg-slate-50/20">
          <span className="font-mono text-[10px] uppercase font-bold text-[#8a92b8] mr-2">Filter by clinician:</span>
          <button
            onClick={() => setVetFilter('All')}
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
              vetFilter === 'All' ? 'bg-[#04044A] text-white border-[#04044A] shadow-sm' : 'bg-white text-[#5a6291] border-[#e3eaf6] hover:bg-slate-50'
            }`}
          >
            All veterinarians
          </button>
          {vets.map((v) => (
            <button
              key={v.id}
              onClick={() => setVetFilter(v.id)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                vetFilter === v.id ? 'bg-[#04044A] text-white border-[#04044A] shadow-sm' : 'bg-white text-[#5a6291] border-[#e3eaf6] hover:bg-slate-50'
              }`}
            >
              Dr. {v.last_name}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Patient</th>
                <th>Reason</th>
                <th>Clinician</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((appt) => (
                  <tr key={appt.id} className="hover:bg-[#f6f9fd]/50 transition-colors">
                    <td className="font-mono text-xs text-[#5a6291] font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-[#8a92b8]" />
                        {fmtTime(appt.start_at)}
                      </div>
                    </td>
                    <td>
                      <div className="cell-patient">
                        {renderPatientAvatar(appt.patient?.avatar, 'w-10 h-10', 'text-xl')}
                        <div>
                          <div className="p-name">{appt.patient?.name ?? 'Unknown'}</div>
                          <div className="p-meta">
                            {appt.patient?.breed ?? appt.patient?.species} &middot; Owner:{' '}
                            {appt.patient?.client ? `${appt.patient.client.first_name} ${appt.patient.client.last_name}` : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-[#04044A] font-semibold">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A4FF]" />
                          {appt.reason ?? 'General visit'}
                        </div>
                        {appt.booking && (
                          <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0057D9] text-[10px] font-mono font-bold border border-blue-100">
                            Online booking
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-xs text-[#3c4372] font-semibold">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#00A4FF] to-[#00E1FF] text-white text-[9px] font-bold flex items-center justify-center">
                          {appt.vet ? `${appt.vet.first_name[0]}${appt.vet.last_name[0]}` : '—'}
                        </div>
                        {appt.vet ? `Dr. ${appt.vet.last_name}` : 'Unassigned'}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${statusClass(appt.status)}`}>{appt.status.replace('_', ' ').toLowerCase()}</span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setSelectedAppt(appt)}
                        className="btn btn-outline btn-sm font-bold text-xs hover:bg-[#eef3fb] transition-colors cursor-pointer"
                      >
                        Manage visit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs text-[#8a92b8] font-medium bg-white">
                    {loading ? 'Loading appointments…' : 'No appointments scheduled for this week.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && clinic.clinicId && (
        <NewAppointmentModal
          clinicId={clinic.clinicId}
          vets={vets}
          onClose={() => setShowNewModal(false)}
          onCreated={() => {
            setShowNewModal(false);
            fetchAppointments();
          }}
        />
      )}

      {selectedAppt && (
        <AppointmentDetailsModal
          appointment={selectedAppt}
          onClose={() => setSelectedAppt(null)}
          onStatusChanged={() => {
            fetchAppointments();
          }}
        />
      )}

      {showEventTypesModal && clinic.clinicId && (
        <EventTypesManagerModal clinicId={clinic.clinicId} clinicSlug={clinic.clinicSlug} vets={vets} onClose={() => setShowEventTypesModal(false)} />
      )}
    </div>
  );
}
