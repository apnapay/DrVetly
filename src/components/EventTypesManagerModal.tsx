import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Edit3, X, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { BookingEventType, BookingQuestion, LocationType, QuestionType, VetUser } from '../lib/types';

interface EventTypesManagerModalProps {
  clinicId: string;
  clinicSlug?: string;
  vets: VetUser[];
  onClose: () => void;
}

type DraftQuestion = Omit<BookingQuestion, 'id' | 'event_type_id'> & { id?: string; tempId: string };
type DraftEventType = Omit<BookingEventType, 'id' | 'clinic_id' | 'booking_questions'> & {
  id?: string;
  questions: DraftQuestion[];
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function blankDraft(): DraftEventType {
  return {
    vet_id: null,
    schedule_id: null,
    name: '30-Min Wellness Exam',
    slug: 'wellness-exam',
    description: 'Comprehensive physical examination and vaccination review.',
    duration_minutes: 30,
    buffer_before_minutes: 0,
    buffer_after_minutes: 10,
    min_notice_hours: 2,
    max_days_in_advance: 45,
    location_type: 'IN_PERSON',
    location_details: 'In-clinic examination room',
    color: '#0057D9',
    is_active: true,
    position: 0,
    questions: [
      { tempId: 'q1', label: "Pet's name and species", type: 'TEXT', options: null, required: true, position: 0 },
      { tempId: 'q2', label: 'Current symptoms or reason for visit', type: 'TEXTAREA', options: null, required: true, position: 1 },
    ],
  };
}

/**
 * Ensures the selected vet has at least one default availability schedule
 * with standard Mon–Fri 9–5 hours, so a brand-new event type is bookable
 * immediately instead of showing zero slots until someone configures hours
 * separately. Staff can refine the hours afterward from the schedule row
 * this creates.
 */
async function ensureDefaultSchedule(clinicId: string, vetId: string): Promise<string> {
  const { data: existing } = await supabase
    .from('availability_schedules')
    .select('id')
    .eq('clinic_id', clinicId)
    .eq('vet_id', vetId)
    .eq('is_default', true)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: schedule, error } = await supabase
    .from('availability_schedules')
    .insert({ clinic_id: clinicId, vet_id: vetId, name: 'Working hours', is_default: true })
    .select('id')
    .single();

  if (error || !schedule) throw new Error(error?.message ?? 'Could not create availability schedule');

  const weekdayRules = [1, 2, 3, 4, 5].map((day) => ({
    schedule_id: schedule.id,
    day_of_week: day,
    start_time: '09:00',
    end_time: '17:00',
  }));
  await supabase.from('availability_rules').insert(weekdayRules);

  return schedule.id;
}

