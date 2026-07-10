import React, { useState, useEffect } from 'react';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Signup from './components/Signup';
import DashboardView from './components/DashboardView';
import ScheduleView from './components/ScheduleView';
import PatientsView from './components/PatientsView';
import SoapNotesView from './components/SoapNotesView';
import BillingView from './components/BillingView';
import MessagesView from './components/MessagesView';
import SettingsView from './components/SettingsView';
import PricingView from './components/PricingView';
import StaffView from './components/StaffView';
import ContactView from './components/ContactView';
import BetaClinicsView from './components/BetaClinicsView';
import PrivacyView from './components/PrivacyView';
import TermsView from './components/TermsView';
import PublicBookingPage from './components/PublicBookingPage';
import { INITIAL_PATIENTS, INITIAL_APPOINTMENTS, INITIAL_SOAP_NOTES, INITIAL_INVOICES, INITIAL_CONVERSATIONS } from './data';
import { Patient, Appointment, SOAPNote, Invoice, Conversation, Message, StaffMember } from './types';
import { Home, Calendar, Users, FileText, DollarSign, MessageSquare, LogOut, Menu, Shield, Stethoscope } from 'lucide-react';
import { authService, dbService, supabase } from './supabaseClient';
import { syncPatientToSupabase, syncInvoiceToSupabase, syncSoapNoteToSupabase } from './lib/supabaseStorage';

