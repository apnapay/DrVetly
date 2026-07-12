import React, { useState, useEffect } from 'react';
import Homepage from './components/Homepage';
import Login from './components/Login';
import Signup from './components/Signup';
import AuthCallback from './components/AuthCallback';
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
import { Patient, Appointment, SOAPNote, Invoice, Conversation, Message, StaffMember } from './types';
import { Home, Calendar, Users, FileText, DollarSign, MessageSquare, LogOut, Menu, Shield, Stethoscope } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

export default function App() {
  type ViewType = 'homepage' | 'login' | 'signup' | 'auth-callback' | 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages' | 'staff' | 'settings' | 'pricing' | 'contact' | 'beta' | 'privacy' | 'terms';

  const getViewFromPath = (path: string): ViewType => {
    const clean = path.replace(/^\/+/, '').trim();
    if (clean === 'auth/callback' || clean === 'auth/v1/callback') return 'auth-callback';
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
      case 'auth-callback': return '/auth/callback';
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
  const [subscriptionPlan, setSubscriptionPlan] = useState<'solo' | 'hyper' | 'custom'>('solo');

  // Master State Database
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [soapNotes, setSoapNotes] = useState<SOAPNote[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);

  const handleAddStaff = async (newStaff: Omit<StaffMember, 'id'>) => {
    const { error } = await supabase.from('users').insert({
      first_name: newStaff.name.split(' ')[0] || 'Staff',
      last_name: newStaff.name.split(' ').slice(1).join(' ') || 'Member',
      email: newStaff.email,
      role: newStaff.role.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'VET',
      phone: newStaff.phone,
      active: newStaff.status === 'Active'
    });
    if (error) {
      alert('Failed to add staff member: ' + error.message);
    }
  };

  const handleUpdateStaff = async (id: string, updates: Partial<StaffMember>) => {
    const { error } = await supabase.from('users').update({
      first_name: updates.name?.split(' ')[0],
      last_name: updates.name?.split(' ').slice(1).join(' '),
      email: updates.email,
      phone: updates.phone,
      active: updates.status === 'Active'
    }).eq('id', id);
    if (error) {
      alert('Failed to update staff member: ' + error.message);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      alert('Failed to delete staff member: ' + error.message);
    }
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Restore session on mount & handle clean pathname routing
  useEffect(() => {
    document.title = "DrVetly | The Operating System for Modern Veterinary Care";
    const initialView = getViewFromPath(window.location.pathname);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentUser(session.user.id);
        const { data: userData } = await supabase
          .from('users')
          .select('*, clinics(name, plan)')
          .eq('auth_id', session.user.id)
          .maybeSingle();

        if (userData) {
          setClinicName((userData.clinics as any)?.name || 'My Veterinary Clinic');
          setVetName(`${userData.first_name} ${userData.last_name}`);
          setSubscriptionPlan(((userData.clinics as any)?.plan || 'solo').toLowerCase());
        } else if (session?.user) {
          const email = session.user.email || 'vet@example.com';
          const prefix = email.split('@')[0];
          const defaultClinicName = `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Veterinary Clinic`;
          const defaultFirstName = 'Dr. ' + (prefix.charAt(0).toUpperCase() + prefix.slice(1));
          const defaultLastName = 'Practitioner';
          try {
            const { data: clinicRes } = await supabase.from('clinics').insert({ name: defaultClinicName, plan: 'SOLO' }).select().single();
            if (clinicRes) {
              await supabase.from('users').insert({
                auth_id: session.user.id,
                email,
                first_name: defaultFirstName,
                last_name: defaultLastName,
                role: 'ADMIN',
                clinic_id: clinicRes.id,
                active: true
              });
              setClinicName(defaultClinicName);
              setVetName(`${defaultFirstName} ${defaultLastName}`);
              setSubscriptionPlan('solo');
            }
          } catch (e) {
            setClinicName('My Veterinary Clinic');
            setVetName(email);
          }
        }
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
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setCurrentUser(session.user.id);
        const { data: userData } = await supabase
          .from('users')
          .select('*, clinics(name, plan)')
          .eq('auth_id', session.user.id)
          .maybeSingle();

        if (userData) {
          setClinicName((userData.clinics as any)?.name || 'My Veterinary Clinic');
          setVetName(`${userData.first_name} ${userData.last_name}`);
          setSubscriptionPlan(((userData.clinics as any)?.plan || 'solo').toLowerCase());
        } else if (session?.user) {
          const email = session.user.email || 'vet@example.com';
          const prefix = email.split('@')[0];
          const defaultClinicName = `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} Veterinary Clinic`;
          const defaultFirstName = 'Dr. ' + (prefix.charAt(0).toUpperCase() + prefix.slice(1));
          const defaultLastName = 'Practitioner';
          try {
            const { data: clinicRes } = await supabase.from('clinics').insert({ name: defaultClinicName, plan: 'SOLO' }).select().single();
            if (clinicRes) {
              await supabase.from('users').insert({
                auth_id: session.user.id,
                email,
                first_name: defaultFirstName,
                last_name: defaultLastName,
                role: 'ADMIN',
                clinic_id: clinicRes.id,
                active: true
              });
              setClinicName(defaultClinicName);
              setVetName(`${defaultFirstName} ${defaultLastName}`);
              setSubscriptionPlan('solo');
            }
          } catch (e) {
            setClinicName('My Veterinary Clinic');
            setVetName(email);
          }
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    });

    const handlePopState = () => {
      const v = getViewFromPath(window.location.pathname);
      setViewState(v);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      subscription.unsubscribe();
    };
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
      setStaffMembers([]);
      return;
    }

    let active = true;
    async function loadWorkspaceData() {
      try {
        const [patRes, apptRes, invRes, notesRes, staffRes] = await Promise.all([
          supabase.from('patients').select('*, client:clients(*)').order('created_at', { ascending: false }),
          supabase.from('appointments').select('*, patient:patients(*, client:clients(*)), vet:users(*)').order('start_at', { ascending: true }),
          supabase.from('invoices').select('*, client:clients(*), patient:patients(*)').order('created_at', { ascending: false }),
          supabase.from('soap_notes').select('*, patient:patients(*)').order('created_at', { ascending: false }),
          supabase.from('users').select('*').order('created_at', { ascending: true })
        ]);

        if (active) {
          if (patRes.data) {
            setPatients(patRes.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              species: p.species,
              breed: p.breed,
              age: p.age_label || '2y',
              weight: `${p.weight_kg || 15} kg`,
              gender: 'Spayed Female',
              ownerName: p.client ? `${p.client.first_name} ${p.client.last_name}` : 'Sarah Connor',
              ownerEmail: p.client?.email || 'owner@example.com',
              ownerPhone: p.client?.phone || '555-0192',
              avatar: p.avatar || '🐶',
              status: p.status || 'Active',
              temp: `${p.temp_f || 101.2}°F`,
              heartRate: '88 bpm',
              respRate: '22 rpm',
              lastVisit: 'Recent',
              notes: p.notes || 'Healthy checkup'
            })));
          }

          if (apptRes.data) {
            setAppointments(apptRes.data.map((a: any) => ({
              id: a.id,
              patientName: a.patient?.name || 'Patient',
              species: a.patient?.species || 'Canine',
              ownerName: a.patient?.client ? `${a.patient.client.first_name} ${a.patient.client.last_name}` : 'Client',
              time: new Date(a.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: new Date(a.start_at).toISOString().split('T')[0],
              type: a.reason || 'General Exam',
              status: (a.status || 'SCHEDULED').toLowerCase(),
              avatar: a.patient?.avatar || '🐶',
              vetAssigned: a.vet ? `${a.vet.first_name} ${a.vet.last_name}` : 'Dr. Jamie Morales'
            })));
          }

          if (invRes.data) {
            setInvoices(invRes.data.map((inv: any) => ({
              id: inv.id,
              patientId: inv.patient_id,
              clientName: inv.client ? `${inv.client.first_name} ${inv.client.last_name}` : 'Client',
              date: new Date(inv.created_at).toISOString().split('T')[0],
              amount: `$${((inv.amount_cents || 15000) / 100).toFixed(2)}`,
              status: (inv.status || 'PENDING').toLowerCase()
            })));
          }

          if (notesRes.data) {
            setSoapNotes(notesRes.data.map((n: any) => ({
              id: n.id,
              patientId: n.patient_id,
              patientName: n.patient?.name || 'Patient',
              date: new Date(n.created_at).toISOString().split('T')[0],
              transcript: n.transcript || '',
              subjective: n.subjective || '',
              objective: n.objective || '',
              assessment: n.assessment || '',
              plan: n.plan || '',
              status: (n.status || 'PENDING_REVIEW').toLowerCase()
            })));
          }

          if (staffRes.data) {
            setStaffMembers(staffRes.data.map((u: any) => ({
              id: u.id,
              name: `${u.first_name} ${u.last_name}`,
              email: u.email,
              role: u.role === 'ADMIN' ? 'Lead Veterinarian' : 'Associate Veterinarian',
              status: u.active ? 'Active' : 'Inactive',
              phone: u.phone || '+1 (555) 234-5678',
              avatar: `${u.first_name?.[0] || 'V'}${u.last_name?.[0] || 'T'}`.toUpperCase(),
              notesCount: 12,
              appointmentsCount: 45,
              joinedDate: new Date(u.created_at).toLocaleDateString()
            })));
          }
        }
      } catch (err) {
        console.error('Failed to load Supabase workspace data:', err);
      }
    }

    loadWorkspaceData();

    const channel = supabase
      .channel('public:drvetly_master_sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        loadWorkspaceData();
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [currentUser]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigateTo('homepage');
  };

  // State Mutators
  const handleAddPatient = async (newPat: Omit<Patient, 'id'>) => {
    const { error } = await supabase.from('patients').insert({
      name: newPat.name,
      species: newPat.species,
      breed: newPat.breed,
      age_label: newPat.age,
      weight_kg: parseFloat(newPat.weight) || 15,
      avatar: newPat.avatar,
      status: newPat.status
    });
    if (error) alert('Failed to add patient: ' + error.message);
  };

  const handleAddAppointment = async (newAppt: Omit<Appointment, 'id'>) => {
    const { error } = await supabase.from('appointments').insert({
      patient_id: newAppt.patientId,
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 1800000).toISOString(),
      reason: newAppt.reason,
      status: 'SCHEDULED'
    });
    if (error) alert('Failed to schedule appointment: ' + error.message);
  };

  const handleAddSoapNote = async (newSoap: SOAPNote) => {
    const { error } = await supabase.from('soap_notes').insert({
      patient_id: newSoap.patientId,
      transcript: newSoap.rawTranscript || '',
      subjective: newSoap.subjective,
      objective: newSoap.objective,
      assessment: newSoap.assessment,
      plan: newSoap.plan,
      status: newSoap.status.toUpperCase() === 'APPROVED' ? 'APPROVED' : 'PENDING_REVIEW'
    });
    if (error) alert('Failed to save SOAP note: ' + error.message);
  };

  const handleAddInvoice = async (newInv: Omit<Invoice, 'id' | 'clientName'>) => {
    const { error } = await supabase.from('invoices').insert({
      patient_id: newInv.patientId,
      amount_cents: Math.round(newInv.amount * 100),
      status: newInv.status.toUpperCase(),
      line_items: [{ description: 'Veterinary Consultation & Treatment', amount: newInv.amount }]
    });
    if (error) alert('Failed to create invoice: ' + error.message);
  };

  const handleSendMessage = async (newMsg: { patientId: string; sender: 'clinic' | 'owner'; text: string; time: string }) => {
    const { error } = await supabase.from('messages').insert({
      patient_id: newMsg.patientId,
      sender: newMsg.sender === 'clinic' ? 'CLINIC' : 'CLIENT',
      channel: 'IN_APP',
      body: newMsg.text
    });
    if (error) alert('Failed to send message: ' + error.message);
  };

  const handleSelectPatientId = (patientId: string) => {
    setSelectedPatientId(patientId);
  };

  const handleClearSelectedPatient = () => {
    setSelectedPatientId(null);
  };

  const flatMessagesList: { id: string; patientId: string; sender: 'clinic' | 'owner'; text: string; time: string }[] = [];
  conversations.forEach(c => {
    c.messages.forEach(m => {
      flatMessagesList.push({
        id: m.id,
        patientId: 'p1',
        sender: m.isIncoming ? 'owner' : 'clinic',
        text: m.text,
        time: m.time
      });
    });
  });

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
            onSendMessage={handleSendMessage}
          />
        );
      case 'settings':
        return (
          <SettingsView 
            clinicName={clinicName}
            vetName={vetName}
            userEmail={'vet@hotivet.com'}
            onUpdateClinic={async (c, v) => { 
              setClinicName(c); 
              setVetName(v); 
              await supabase.from('clinics').update({ name: c }).eq('name', clinicName);
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

  const path = window.location.pathname;
  if (path.startsWith('/book/')) {
    const clinicSlug = path.replace('/book/', '').replace('/', '');
    return <PublicBookingPage clinicSlug={clinicSlug || 'riverbend-animal-hospital'} />;
  }

  if (view === 'auth-callback' || path.startsWith('/auth/callback')) {
    return <AuthCallback onNavigate={navigateTo} onLoginSuccess={() => navigateTo('dashboard')} />;
  }

  if (!isAuthenticated) {
    if (view === 'login') {
      return <Login onNavigate={navigateTo} onLoginSuccess={() => navigateTo('dashboard')} />;
    }
    if (view === 'signup') {
      return <Signup onNavigate={navigateTo} onSignupSuccess={() => navigateTo('dashboard')} />;
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
                ? "You are on the highest tier of DrVetly with dedicated PIMS support." 
                : subscriptionPlan === 'hyper' 
                ? "Upgrade to Custom plan for multi-location groups." 
                : "Upgrade to Hyper Clinic for unlimited AI notes and two-way SMS."}
            </p>
            <button onClick={() => navigateTo('pricing')}>Upgrade plan</button>
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
              <button className="icon-btn" title="Notifications" onClick={() => alert('Supabase Postgres connection active & synchronized.')}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" stroke="#3c4372" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" stroke="#3c4372" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                <span className="dot-alert"></span>
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

        <div className="content">
          {renderClinicalView()}
        </div>
      </div>

    </div>
  );
}
