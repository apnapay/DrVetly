import React, { useState } from 'react';
import { 
  Send, 
  Check, 
  PhoneCall, 
  CheckCheck, 
  Smile, 
  Star, 
  ClipboardList, 
  Search, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Zap,
  Lock,
  Sparkles
} from 'lucide-react';
import { Patient } from '../types';
import { renderPatientAvatar } from '../lib/supabaseStorage';

export interface MessagesViewItem {
  id: string;
  patientId: string;
  sender: 'clinic' | 'owner';
  text: string;
  time: string;
}

interface MessagesViewProps {
  patients: Patient[];
  messages: MessagesViewItem[];
  onSendMessage: (msg: { patientId: string; sender: 'clinic' | 'owner'; text: string; time: string }) => void;
}

const TEMPLATES = [
  { label: 'Vaccine Recall', text: 'Hi! This is Riverbend Animal Hospital reminding you that your pet is due for booster vaccinations. Reply to this text or click to book a time.' },
  { label: 'Surgical Prep', text: 'Reminder: Pre-surgical fasting starts at midnight tonight. No food or water after 12:00 AM. Please arrive at the clinic at 7:30 AM tomorrow.' },
  { label: 'Follow-up Recheck', text: 'Hello! Just checking in on how your pet is doing with their Carprofen medication. Let us know if the limping has improved or if you need anything!' }
];