export default function EventTypesManagerModal({ clinicId, clinicSlug = 'riverbend-animal-hospital', vets, onClose }: EventTypesManagerModalProps) {
  const [eventTypes, setEventTypes] = useState<BookingEventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<DraftEventType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handleCopyLink(slug: string, id: string) {
    const url = `${window.location.origin}/book/${clinicSlug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  async function loadEventTypes() {
    setLoading(true);
    const { data } = await supabase
      .from('booking_event_types')
      .select('*, booking_questions(*)')
      .order('position', { ascending: true });
    if (data) setEventTypes(data as any);
    setLoading(false);
  }

  useEffect(() => {
    loadEventTypes();
  }, [clinicId]);

  function startNew() {
    setDraft(blankDraft());
    setEditingId(null);
  }

  function startEdit(et: BookingEventType) {
    setDraft({
      vet_id: et.vet_id,
      schedule_id: et.schedule_id,
      name: et.name,
      slug: et.slug,
      description: et.description,
      duration_minutes: et.duration_minutes,
      buffer_before_minutes: et.buffer_before_minutes,
      buffer_after_minutes: et.buffer_after_minutes,
      min_notice_hours: et.min_notice_hours,
      max_days_in_advance: et.max_days_in_advance,
      location_type: et.location_type,
      location_details: et.location_details,
      color: et.color,
      is_active: et.is_active,
      position: et.position,
      questions: (et.booking_questions ?? []).map((q) => ({ ...q, tempId: q.id })),
    });
    setEditingId(et.id);
  }

  async function handleToggleActive(et: BookingEventType) {
    await supabase.from('booking_event_types').update({ is_active: !et.is_active }).eq('id', et.id);
    loadEventTypes();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this event type? Existing bookings made through it are kept, but it will no longer be bookable.')) return;
    await supabase.from('booking_event_types').delete().eq('id', id);
    loadEventTypes();
  }

  function addQuestion() {
    if (!draft) return;
    setDraft({
      ...draft,
      questions: [
        ...draft.questions,
        { tempId: `new_${Date.now()}`, label: 'New question', type: 'TEXT', options: null, required: true, position: draft.questions.length },
      ],
    });
  }

  function updateQuestion(tempId: string, updates: Partial<DraftQuestion>) {
    if (!draft) return;
    setDraft({ ...draft, questions: draft.questions.map((q) => (q.tempId === tempId ? { ...q, ...updates } : q)) });
  }

  function removeQuestion(tempId: string) {
    if (!draft) return;
    setDraft({ ...draft, questions: draft.questions.filter((q) => q.tempId !== tempId) });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setError(null);

    try {
      let scheduleId = draft.schedule_id;
      if (draft.vet_id) {
        scheduleId = await ensureDefaultSchedule(clinicId, draft.vet_id);
      }

      const payload = {
        clinic_id: clinicId,
        vet_id: draft.vet_id,
        schedule_id: scheduleId,
        name: draft.name,
        slug: slugify(draft.slug || draft.name),
        description: draft.description,
        duration_minutes: draft.duration_minutes,
        buffer_before_minutes: draft.buffer_before_minutes,
        buffer_after_minutes: draft.buffer_after_minutes,
        min_notice_hours: draft.min_notice_hours,
        max_days_in_advance: draft.max_days_in_advance,
        location_type: draft.location_type,
        location_details: draft.location_details,
        color: draft.color,
        is_active: draft.is_active,
        position: draft.position,
      };

      let eventTypeId = editingId;
      if (editingId) {
        const { error: updateError } = await supabase.from('booking_event_types').update(payload).eq('id', editingId);
        if (updateError) throw updateError;
      } else {
        const { data: created, error: insertError } = await supabase.from('booking_event_types').insert(payload).select('id').single();
        if (insertError) throw insertError;
        eventTypeId = created.id;
      }

      // Replace questions wholesale — simplest correct approach for a
      // config form like this (no concurrent multi-editor scenario to
      // worry about, so delete+reinsert beats diffing).
      await supabase.from('booking_questions').delete().eq('event_type_id', eventTypeId);
      if (draft.questions.length > 0) {
        await supabase.from('booking_questions').insert(
          draft.questions.map((q, idx) => ({
            event_type_id: eventTypeId,
            label: q.label,
            type: q.type,
            options: q.options,
            required: q.required,
            position: idx,
          })),
        );
      }

      setDraft(null);
      setEditingId(null);
      loadEventTypes();
    } catch (err: any) {
      setError(err.message ?? 'Could not save event type — that slug may already be in use.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-[#04044A]/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-[850px] shadow-2xl overflow-hidden border border-[#e3eaf6] flex flex-col max-h-[90vh]">
        <div className="bg-[#04044A] px-6 py-5 text-white flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0057D9] to-[#00A4FF] flex items-center justify-center text-white shadow-md">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="font-bold text-lg tracking-tight">Online booking event types</h2>
              <p className="text-xs text-white/70">Configure bookable visit types, hours, and pre-qualification questions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/25 transition-colors cursor-pointer border-none"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {draft ? (
            <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-[#e3eaf6] shadow-sm space-y-5">
              <div className="flex justify-between items-center border-b border-[#e3eaf6] pb-3">
                <h3 className="font-bold text-sm text-[#04044A]">{editingId ? `Edit: ${draft.name}` : 'Create new event type'}</h3>
                <button type="button" onClick={() => setDraft(null)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer bg-transparent border-none">
                  &larr; Back to list
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Event name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF]"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slug || slugify(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">URL slug</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-mono text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF]"
                    value={draft.slug}
                    onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Duration</label>
                  <select
                    className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white"
                    value={draft.duration_minutes}
                    onChange={(e) => setDraft({ ...draft, duration_minutes: Number(e.target.value) })}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Buffer after</label>
                  <select
                    className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white"
                    value={draft.buffer_after_minutes}
                    onChange={(e) => setDraft({ ...draft, buffer_after_minutes: Number(e.target.value) })}
                  >
                    <option value={0}>No buffer</option>
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Min. notice</label>
                  <select
                    className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white"
                    value={draft.min_notice_hours}
                    onChange={(e) => setDraft({ ...draft, min_notice_hours: Number(e.target.value) })}
                  >
                    <option value={1}>1 hour</option>
                    <option value={2}>2 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>24 hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Veterinarian</label>
                  <select
                    className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white"
                    value={draft.vet_id ?? ''}
                    onChange={(e) => setDraft({ ...draft, vet_id: e.target.value || null })}
                  >
                    <option value="">Any available vet</option>
                    {vets.map((v) => (
                      <option key={v.id} value={v.id}>
                        Dr. {v.first_name} {v.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Location type</label>
                  <select
                    className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white"
                    value={draft.location_type}
                    onChange={(e) => setDraft({ ...draft, location_type: e.target.value as LocationType })}
                  >
                    <option value="IN_PERSON">In-clinic</option>
                    <option value="VIDEO">Video call</option>
                    <option value="PHONE">Phone call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Description</label>
                <textarea
                  rows={2}
                  className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF]"
                  value={draft.description ?? ''}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Location details</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-[#e3eaf6] rounded-xl text-xs font-semibold text-[#04044A] bg-white focus:outline-none focus:border-[#00A4FF]"
                  placeholder="e.g. Exam Room 1, or video link instructions"
                  value={draft.location_details ?? ''}
                  onChange={(e) => setDraft({ ...draft, location_details: e.target.value })}
                />
              </div>

              <div className="pt-2 border-t border-[#e3eaf6]">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-bold text-xs text-[#04044A] uppercase tracking-wider font-mono">Pre-qualification questions</h4>
                    <p className="text-[11px] text-slate-500">Clients answer these when booking online</p>
                  </div>
                  <button type="button" onClick={addQuestion} className="btn btn-soft btn-sm text-xs font-bold cursor-pointer">
                    <Plus size={13} className="mr-1" /> Add question
                  </button>
                </div>

                <div className="space-y-3">
                  {draft.questions.map((q, idx) => (
                    <div key={q.tempId} className="p-3.5 rounded-xl bg-slate-50 border border-[#e3eaf6] space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-slate-400">#{idx + 1}</span>
                        <input
                          type="text"
                          className="flex-1 px-3 py-1.5 border border-[#e3eaf6] rounded-lg text-xs font-semibold text-[#04044A] bg-white"
                          value={q.label}
                          onChange={(e) => updateQuestion(q.tempId, { label: e.target.value })}
                          placeholder="Question label…"
                          required
                        />
                        <select
                          className="px-3 py-1.5 border border-[#e3eaf6] rounded-lg text-xs font-semibold text-[#04044A] bg-white"
                          value={q.type}
                          onChange={(e) => updateQuestion(q.tempId, { type: e.target.value as QuestionType })}
                        >
                          <option value="TEXT">Short text</option>
                          <option value="TEXTAREA">Paragraph</option>
                          <option value="SELECT">Dropdown</option>
                          <option value="RADIO">Multiple choice</option>
                          <option value="CHECKBOX">Checkboxes</option>
                        </select>
                        <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                          <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.tempId, { required: e.target.checked })} />
                          Required
                        </label>
                        <button type="button" onClick={() => removeQuestion(q.tempId)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer bg-transparent border-none">
                          <Trash2 size={15} />
                        </button>
                      </div>
                      {(q.type === 'SELECT' || q.type === 'RADIO' || q.type === 'CHECKBOX') && (
                        <input
                          type="text"
                          className="w-full px-3 py-1.5 border border-[#e3eaf6] rounded-lg text-xs font-medium text-[#04044A] bg-white"
                          placeholder="Comma-separated options, e.g. Mild, Moderate, Severe"
                          value={(q.options ?? []).join(', ')}
                          onChange={(e) =>
                            updateQuestion(q.tempId, {
                              options: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#e3eaf6]">
                <button type="button" onClick={() => setDraft(null)} className="btn btn-outline btn-sm py-2 px-4 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm py-2 px-5 cursor-pointer font-bold disabled:opacity-60">
                  {saving ? 'Saving…' : 'Save event type'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-[#04044A]">Active booking event types</h3>
                  <p className="text-xs text-slate-500">Clients pick from these on your public booking page</p>
                </div>
                <button onClick={startNew} className="btn btn-primary btn-sm text-xs font-bold cursor-pointer">
                  <Plus size={15} className="mr-1" /> New event type
                </button>
              </div>

              {loading ? (
                <p className="text-xs text-slate-500 py-8 text-center">Loading…</p>
              ) : eventTypes.length === 0 ? (
                <p className="text-xs text-slate-500 py-8 text-center">No event types yet — create your first one to start taking online bookings.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {eventTypes.map((et) => (
                    <div key={et.id} className="p-4 rounded-2xl bg-white border border-[#e3eaf6] shadow-xs flex items-center justify-between gap-4 hover:border-blue-200 transition-all">
                      <div className="flex items-start gap-3.5">
                        <div className="w-3 h-12 rounded-full flex-shrink-0 mt-0.5" style={{ background: et.color }} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-[#04044A]">{et.name}</h4>
                            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0057D9] font-mono text-[10px] font-bold">{et.duration_minutes} mins</span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{et.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                            <span>{et.location_details ?? et.location_type}</span>
                            <span>&bull;</span>
                            <span>{et.booking_questions?.length ?? 0} pre-qual questions</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => handleCopyLink(et.slug, et.id)}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0057D9] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-blue-200"
                          title="Copy public booking link"
                        >
                          {copiedId === et.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedId === et.id ? 'Copied link!' : 'Copy link'}</span>
                        </button>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={et.is_active} onChange={() => handleToggleActive(et)} className="sr-only peer" />
                          <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0057D9]" />
                        </label>
                        <button onClick={() => startEdit(et)} className="p-2 rounded-xl text-slate-500 hover:text-[#0057D9] hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent" title="Edit">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDelete(et.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-[#e3eaf6] flex justify-end items-center text-xs">
          <button onClick={onClose} className="btn btn-primary btn-sm px-5 cursor-pointer font-bold">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