export default function App() {
  type ViewType = 'homepage' | 'login' | 'signup' | 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages' | 'staff' | 'settings' | 'pricing' | 'contact' | 'beta' | 'privacy' | 'terms';

  const getViewFromPath = (path: string): ViewType => {
    const clean = path.replace(/^\/+/, '').trim();
    if (clean === 'pricing') return 'pricing';
    if (clean === 'contact') return 'contact';
    if (clean === 'beta' || clean === 'beta-clinics') return 'beta';
    if (clean === 'privacy' || clean === 'privacy-policy') return 'privacy';
    if (clean === 'terms' || clean === 'terms-of-service') return 'terms';
    if (clean === 'login') return 'login';
    if (clean === 'signup') return 'signup';
    if (clean === 'dashboard') return 'dashboard';
    if (clean === 'dashboard/schedule' || clean === 'schedule') return 'schedule';
    if (clean === 'dashboard/patients' || clean === 'patients') return 'patients';
    if (clean === 'dashboard/soap' || clean === 'soap-notes' || clean === 'soap') return 'soap-notes';
    if (clean === 'dashboard/billing' || clean === 'billing') return 'billing';
    if (clean === 'dashboard/messages' || clean === 'messages') return 'messages';
    if (clean === 'dashboard/staff' || clean === 'staff') return 'staff';
    if (clean === 'dashboard/settings' || clean === 'settings') return 'settings';
    return 'homepage';
  };

  const getPathFromView = (v: ViewType): string => {
    switch (v) {
      case 'pricing': return '/pricing';
      case 'contact': return '/contact';
      case 'beta': return '/beta';
      case 'privacy': return '/privacy';
      case 'terms': return '/terms';
      case 'login': return '/login';
      case 'signup': return '/signup';
      case 'dashboard': return '/dashboard';
      case 'schedule': return '/dashboard/schedule';
      case 'patients': return '/dashboard/patients';
      case 'soap-notes': return '/dashboard/soap';
      case 'billing': return '/dashboard/billing';
      case 'messages': return '/dashboard/messages';
      case 'staff': return '/dashboard/staff';
      case 'settings': return '/dashboard/settings';
      default: return '/';
    }
  };

  // Navigation: 'homepage' | 'login' | 'signup' | 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages' | 'settings' | 'pricing'
  const [view, setViewState] = useState<ViewType>(() => getViewFromPath(window.location.pathname));

  const navigateTo = (newView: ViewType) => {
    setViewState(newView);
    const targetPath = getPathFromView(newView);
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState('Riverbend Animal Hospital');
  const [vetName, setVetName] = useState('Dr. Jamie Morales');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'solo' | 'hyper' | 'custom'>(() => {
    return authService.getCurrentSession()?.subscriptionPlan || 'solo';
  });

  // Master State Database (Initial empty, loaded dynamically)
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [soapNotes, setSoapNotes] = useState<SOAPNote[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([
    { id: '1', name: 'Dr. Jamie Morales', email: 'jamie@riverbendvet.com', role: 'Lead Veterinarian', status: 'Active', phone: '+1 (555) 234-5678', avatar: 'JM', notesCount: 42, appointmentsCount: 128, joinedDate: 'Jan 15, 2024' },
    { id: '2', name: 'Dr. Alex Morgan', email: 'alex@riverbendvet.com', role: 'Associate Veterinarian', status: 'Active', phone: '+1 (555) 345-6789', avatar: 'AM', notesCount: 28, appointmentsCount: 94, joinedDate: 'Mar 10, 2024' },
    { id: '3', name: 'Sarah Jenkins, RVT', email: 'sarah@riverbendvet.com', role: 'Vet Technician', status: 'Active', phone: '+1 (555) 456-7890', avatar: 'SJ', notesCount: 15, appointmentsCount: 156, joinedDate: 'Feb 01, 2024' },
    { id: '4', name: 'Michael Chang', email: 'michael@riverbendvet.com', role: 'Receptionist', status: 'Active', phone: '+1 (555) 567-8901', avatar: 'MC', notesCount: 0, appointmentsCount: 210, joinedDate: 'Apr 12, 2024' }
  ]);

  const handleAddStaff = (newStaff: Omit<StaffMember, 'id'>) => {
    const item: StaffMember = { ...newStaff, id: Math.random().toString(36).substring(2, 9) };
    setStaffMembers(prev => [item, ...prev]);
  };

  const handleUpdateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaffMembers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteStaff = (id: string) => {
    setStaffMembers(prev => prev.filter(s => s.id !== id));
  };

  // Mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Restore session on mount & handle clean pathname routing
  useEffect(() => {
    document.title = "DrVetly | The Operating System for Modern Veterinary Care";
    const initialView = getViewFromPath(window.location.pathname);
    const session = authService.getCurrentSession();
    if (session) {
      setCurrentUser(session.user.id);
      setClinicName(session.clinicName);
      setVetName(session.vetName);
      if (session.subscriptionPlan) {
        setSubscriptionPlan(session.subscriptionPlan);
      }
      setIsAuthenticated(true);
      if (initialView === 'homepage' || initialView === 'login' || initialView === 'signup') {
        navigateTo('dashboard');
      } else {
        navigateTo(initialView);
      }
    } else {
      if (initialView && initialView !== 'homepage') {
        navigateTo(initialView);
      } else {
        navigateTo('homepage');
      }
    }

    const handlePopState = () => {
      const v = getViewFromPath(window.location.pathname);
      setViewState(v);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redirect to dashboard if authenticated and trying to view public pages
  useEffect(() => {
    if (isAuthenticated && (view === 'login' || view === 'signup' || view === 'homepage')) {
      navigateTo('dashboard');
    }
  }, [isAuthenticated, view]);

  // Sync data whenever user logs in or changes
  useEffect(() => {
    if (!currentUser) {
      setPatients([]);
      setAppointments([]);
      setInvoices([]);
      setConversations([]);
      setSoapNotes([]);
      return;
    }

    let active = true;
    async function loadWorkspaceData() {
      try {
        const [loadedPat, loadedAppt, loadedInv, loadedNotes, loadedConv] = await Promise.all([
          dbService.getPatients(currentUser!),
          dbService.getAppointments(currentUser!),
          dbService.getInvoices(currentUser!),
          dbService.getSoapNotes(currentUser!),
          dbService.getConversations(currentUser!)
        ]);

        if (active) {
          setPatients(loadedPat);
          setAppointments(loadedAppt);
          setInvoices(loadedInv);
          setSoapNotes(loadedNotes);
          setConversations(loadedConv);
        }
      } catch (err) {
        console.error('Failed to load user records from dbService:', err);
      }
    }

    loadWorkspaceData();

    // Supabase Realtime subscription for instant multi-client sync
    const channel = supabase
      .channel('public:drvetly_master_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          loadWorkspaceData();
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (clinic: string, vet: string) => {
    const session = authService.getCurrentSession();
    if (session) {
      setCurrentUser(session.user.id);
      setClinicName(session.clinicName);
      setVetName(session.vetName);
      setSubscriptionPlan(session.subscriptionPlan || 'solo');
      setIsAuthenticated(true);
      navigateTo('dashboard');
    }
  };

  const handleSignupSuccess = (clinic: string, vet: string) => {
    const session = authService.getCurrentSession();
    if (session) {
      setCurrentUser(session.user.id);
      setClinicName(session.clinicName);
      setVetName(session.vetName);
      setSubscriptionPlan(session.subscriptionPlan || 'solo');
      setIsAuthenticated(true);
      navigateTo('dashboard');
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigateTo('homepage');
  };

  // State Mutators
  const handleAddPatient = async (newPat: Omit<Patient, 'id'>) => {
    if (!currentUser) return;
    const patient: Patient = {
      id: `${currentUser}_p_user_${Date.now()}`,
      ...newPat
    };
    const updated = [patient, ...patients];
    setPatients(updated);
    await dbService.savePatients(currentUser, updated);
    await syncPatientToSupabase(patient);
  };

  const handleAddAppointment = async (newAppt: Omit<Appointment, 'id'>) => {
    if (!currentUser) return;
    const appointment: Appointment = {
      id: `${currentUser}_a_user_${Date.now()}`,
      ...newAppt
    };
    const updated = [appointment, ...appointments];
    setAppointments(updated);
    await dbService.saveAppointments(currentUser, updated);
  };

  const handleAddSoapNote = async (newSoap: SOAPNote) => {
    if (!currentUser) return;
    const updated = [newSoap, ...soapNotes];
    setSoapNotes(updated);
    await dbService.saveSoapNotes(currentUser, updated);
    await syncSoapNoteToSupabase(newSoap);
    
    // Add timeline log entry directly to the patient's record status
    const updatedPatients = patients.map(p => {
      if (p.id === newSoap.patientId) {
        return {
          ...p,
          status: 'Note approved'
        };
      }
      return p;
    });
    setPatients(updatedPatients);
    await dbService.savePatients(currentUser, updatedPatients);
  };

  const handleAddInvoice = async (newInv: Omit<Invoice, 'id' | 'clientName'>) => {
    if (!currentUser) return;
    const patient = patients.find(p => p.id === newInv.patientId);
    const invoice: Invoice = {
      id: `${currentUser}_inv_user_${Date.now()}`,
      patientId: newInv.patientId,
      clientName: patient ? patient.ownerName : 'Unknown',
      date: newInv.date,
      amount: newInv.amount,
      status: newInv.status as any
    };
    const updated = [invoice, ...invoices];
    setInvoices(updated);
    await dbService.saveInvoices(currentUser, updated);
    await syncInvoiceToSupabase(invoice);
  };

  const handleSendMessage = async (newMsg: { patientId: string; sender: 'clinic' | 'owner'; time: string; text: string }) => {
    if (!currentUser) return;
    const updatedConversations = conversations.map(c => {
      const patient = patients.find(p => p.id === newMsg.patientId);
      if (patient && c.patientName === patient.name) {
        const msg: Message = {
          id: Math.random().toString(),
          senderName: newMsg.sender === 'clinic' ? vetName : patient.ownerName,
          text: newMsg.text,
          time: newMsg.time,
          isIncoming: newMsg.sender !== 'clinic'
        };
        return {
          ...c,
          lastMessageText: newMsg.text,
          lastMessageTime: 'Just now',
          messages: [...c.messages, msg]
        };
      }
      return c;
    });
    setConversations(updatedConversations);
    await dbService.saveConversations(currentUser, updatedConversations);
  };

  const handleSelectPatientId = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const handleClearSelectedPatient = () => {
    setSelectedPatientId(null);
  };

  // Map messages structure for MessagesView component
  const flatMessagesList: { id: string; patientId: string; sender: 'clinic' | 'owner'; text: string; time: string }[] = [];
  conversations.forEach(c => {
    const patient = patients.find(p => p.ownerName === c.clientName);
    if (patient) {
      c.messages.forEach(m => {
        flatMessagesList.push({
          id: m.id,
          patientId: patient.id,
          sender: m.isIncoming ? 'owner' : 'clinic',
          text: m.text,
          time: m.time
        });
      });
    }
  });

  const handleMessagesViewSend = (newMsg: { patientId: string; sender: 'clinic' | 'owner'; text: string; time: string }) => {
    handleSendMessage({
      patientId: newMsg.patientId,
      sender: newMsg.sender,
      time: newMsg.time,
      text: newMsg.text
    });
  };


  // Render content according to the active authenticated view
  const renderClinicalView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <DashboardView 
            patients={patients}
            appointments={appointments}
            invoices={invoices}
            soapNotes={soapNotes}
            onSetView={(v) => navigateTo(v as any)}
            onSelectPatient={handleSelectPatientId}
            vetName={vetName}
            clinicName={clinicName}
          />
        );
      case 'schedule':
        return (
          <ScheduleView 
            patients={patients}
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            vetName={vetName}
          />
        );
      case 'patients':
        return (
          <PatientsView 
            patients={patients}
            onAddPatient={handleAddPatient}
            selectedPatientId={selectedPatientId}
            onClearSelectedPatient={handleClearSelectedPatient}
            soapNotes={soapNotes}
          />
        );
      case 'soap-notes':
        return (
          <SoapNotesView 
            patients={patients}
            onAddSoapNote={handleAddSoapNote}
            soapNotes={soapNotes}
          />
        );
      case 'billing':
        return (
          <BillingView 
            patients={patients}
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
          />
        );
      case 'messages':
        return (
          <MessagesView 
            patients={patients}
            messages={flatMessagesList}
            onSendMessage={handleMessagesViewSend}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            clinicName={clinicName}
            vetName={vetName}
            userEmail={authService.getCurrentSession()?.user.email || 'vet@hotivet.com'}
            onUpdateClinic={(c, v) => { 
              setClinicName(c); 
              setVetName(v); 
              authService.updateProfile(c, v);
            }}
            onDeleteAccount={handleLogout}
            patientsCount={patients.length}
            appointmentsCount={appointments.length}
          />
        );
      case 'pricing':
        return (
          <PricingView 
            onNavigate={navigateTo} 
            isAuthenticated={isAuthenticated} 
            currentPlan={subscriptionPlan}
            onSelectPlan={async (plan) => {
              await authService.updateSubscriptionPlan(plan);
              setSubscriptionPlan(plan);
              navigateTo('dashboard');
              alert(`Successfully updated your DrVetly subscription plan to ${plan === 'solo' ? 'Solo Clinic' : plan === 'hyper' ? 'Hyper Clinic' : 'custom plan'}!`);
            }}
          />
        );
      case 'contact':
        return <ContactView onNavigate={navigateTo} isAuthenticated={isAuthenticated} />;
      case 'beta':
        return <BetaClinicsView onNavigate={navigateTo} isAuthenticated={isAuthenticated} />;
      case 'privacy':
        return <PrivacyView onNavigate={navigateTo} isAuthenticated={isAuthenticated} />;
      case 'terms':
        return <TermsView onNavigate={navigateTo} isAuthenticated={isAuthenticated} />;
      case 'staff':
        return (
          <StaffView 
            staffMembers={staffMembers}
            onAddStaff={handleAddStaff}
            onUpdateStaff={handleUpdateStaff}
            onDeleteStaff={handleDeleteStaff}
            vetName={vetName}
            clinicName={clinicName}
          />
        );
      default:
        return null;
    }
  };

  // Render Landing Pages
  const path = window.location.pathname;
  if (path.startsWith('/book/')) {
    const clinicSlug = path.replace('/book/', '').replace('/', '');
    return <PublicBookingPage clinicSlug={clinicSlug || 'riverbend-animal-hospital'} />;
  }

  if (!isAuthenticated) {
    if (view === 'login') {
      return <Login onNavigate={navigateTo} onLoginSuccess={handleLoginSuccess} />;
    }
    if (view === 'signup') {
      return <Signup onNavigate={navigateTo} onSignupSuccess={handleSignupSuccess} />;
    }
    if (view === 'pricing') {
      return <PricingView onNavigate={navigateTo} isAuthenticated={false} />;
    }
    if (view === 'contact') {
      return <ContactView onNavigate={navigateTo} isAuthenticated={false} />;
    }
    if (view === 'beta') {
      return <BetaClinicsView onNavigate={navigateTo} isAuthenticated={false} />;
    }
    if (view === 'privacy') {
      return <PrivacyView onNavigate={navigateTo} isAuthenticated={false} />;
    }
    if (view === 'terms') {
      return <TermsView onNavigate={navigateTo} isAuthenticated={false} />;
    }
    return <Homepage onNavigate={navigateTo} />;
  }

  // Active Workspace Navigation Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="9" rx="2" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="3" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.6"/><rect x="14" y="12" width="7" height="9" rx="2" stroke="currentColor" strokeWidth="1.6"/><rect x="3" y="16" width="7" height="5" rx="2" stroke="currentColor" strokeWidth="1.6"/></svg>
    ) },
    { id: 'schedule', label: 'Schedule', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
    ) },
    { id: 'patients', label: 'Patients', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
    ) },
    { id: 'soap-notes', label: 'SOAP notes', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M14 2v6h6M9 13h6M9 17h6M9 9h1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
    ) },
    { id: 'billing', label: 'Billing', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
    ) },
    { id: 'messages', label: 'Messages', icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>
    ) }
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.replace(/[^A-Za-z]/g, '')[0]).filter(Boolean).join('').substring(0, 2).toUpperCase() || 'JM';
  };

  return (
    <div className="min-h-screen bg-[#f5f8fd] text-[#04044A] selection:bg-[#00E1FF] selection:text-[#04044A] font-sans antialiased">
      
      {/* Mobile Topbar */}
      <div className="md:hidden h-16 px-5 bg-white border-b border-[#e3eaf6] flex items-center justify-between z-40 sticky top-0">
        <button onClick={() => navigateTo('dashboard')} className="flex items-center gap-3 font-bold text-base text-[#04044A] border-none bg-transparent cursor-pointer group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md">
            <Stethoscope size={18} />
          </div>
          DrVetly
        </button>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 border border-[#e3eaf6] rounded-xl bg-white text-[#04044A] flex items-center justify-center cursor-pointer hover:bg-slate-50">
          <Menu size={18} />
        </button>
      </div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#04044A]/10 backdrop-blur-xs z-40 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ================= CURVED FLOATING SIDEBAR ================= */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <button onClick={() => { navigateTo('dashboard'); setMobileMenuOpen(false); }} className="sb-brand group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
            <Stethoscope size={20} />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-bold text-[17px] tracking-tight text-[#04044A]">
              DrVetly
            </span>
          </div>
        </button>

        <div className="sb-nav">
          {navItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { navigateTo(item.id as any); setMobileMenuOpen(false); }}
                className={`sb-item ${isActive ? 'active' : ''}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="sb-section-label">Workspace</div>
          <button onClick={() => { navigateTo('staff'); setMobileMenuOpen(false); }} className={`sb-item ${view === 'staff' ? 'active' : ''}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span>Staff</span>
          </button>
          <button onClick={() => { navigateTo('settings'); setMobileMenuOpen(false); }} className={`sb-item ${view === 'settings' ? 'active' : ''}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.4"/></svg>
            <span>Settings</span>
          </button>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="sb-item text-red-600 hover:text-red-700">
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>

        <div className="sb-footer">
          <div className="sb-upgrade">
            <p className="t">
              {subscriptionPlan === 'custom' ? "You're on custom plan" : subscriptionPlan === 'hyper' ? "You're on Hyper Clinic" : "You're on Solo Clinic"}
            </p>
            <p className="d">
              {subscriptionPlan === 'custom' 
                ? "You are on the highest plan of DrVetly with dedicated PIMS support." 
                : subscriptionPlan === 'hyper' 
                ? "Upgrade to Custom plan for multi-location groups." 
                : "Upgrade to Hyper Clinic for unlimited AI notes and two-way SMS."}
            </p>
            {subscriptionPlan !== 'custom' ? (
              <button onClick={() => navigateTo('pricing')}>Upgrade plan</button>
            ) : (
              <button onClick={() => navigateTo('pricing')} className="text-xs text-sky-600 font-semibold mt-1">View custom plan</button>
            )}
          </div>
          <button className="sb-user" onClick={() => navigateTo('settings')} title="View and edit personal info & settings">
            <div className="sb-avatar">{getInitials(vetName)}</div>
            <div>
              <div className="u-name">{vetName}</div>
              <div className="u-role">Veterinarian &middot; Admin</div>
            </div>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTAINER ================= */}
      <div className="main">
        {/* Topbar header - only shown on dashboard overview page */}
        {view === 'dashboard' && (
          <header className="topbar hidden md:flex">
            <div className="tb-left">
              <h1 className="capitalize">Dashboard</h1>
              <div className="breadcrumb">{clinicName}</div>
            </div>
            <div className="tb-right">
              <div className="search-box">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="7" stroke="#8a92b8" strokeWidth="1.8" />
                  <path d="M21 21l-4.35-4.35" stroke="#8a92b8" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <input type="text" placeholder="Search patients, clients, notes&hellip;" />
                <span className="kbd">⌘K</span>
              </div>
              <button className="icon-btn" title="Notifications" onClick={() => alert('Medical sync state: 100% synchronized.')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="#3c4372" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#3c4372" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="dot-alert"></span>
              </button>
              <button className="icon-btn" title="Help" onClick={() => alert('Support line active. E-mail support@drvetly.com.')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#3c4372" strokeWidth="1.6" />
                  <path d="M9.5 9a2.5 2.5 0 015 .5c0 1.5-2.5 1.8-2.5 3.5" stroke="#3c4372" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="0.9" fill="#3c4372" />
                </svg>
              </button>
              <button onClick={() => navigateTo('schedule')} className="btn btn-primary">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                New appointment
              </button>
            </div>
          </header>
        )}

        {/* Content Area */}
        <div className="content">
          {renderClinicalView()}
        </div>
      </div>

    </div>
  );
}