export default function MessagesView({
  patients,
  messages,
  onSendMessage
}: MessagesViewProps) {
  const [activeThreadPatientId, setActiveThreadPatientId] = useState(patients[0]?.id || '');
  const [draftText, setDraftText] = useState('');
  const [searchThread, setSearchThread] = useState('');

  const getPatientForId = (id: string) => {
    return patients.find(p => p.id === id);
  };

  const activePatient = getPatientForId(activeThreadPatientId);

  // Filter messages for active chat thread
  const activeThreadMessages = messages.filter(msg => msg.patientId === activeThreadPatientId);

  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;

    onSendMessage({
      patientId: activeThreadPatientId,
      sender: 'clinic',
      time: 'Just now',
      text: draftText
    });

    setDraftText('');
  };

  const handleApplyTemplate = (text: string) => {
    setDraftText(text);
  };

  // Filter patients by thread search
  const filteredPatients = patients.filter(pat => {
    return pat.ownerName.toLowerCase().includes(searchThread.toLowerCase()) || 
           pat.name.toLowerCase().includes(searchThread.toLowerCase());
  });

  return (
    <div className="space-y-6 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 welcome-band fade-in">
        <div>
          <h2>SMS Messenger</h2>
          <p>Initiate two-way client messaging. Send immediate medical briefs, pre-surgical checklists, or vaccination recalls.</p>
        </div>
      </div>

      {/* Workspace Wrapper with Background Blur & Locked Overlay */}
      <div className="relative rounded-[24px] overflow-hidden">
        
        {/* Blurred underlying workspace */}
        <div className="grid grid-cols-1 md:grid-cols-[290px_1fr] bg-white border border-[#e3eaf6] rounded-[24px] overflow-hidden shadow-sm h-[580px] filter blur-md select-none pointer-events-none opacity-50">
          
          {/* Left Side: Threads list */}
          <div className="border-r border-[#e3eaf6] flex flex-col justify-start overflow-y-auto bg-slate-50/20">
            
            <div className="p-4 border-b border-[#e3eaf6] bg-white space-y-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-[#8a92b8] font-bold flex items-center gap-1.5">
                <MessageSquare size={12} className="text-[#00A4FF]" /> Active conversations
              </div>
              <div className="flex items-center gap-2 border border-[#dfe7f4] rounded-xl px-2.5 py-1.5 bg-slate-50">
                <Search size={12} className="text-[#8a92b8]" />
                <input 
                  type="text" 
                  className="text-xs text-[#04044A] outline-none border-none bg-transparent w-full font-medium"
                  placeholder="Search contact..."
                  value={searchThread}
                  onChange={(e) => setSearchThread(e.target.value)}
                  readOnly
                />
              </div>
            </div>
            
            <div className="divide-y divide-[#e3eaf6]/40">
              {filteredPatients.map((pat) => {
                const threadMsgs = messages.filter(m => m.patientId === pat.id);
                const lastMsg = threadMsgs[threadMsgs.length - 1];

                return (
                  <div
                    key={pat.id}
                    className="w-full p-4.5 text-left flex items-center gap-3.5 bg-white"
                  >
                    <span className="flex-shrink-0">{renderPatientAvatar(pat.avatar, 'w-10 h-10', 'text-lg')}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-xs text-[#04044A] truncate">{pat.ownerName}</h4>
                        <span className="font-mono text-[9px] text-[#8a92b8]">{lastMsg?.time || '1d ago'}</span>
                      </div>
                      <div className="text-[10px] text-[#8a92b8] font-semibold truncate mt-0.5">Pet: {pat.name} &bull; {pat.breed}</div>
                      <p className="text-[11px] text-[#5a6291] truncate mt-1.5 font-medium">{lastMsg?.text || 'No recent messages'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Active conversation thread */}
          <div className="flex flex-col justify-between bg-white h-full relative">
            
            <div className="p-4.5 border-b border-[#e3eaf6] flex items-center justify-between bg-white shadow-xs z-10">
              <div className="flex items-center gap-3.5">
                <span className="flex-shrink-0">{renderPatientAvatar(activePatient?.avatar, 'w-10 h-10', 'text-lg')}</span>
                <div>
                  <h3 className="font-bold text-xs.5 text-[#04044A] tracking-tight">{activePatient?.ownerName}</h3>
                  <p className="text-[11px] text-[#8a92b8] font-medium">Pet patient: <span className="font-bold text-[#5a6291]">{activePatient?.name}</span> &bull; {activePatient?.breed}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] bg-[#E8FBF3] border border-[#BEF0DA] text-[#00875A] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C875]"></span> Clinic line live
                </span>
                <button className="w-9 h-9 rounded-xl border border-[#e3eaf6] flex items-center justify-center text-[#5a6291]">
                  <PhoneCall size={14} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5.5 space-y-4 bg-slate-50/15">
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-2xl p-4 text-xs leading-relaxed bg-[#04044A] text-white">
                  <p className="font-medium">Hello, this is a sample encrypted patient communication record.</p>
                </div>
              </div>
            </div>

            <div className="px-5 py-2.5 bg-slate-50 border-t border-[#e3eaf6] flex items-center gap-2 flex-wrap text-[10.5px]">
              <span className="font-mono text-[#8a92b8] font-bold uppercase mr-1 flex items-center gap-1.5"><ClipboardList size={11.5} /> Scribe shortcuts:</span>
              {TEMPLATES.map((tmpl) => (
                <span key={tmpl.label} className="bg-white border border-[#e3eaf6] text-[#3c4372] font-semibold px-2.5 py-1 rounded-lg">
                  {tmpl.label}
                </span>
              ))}
            </div>

            <div className="p-4 border-t border-[#e3eaf6] bg-white flex gap-3 items-center">
              <input 
                type="text" 
                className="flex-1 px-4 py-3.5 border border-[#dfe7f4] rounded-xl text-xs text-[#04044A] bg-slate-50 font-semibold"
                placeholder="Type message..."
                readOnly
              />
              <button className="w-11 h-11 rounded-xl bg-[#04044A] text-white flex items-center justify-center">
                <Send size={15} />
              </button>
            </div>

          </div>
        </div>

        {/* Locked Feature Frosted Glass Overlay with Background Blur */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#04044A]/15 backdrop-blur-[8px] p-6 text-center">
          <div className="bg-white/95 border border-[#e3eaf6] p-8 sm:p-10 rounded-[32px] shadow-2xl max-w-[460px] w-full flex flex-col items-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#04044A] to-[#0057D9] flex items-center justify-center text-white shadow-xl shadow-[#04044A]/25">
              <Lock size={30} strokeWidth={2.2} />
            </div>

            <div className="space-y-2">
              <span className="font-mono text-[10px] uppercase tracking-wider bg-[#eef3fb] text-[#04044A] font-extrabold px-3.5 py-1 rounded-full inline-flex items-center gap-1.5 border border-[#d6e3f8]">
                <Sparkles size={11} className="text-[#00A4FF]" /> Coming Soon
              </span>
              <h3 className="text-xl font-bold text-[#04044A] tracking-tight mt-2">SMS Messenger Locked</h3>
              <p className="text-xs text-[#5a6291] leading-relaxed max-w-[380px] mx-auto mt-1">
                Two-way client messaging, automated vaccine reminders, and pre-surgical briefs are currently locked and scheduled for an upcoming DrVetly release.
              </p>
            </div>

            <div className="pt-2">
              <button 
                type="button"
                onClick={() => alert('Coming Soon: Two-Way SMS Messenger feature will be unlocked in the next update!')}
                className="btn btn-primary px-7 py-3.5 text-xs font-bold shadow-lg inline-flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all"
              >
                <Lock size={14} /> Coming soon &middot; Feature locked
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

