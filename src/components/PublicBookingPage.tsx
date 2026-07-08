import React, { useEffect, useMemo, useState } from 'react';
import { Clock, CheckCircle2, ArrowLeft, Calendar as CalendarIcon, Globe, Video, MapPin, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { getAvailability, getBookingPage, createBooking } from '../lib/bookingApi';
import type { AvailabilitySlot, BookingAnswer, PublicBookingPageData, PublicEventType } from '../lib/types';

interface PublicBookingPageProps {
  clinicSlug: string;
}

type Step = 'select-datetime' | 'details' | 'success';

function toDateInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function PublicBookingPage({ clinicSlug }: PublicBookingPageProps) {
  const [pageData, setPageData] = useState<PublicBookingPageData | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<PublicEventType | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => toDateInputValue(new Date()));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [step, setStep] = useState<Step>('select-datetime');

  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [patientName, setPatientName] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    getBookingPage(clinicSlug)
      .then((data) => {
        setPageData(data);
        if (data.eventTypes.length > 0) {
          setSelectedEvent(data.eventTypes[0]);
        }
      })
      .catch((err) => setPageError(err.message))
      .finally(() => setLoadingPage(false));
  }, [clinicSlug]);

  useEffect(() => {
    if (!selectedEvent) return;
    setLoadingSlots(true);
    setSelectedSlot(null);

    const from = toDateInputValue(new Date());
    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 45);
    const to = toDateInputValue(toDate);

    getAvailability({ clinicSlug, eventTypeSlug: selectedEvent.slug, from, to })
      .then((res) => setSlots(res.slots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedEvent, clinicSlug]);

  const slotsForSelectedDate = useMemo(
    () => slots.filter((s) => toDateInputValue(new Date(s.start)) === selectedDate),
    [slots, selectedDate],
  );

  function handleAnswerChange(questionId: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEvent || !selectedSlot) return;

    setSubmitting(true);
    setSubmitError(null);

    const answerPayload: BookingAnswer[] = selectedEvent.booking_questions.map((q) => ({
      questionId: q.id,
      label: q.label,
      answer: answers[q.id] ?? '',
    }));

    try {
      await createBooking({
        clinicSlug,
        eventTypeSlug: selectedEvent.slug,
        startAt: selectedSlot.start,
        clientFirstName,
        clientLastName,
        clientEmail,
        clientPhone: clientPhone || undefined,
        patientName,
        answers: answerPayload,
      });
      setStep('success');
    } catch (err: any) {
      setSubmitError(err.message ?? 'This time slot was just booked. Please choose another time.');
      if (String(err.message).includes('just booked')) {
        setStep('select-datetime');
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Calendar month days calculation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];
    
    // Padding for start of week (Monday start)
    let startingDayOfWeek = firstDayOfMonth.getDay() - 1; // 0 = Mon
    if (startingDayOfWeek === -1) startingDayOfWeek = 6;
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ dateStr: toDateInputValue(d), dayNum: d.getDate(), isCurrentMonth: false });
    }

    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({ dateStr: toDateInputValue(d), dayNum: i, isCurrentMonth: true });
    }

    // Trailing days to complete grid (42 cells max)
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ dateStr: toDateInputValue(d), dayNum: i, isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  if (loadingPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0057D9] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Loading booking portal...</p>
        </div>
      </div>
    );
  }

  if (pageError || !pageData || !selectedEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">!</div>
          <h2 className="text-base font-bold text-[#04044A]">Booking Page Unavailable</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{pageError ?? 'This clinic or service is currently inactive.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fe] flex items-center justify-center p-3 sm:p-6 font-sans">
      <div className="bg-white rounded-3xl w-full max-w-[1040px] shadow-2xl shadow-blue-950/5 border border-slate-200/80 overflow-hidden flex flex-col md:flex-row transition-all">
        
        {/* LEFT PANEL: Event Info & Clinic branding */}
        <div className="p-8 sm:p-10 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between md:w-[38%] bg-white">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0057D9]/10 text-[#0057D9] flex items-center justify-center font-bold text-lg shadow-inner">
                🏥
              </div>
              <div>
                <div className="text-[11px] font-mono tracking-wider uppercase font-bold text-[#0057D9]">{pageData.clinic.name}</div>
                <div className="text-xs font-semibold text-slate-600">Professional Veterinary Care</div>
              </div>
            </div>

            <div className="space-y-3 pt-3">
              <h1 className="text-xl sm:text-2xl font-black text-[#04044A] tracking-tight leading-snug">{selectedEvent.name}</h1>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl w-fit">
                <Clock size={14} className="text-[#0057D9]" />
                <span>{selectedEvent.duration_minutes} min consultation</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedEvent.description || 'Professional veterinary consultation and personalized care plan.'}
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Video size={15} className="text-[#0057D9] flex-shrink-0" />
                <span>Web conferencing details provided upon confirmation.</span>
              </div>
              {selectedEvent.location_details && (
                <div className="flex items-center gap-2.5">
                  <MapPin size={15} className="text-[#0057D9] flex-shrink-0" />
                  <span>{selectedEvent.location_details}</span>
                </div>
              )}
              {selectedSlot && step !== 'select-datetime' && (
                <div className="flex items-center gap-2.5 font-bold text-[#04044A] pt-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <CalendarIcon size={16} className="text-[#0057D9] flex-shrink-0" />
                  <span>{new Date(selectedSlot.start).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

            {pageData.eventTypes.length > 1 && step === 'select-datetime' && (
              <div className="pt-6 border-t border-slate-100">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">Switch Service</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#04044A] outline-none focus:border-[#0057D9]"
                  value={selectedEvent.id}
                  onChange={(e) => {
                    const found = pageData.eventTypes.find((et) => et.id === e.target.value);
                    if (found) setSelectedEvent(found);
                  }}
                >
                  {pageData.eventTypes.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name} ({et.duration_minutes}m)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="pt-8 text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-100 mt-6">
            <span className="font-bold text-slate-500">DrVetly Secure Booking</span>
            <span className="flex items-center gap-1"><Globe size={11} /> {pageData.clinic.timezone}</span>
          </div>
        </div>

        {/* RIGHT PANEL: Dynamic Steps */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between bg-white">
          
          {step === 'select-datetime' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#04044A]">Select a Date &amp; Time</h2>
                <span className="text-xs font-mono font-bold text-[#0057D9] bg-blue-50 px-3 py-1 rounded-xl">Step 1 of 2</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* CALENDAR MONTH GRID */}
                <div className="lg:col-span-7 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/60 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-xs text-[#04044A] font-mono tracking-wide">
                      {currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer shadow-xs"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 cursor-pointer shadow-xs"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-slate-400 mb-2">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((cell, idx) => {
                      const isSelected = cell.dateStr === selectedDate;
                      const isToday = cell.dateStr === toDateInputValue(new Date());
                      const hasSlots = slots.some((s) => toDateInputValue(new Date(s.start)) === cell.dateStr);

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedDate(cell.dateStr);
                            setSelectedSlot(null);
                          }}
                          className={`h-9 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative cursor-pointer ${
                            isSelected
                              ? 'bg-[#0057D9] text-white shadow-md shadow-blue-500/20'
                              : isToday
                              ? 'bg-blue-50 text-[#0057D9] border border-blue-200'
                              : cell.isCurrentMonth
                              ? 'text-[#04044A] hover:bg-slate-200/60 bg-white border border-slate-200/50'
                              : 'text-slate-300 hover:bg-slate-100 bg-transparent border border-transparent'
                          }`}
                        >
                          <span>{cell.dayNum}</span>
                          {hasSlots && !isSelected && (
                            <span className="w-1 h-1 rounded-full bg-[#0057D9] absolute bottom-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between font-mono">
                    <span>Time zone</span>
                    <span className="font-bold text-[#04044A]">{pageData.clinic.timezone}</span>
                  </div>
                </div>

                {/* TIME SLOTS PANEL */}
                <div className="lg:col-span-5 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#04044A] font-mono">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">{slotsForSelectedDate.length} available</span>
                  </div>

                  {loadingSlots ? (
                    <div className="py-12 text-center text-xs text-slate-400 font-mono">Loading available times...</div>
                  ) : slotsForSelectedDate.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 text-center text-xs text-slate-500 my-auto">
                      No available times on this date. Please choose another day from the calendar.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[310px] overflow-y-auto pr-1">
                      {slotsForSelectedDate.map((slot) => {
                        const timeLabel = new Date(slot.start).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
                        const isSelected = selectedSlot?.start === slot.start;

                        return (
                          <div key={slot.start} className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center font-mono ${
                                isSelected
                                  ? 'bg-[#04044A] text-white border-[#04044A] shadow-md'
                                  : 'bg-white text-[#04044A] border-slate-200 hover:border-[#0057D9] hover:bg-blue-50/20'
                              }`}
                            >
                              {timeLabel}
                            </button>
                            {isSelected && (
                              <button
                                type="button"
                                onClick={() => setStep('details')}
                                className="bg-[#0057D9] hover:bg-[#0048b3] text-white px-4 py-3 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1 animate-fade-in whitespace-nowrap"
                              >
                                Next &rarr;
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {step === 'details' && selectedEvent && selectedSlot && (
            <form onSubmit={handleConfirm} className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep('select-datetime')}
                  className="text-xs font-bold text-[#0057D9] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
                >
                  <ArrowLeft size={14} /> Back to date &amp; time
                </button>
                <span className="text-xs font-mono font-bold text-[#0057D9] bg-blue-50 px-3 py-1 rounded-xl">Step 2 of 2</span>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                <h3 className="text-sm font-black text-[#04044A]">Enter Details &amp; Qualification Questions</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1">First Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:bg-white focus:border-[#0057D9] outline-none transition-all"
                      value={clientFirstName}
                      onChange={(e) => setClientFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1">Last Name *</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:bg-white focus:border-[#0057D9] outline-none transition-all"
                      value={clientLastName}
                      onChange={(e) => setClientLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1">Email Address *</label>
                    <input
                      type="email"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:bg-white focus:border-[#0057D9] outline-none transition-all"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:bg-white focus:border-[#0057D9] outline-none transition-all"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 (555) 019-2831"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500 mb-1">Patient / Pet Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:bg-white focus:border-[#0057D9] outline-none transition-all"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Luna (Golden Retriever)"
                    required
                  />
                </div>

                {selectedEvent.booking_questions.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-4">
                    <h4 className="text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono">Custom Qualification Questions</h4>
                    {selectedEvent.booking_questions.map((q) => (
                      <div key={q.id}>
                        <label className="block text-xs font-bold text-[#04044A] mb-1">
                          {q.label} {q.required && <span className="text-red-500">*</span>}
                        </label>
                        {q.type === 'TEXTAREA' ? (
                          <textarea
                            rows={3}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:bg-white focus:border-[#0057D9] outline-none transition-all"
                            value={answers[q.id] ?? ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            required={q.required}
                            placeholder="Please share details..."
                          />
                        ) : q.type === 'SELECT' ? (
                          <select
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:bg-white focus:border-[#0057D9] outline-none transition-all"
                            value={answers[q.id] ?? ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            required={q.required}
                          >
                            <option value="">Select option...</option>
                            {(q.options ?? []).map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-[#04044A] focus:bg-white focus:border-[#0057D9] outline-none transition-all"
                            value={answers[q.id] ?? ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            required={q.required}
                            placeholder="Your answer..."
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitError && (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{submitError}</p>
              )}

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#0057D9] hover:bg-[#0048b3] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? 'Confirming booking...' : 'Schedule Event'}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && selectedEvent && selectedSlot && (
            <div className="text-center py-6 space-y-6 my-auto">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#04044A]">You are scheduled!</h2>
                <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                  A calendar invitation and video link have been emailed to <span className="font-bold text-[#04044A]">{clientEmail}</span>.
                </p>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 max-w-md mx-auto text-left text-xs space-y-2.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Service</span>
                  <span className="font-bold text-[#0057D9]">{selectedEvent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Patient / Pet</span>
                  <span className="font-bold text-[#04044A]">{patientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Date &amp; Time</span>
                  <span className="font-bold text-[#04044A]">
                    {new Date(selectedSlot.start).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location</span>
                  <span className="font-bold text-[#04044A]">Video Conferencing (Zoom/Meet)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('select-datetime');
                  setSelectedSlot(null);
                }}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#04044A] rounded-xl text-xs font-bold transition-all cursor-pointer inline-block"
              >
                Book another appointment
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
