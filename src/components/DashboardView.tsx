import React, { useState } from 'react';
import { Patient, Appointment, Invoice, SOAPNote } from '../types';
import { renderPatientAvatar } from '../lib/supabaseStorage';

interface DashboardViewProps {
  patients: Patient[];
  appointments: Appointment[];
  invoices: Invoice[];
  soapNotes?: SOAPNote[];
  onSetView: (view: 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages') => void;
  onSelectPatient: (patientId: string) => void;
  vetName: string;
  clinicName: string;
}

export default function DashboardView({
  patients,
  appointments,
  invoices,
  soapNotes = [],
  onSetView,
  onSelectPatient,
  vetName,
  clinicName
}: DashboardViewProps) {
  const [scheduleFilter, setScheduleFilter] = useState<'all' | 'checkedin' | 'inprogress' | 'scheduled'>('all');

  // Compute dynamic stats
  const totalApptsToday = appointments.length;
  const checkedInCount = appointments.filter(a => a.status === 'checkedin').length;
  const inProgressCount = appointments.filter(a => a.status === 'inprogress').length;
  const scheduledCount = appointments.filter(a => a.status === 'scheduled').length;

  const totalRevenueThisWeek = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Filter today's appointments list
  const filteredAppointments = appointments.filter(appt => {
    if (scheduleFilter === 'all') return true;
    if (scheduleFilter === 'checkedin') return appt.status === 'checkedin';
    if (scheduleFilter === 'inprogress') return appt.status === 'inprogress';
    if (scheduleFilter === 'scheduled') return appt.status === 'scheduled';
    return true;
  });

  const getPatientForAppt = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

  const handlePatientChartClick = (patientId: string) => {
    onSelectPatient(patientId);
    onSetView('patients');
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Generate real activities from actual state data
  const dynamicActivities: { id: string; title: string; time: string; type: 'soap' | 'invoice' | 'appointment' | 'patient' }[] = [];

  appointments.forEach(appt => {
    const patient = patients.find(p => p.id === appt.patientId);
    const pName = patient?.name || 'Patient';
    let statusText = 'scheduled';
    if (appt.status === 'checkedin') statusText = 'checked in';
    else if (appt.status === 'inprogress') statusText = 'in consultation';
    else if (appt.status === 'completed') statusText = 'visit completed';

    dynamicActivities.push({
      id: `appt-${appt.id}`,
      title: `Appointment ${statusText} for <b>${pName}</b> (${appt.reason || 'General'})`,
      time: appt.time || 'Today',
      type: 'appointment'
    });
  });

  soapNotes.forEach(note => {
    const patient = patients.find(p => p.id === note.patientId);
    const pName = patient?.name || 'Patient';
    const isApproved = note.status === 'approved';
    dynamicActivities.push({
      id: `soap-${note.id}`,
      title: isApproved ? `SOAP note for <b>${pName}</b> approved and synced` : `AI drafted SOAP note for <b>${pName}</b>`,
      time: note.time || 'Recently',
      type: 'soap'
    });
  });

  invoices.forEach(inv => {
    const isPaid = inv.status === 'paid';
    dynamicActivities.push({
      id: `inv-${inv.id}`,
      title: `Invoice ${inv.id} ${isPaid ? 'paid by' : 'created for'} <b>${inv.clientName}</b> &mdash; $${inv.amount.toFixed(2)}`,
      time: inv.date || 'Today',
      type: 'invoice'
    });
  });

  patients.slice(-3).forEach(pat => {
    dynamicActivities.push({
      id: `pat-${pat.id}`,
      title: `New patient record registered for <b>${pat.name}</b> (${pat.species})`,
      time: pat.lastVisit || 'Recently',
      type: 'patient'
    });
  });

  return (
    <div className="space-y-6">
      
      {/* Welcome header band */}
      <div className="welcome-band fade-in">
        <div>
          <h2>Good morning, {vetName} 👋</h2>
          <p>You have {totalApptsToday} appointments scheduled today.</p>
        </div>
        <div className="date-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="#5a6291" strokeWidth="1.6"/>
            <path d="M3 10h18M8 2v4M16 2v4" stroke="#5a6291" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          {formattedDate}
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card fade-in d1">
          <div className="kpi-top">
            <div className="kpi-ic blue">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#fff" strokeWidth="1.6"/>
                <path d="M3 10h18M8 2v4M16 2v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="kpi-label">Appointments today</div>
          <div className="kpi-value">{totalApptsToday}</div>
          <div className="kpi-sub">Scheduled visits</div>
        </div>

        <div className="kpi-card fade-in d2">
          <div className="kpi-top">
            <div className="kpi-ic cyan">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="kpi-label">No-show rate</div>
          <div className="kpi-value">0%</div>
          <div className="kpi-sub">Current tracking</div>
        </div>

        <div className="kpi-card fade-in d3">
          <div className="kpi-top">
            <div className="kpi-ic navy">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          <div className="kpi-label">SOAP notes auto-drafted</div>
          <div className="kpi-value">Active</div>
          <div className="kpi-sub">Ready for review</div>
        </div>

        <div className="kpi-card fade-in d4">
          <div className="kpi-top">
            <div className="kpi-ic green">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                <path d="M12 2v4M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="kpi-label">Revenue this week</div>
          <div className="kpi-value">${totalRevenueThisWeek.toLocaleString()}</div>
          <div className="kpi-sub">Total collected</div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="qa-grid">
        <button onClick={() => onSetView('schedule')} className="qa-card fade-in d1">
          <div className="qa-ic">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#0057D9" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h4>Book appointment</h4>
            <p>Add to today's schedule</p>
          </div>
        </button>

        <button onClick={() => onSetView('patients')} className="qa-card fade-in d2">
          <div className="qa-ic">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="#0057D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h4>Add patient</h4>
            <p>Create a new record</p>
          </div>
        </button>

        <button onClick={() => onSetView('soap-notes')} className="qa-card fade-in d3">
          <div className="qa-ic">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#0057D9" strokeWidth="1.8" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h4>Draft SOAP note</h4>
            <p>Start from a transcript</p>
          </div>
        </button>

        <button onClick={() => onSetView('messages')} className="qa-card fade-in d4">
          <div className="qa-ic">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <path d="M3 6l9 6 9-6M3 6v12h18V6M3 6h18" stroke="#0057D9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h4>Send reminder</h4>
            <p>Nudge tomorrow's visits</p>
          </div>
        </button>
      </div>

      {/* Grid: Schedule + Recent Activities */}
      <div className="grid-2col">
        {/* Left Side: Today's Schedule Panel */}
        <div className="panel fade-in d2 flex flex-col justify-between">
          <div>
            <div className="panel-head">
              <div>
                <h3>Today's schedule</h3>
                <div className="ph-sub">{totalApptsToday} appointments &middot; 3 vets on shift</div>
              </div>
              <button onClick={() => onSetView('schedule')} className="panel-link border-none bg-transparent cursor-pointer font-semibold text-sm">
                View full calendar &rarr;
              </button>
            </div>

            <div className="tabs">
              <button 
                onClick={() => setScheduleFilter('all')} 
                className={`tab ${scheduleFilter === 'all' ? 'active' : ''}`}
              >
                All ({totalApptsToday})
              </button>
              <button 
                onClick={() => setScheduleFilter('checkedin')} 
                className={`tab ${scheduleFilter === 'checkedin' ? 'active' : ''}`}
              >
                Checked in ({appointments.filter(a => a.status === 'checkedin').length})
              </button>
              <button 
                onClick={() => setScheduleFilter('inprogress')} 
                className={`tab ${scheduleFilter === 'inprogress' ? 'active' : ''}`}
              >
                In progress ({appointments.filter(a => a.status === 'inprogress').length})
              </button>
              <button 
                onClick={() => setScheduleFilter('scheduled')} 
                className={`tab ${scheduleFilter === 'scheduled' ? 'active' : ''}`}
              >
                Scheduled ({appointments.filter(a => a.status === 'scheduled').length})
              </button>
            </div>

            <div className="table-wrap">
              <table>
                <tbody>
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appt) => {
                      const patient = getPatientForAppt(appt.patientId);
                      return (
                        <tr key={appt.id} className="hover:bg-slate-50 transition-colors">
                          <td className="mono" style={{ width: '90px', color: 'var(--ink-soft)' }}>
                            {appt.time}
                          </td>
                          <td>
                            <div className="cell-patient">
                              {renderPatientAvatar(patient?.avatar, 'w-10 h-10', 'text-xl')}
                              <div>
                                <div className="p-name">{patient?.name || 'Unknown'}</div>
                                <div className="p-meta">{patient?.breed} &middot; {patient?.ownerName}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${appt.status}`}>
                              {appt.status === 'inprogress' ? 'In progress' : appt.status === 'checkedin' ? 'Checked in' : appt.status}
                            </span>
                          </td>
                          <td style={{ width: '30px' }}>
                            <span 
                              className="row-menu" 
                              onClick={() => handlePatientChartClick(appt.patientId)}
                              title="View Patient Chart"
                            >
                              ⋮
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs text-[#8a92b8] font-medium">
                        No appointments found matching this filter today.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Recent Activity Timeline */}
        <div className="panel fade-in d3">
          <div className="panel-head">
            <div>
              <h3>Recent activity</h3>
              <div className="ph-sub">Live from across your clinic</div>
            </div>
          </div>
          <div style={{ padding: '4px 0' }}>
            {dynamicActivities.length > 0 ? (
              dynamicActivities.slice(0, 5).map((act, idx) => (
                <div key={act.id || idx} style={{ display: 'flex', gap: '14px', padding: '16px 24px', borderBottom: idx < Math.min(dynamicActivities.length, 5) - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div style={{ 
                    width: '34px', 
                    height: '34px', 
                    borderRadius: '10px', 
                    background: act.type === 'invoice' ? 'linear-gradient(135deg,#B7791F,#E0A94B)' : act.type === 'soap' ? 'linear-gradient(135deg,#00875A,#00C875)' : 'var(--grad-hero)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    flexShrink: 0 
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '13.3px' }} dangerouslySetInnerHTML={{ __html: act.title }} />
                    <div className="mono" style={{ fontSize: '11.3px', color: 'var(--ink-mute)', marginTop: '3px' }}>{act.time}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--ink-mute)', fontSize: '13px' }}>
                No recent clinic activity recorded yet. Schedule appointments, draft SOAP notes, or record patient visits to see live clinic events here.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Chart + Recent Patients */}
      <div className="grid-2col" style={{ gridTemplateColumns: '1fr 1.65fr' }}>
        {/* Weekly Chart Panel */}
        <div className="panel fade-in d4">
          <div className="panel-head">
            <div>
              <h3>Appointments this week</h3>
              <div className="ph-sub">By visit type</div>
            </div>
          </div>
          <div className="panel-body pad">
            <div style={{ display: 'flex', gap: '20px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.3px', color: 'var(--ink-soft)' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: '#0057D9' }}></span>Checkups
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.3px', color: 'var(--ink-soft)' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: '#00C2FF' }}></span>Procedures
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '12.3px', color: 'var(--ink-soft)' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: '#BFE6FF' }}></span>Follow-ups
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '180px', padding: '0 4px' }}>
              {[
                { day: 'Mon', segments: [35, 20, 30] },
                { day: 'Tue', segments: [40, 30, 20] },
                { day: 'Wed', segments: [30, 25, 25] },
                { day: 'Thu', segments: [45, 35, 15] },
                { day: 'Fri', segments: [50, 20, 30] },
                { day: 'Sat', segments: [15, 10, 10] },
                { day: 'Sun', segments: [8, 5, 5] }
              ].map((item, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column-reverse', borderRadius: '8px 8px 4px 4px', overflow: 'hidden', height: '150px' }}>
                    <div style={{ height: `${item.segments[0]}%`, background: '#0057D9' }}></div>
                    <div style={{ height: `${item.segments[1]}%`, background: '#00C2FF' }}></div>
                    <div style={{ height: `${item.segments[2]}%`, background: '#BFE6FF' }}></div>
                  </div>
                  <span className="mono" style={{ fontSize: '11px', color: 'var(--ink-mute)' }}>{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Patients Table Panel */}
        <div className="panel fade-in d5">
          <div className="panel-head">
            <div>
              <h3>Recent patients</h3>
              <div className="ph-sub">Last updated across your clinic</div>
            </div>
            <button onClick={() => onSetView('patients')} className="panel-link border-none bg-transparent cursor-pointer font-semibold text-sm">
              View all patients &rarr;
            </button>
          </div>
          
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Species</th>
                  <th>Last visit</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 4).map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50 transition-colors">
                    <td>
                      <div className="cell-patient">
                        {renderPatientAvatar(patient.avatar, 'w-10 h-10', 'text-xl')}
                        <div>
                          <div className="p-name">{patient.name}</div>
                          <div className="p-meta">Owner: {patient.ownerName}</div>
                        </div>
                      </div>
                    </td>
                    <td>{patient.species}</td>
                    <td className="mono">{patient.lastVisit || 'Jul 7, 2026'}</td>
                    <td>
                      <span className="tag">{patient.status}</span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handlePatientChartClick(patient.id)} 
                        className="action-link border-none bg-transparent cursor-pointer font-semibold text-sm hover:underline"
                      >
                        View chart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
