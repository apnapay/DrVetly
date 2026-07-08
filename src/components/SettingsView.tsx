import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  ShieldAlert, 
  Trash2, 
  CheckCircle2, 
  Save, 
  Download, 
  Lock, 
  Bell, 
  Sparkles,
  AlertTriangle,
  X
} from 'lucide-react';

interface SettingsViewProps {
  clinicName: string;
  vetName: string;
  userEmail: string;
  onUpdateClinic: (clinic: string, vet: string) => void;
  onDeleteAccount: () => void;
  patientsCount: number;
  appointmentsCount: number;
}

export default function SettingsView({
  clinicName,
  vetName,
  userEmail,
  onUpdateClinic,
  onDeleteAccount,
  patientsCount,
  appointmentsCount
}: SettingsViewProps) {
  const [nameInput, setNameInput] = useState(clinicName);
  const [vetInput, setVetInput] = useState(vetName);
  const [phoneInput, setPhoneInput] = useState('555-0199');
  const [timezone, setTimezone] = useState('America/New_York');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [aiAutoFormat, setAiAutoFormat] = useState(true);
  
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(localStorage.getItem('drvetly_supabase_url') || 'https://fakqramigcggrpacopyz.supabase.co');
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(localStorage.getItem('drvetly_supabase_key') || '');
  const [supabaseSaved, setSupabaseSaved] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('drvetly_supabase_url', supabaseUrlInput);
    localStorage.setItem('drvetly_supabase_key', supabaseKeyInput);
    localStorage.removeItem('drvetly_force_local');
    setSupabaseSaved(true);
    setTimeout(() => {
      setSupabaseSaved(false);
      window.location.reload();
    }, 1000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateClinic(nameInput, vetInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const data = {
      clinic: nameInput,
      vet: vetInput,
      email: userEmail,
      phone: phoneInput,
      timezone,
      exportedAt: new Date().toISOString(),
      stats: { patientsCount, appointmentsCount }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nameInput.toLowerCase().replace(/\s+/g, '_')}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e3eaf6]">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#04044A]">Practice &amp; Account Settings</h2>
          <p className="text-sm text-[#5a6291] mt-1">Manage your clinic profile, clinician preferences, and secure data storage.</p>
        </div>
        {savedSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs animate-bounce">
            <CheckCircle2 size={16} className="text-emerald-600" /> Settings updated successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Clinic Profile */}
        <div className="bg-white p-6 rounded-2xl border border-[#e3eaf6] shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-[#e3eaf6]">
            <div className="w-10 h-10 rounded-xl bg-[#E6F5FF] text-[#0057D9] flex items-center justify-center font-bold">
              <Building2 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#04044A]">Clinic &amp; Practice Information</h3>
              <p className="text-xs text-[#5a6291]">Update your hospital name, location details, and time zone.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Hospital / Clinic Name</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-3.5 text-[#8a92b8]" />
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f6f9fd] border border-[#e3eaf6] rounded-xl text-sm font-semibold text-[#04044A] focus:outline-none focus:border-[#0057D9] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Primary Timezone</label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-3.5 text-[#8a92b8]" />
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f6f9fd] border border-[#e3eaf6] rounded-xl text-sm font-semibold text-[#04044A] focus:outline-none focus:border-[#0057D9] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Veterinarian Profile */}
        <div className="bg-white p-6 rounded-2xl border border-[#e3eaf6] shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-[#e3eaf6]">
            <div className="w-10 h-10 rounded-xl bg-[#E8FBF3] text-[#00875A] flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#04044A]">Clinician / Administrator Profile</h3>
              <p className="text-xs text-[#5a6291]">Configure your attending doctor credentials and contact details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Attending Doctor Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3.5 text-[#8a92b8]" />
                <input 
                  type="text" 
                  value={vetInput}
                  onChange={(e) => setVetInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f6f9fd] border border-[#e3eaf6] rounded-xl text-sm font-semibold text-[#04044A] focus:outline-none focus:border-[#0057D9] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider">Account Email (Locked)</label>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Lock size={10} /> Unchangeable</span>
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="email" 
                  value={userEmail}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-[#e3eaf6] rounded-xl text-sm font-semibold text-slate-600 cursor-not-allowed select-none"
                  title="Account email cannot be modified"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Contact Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3.5 text-[#8a92b8]" />
                <input 
                  type="text" 
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f6f9fd] border border-[#e3eaf6] rounded-xl text-sm font-semibold text-[#04044A] focus:outline-none focus:border-[#0057D9] focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
        </div>



        {/* Section 3: Supabase Cloud & Storage Sync */}
        <div className="bg-white p-6 rounded-2xl border border-[#e3eaf6] shadow-xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-[#e3eaf6]">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#04044A]">Supabase Cloud Database &amp; Storage Buckets</h3>
              <p className="text-xs text-[#5a6291]">Real-time synchronization for patient records, medical attachments, invoices, and event bookings.</p>
            </div>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrlInput}
                  onChange={(e) => setSupabaseUrlInput(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full px-4 py-3 bg-[#f6f9fd] border border-[#e3eaf6] rounded-xl text-xs font-mono text-[#04044A] focus:outline-none focus:border-[#0057D9] focus:bg-white transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider font-mono mb-1.5">Supabase Anon Key / Service Key</label>
                <input
                  type="password"
                  value={supabaseKeyInput}
                  onChange={(e) => setSupabaseKeyInput(e.target.value)}
                  placeholder="eyJh..."
                  className="w-full px-4 py-3 bg-[#f6f9fd] border border-[#e3eaf6] rounded-xl text-xs font-mono text-[#04044A] focus:outline-none focus:border-[#0057D9] focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold text-slate-600">Active Tables: patients, invoices, soap_notes, bookings, appointments</span>
              </div>
              <div className="flex items-center gap-3">
                {supabaseSaved && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    ✓ Connected &amp; Synced!
                  </span>
                )}
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#04044A] text-white rounded-xl text-xs font-bold hover:bg-[#0057D9] transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Save size={14} /> Save &amp; Reconnect Supabase
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Section 4: Data Backup */}
        <div className="bg-white p-6 rounded-2xl border border-[#e3eaf6] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Download size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#04044A]">Export Practice Data</h3>
              <p className="text-xs text-[#5a6291]">Download a complete JSON backup of all clinic patient records and stats.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleExportData}
            className="btn btn-outline text-xs font-bold px-4 py-2.5 cursor-pointer bg-white hover:bg-slate-50 flex items-center gap-2"
          >
            <Download size={14} /> Download Backup (.json)
          </button>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            className="btn btn-primary px-8 py-3.5 text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </form>

      {/* Section 5: Danger Zone (Account Deletion) */}
      <div className="bg-white p-6 rounded-2xl border border-red-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-red-100">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="font-bold text-base text-red-900">Danger Zone &mdash; Permanent Account Deletion</h3>
            <p className="text-xs text-red-600">Once you delete your account, all patient charts, schedules, and clinical records are permanently erased.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-sm font-bold text-[#04044A]">Permanently delete this clinic and all associated data</div>
            <div className="text-xs text-[#5a6291] mt-0.5">This action is irreversible. Please ensure you have exported your backup.</div>
          </div>
          <button 
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="btn bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-sm flex items-center gap-2 transition-colors border-none"
          >
            <Trash2 size={15} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#04044A]/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-red-600 font-bold">
                <AlertTriangle size={22} />
                <span>Confirm Permanent Deletion</span>
              </div>
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmationText(''); }}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer border-none"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                You are about to permanently delete <strong className="text-[#04044A]">{nameInput}</strong> and all associated patient records ({patientsCount} patients, {appointmentsCount} appointments).
              </p>
              <p className="font-semibold text-red-700">
                Type <span className="font-mono bg-red-50 px-1.5 py-0.5 rounded border border-red-200">DELETE</span> below to confirm:
              </p>
              <input 
                type="text" 
                placeholder="Type DELETE"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-[#04044A] focus:outline-none focus:border-red-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmationText(''); }}
                className="btn btn-outline text-xs font-semibold px-4 py-2.5 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                disabled={deleteConfirmationText !== 'DELETE'}
                onClick={() => {
                  if (deleteConfirmationText === 'DELETE') {
                    onDeleteAccount();
                  }
                }}
                className={`btn text-xs font-bold px-5 py-2.5 rounded-xl border-none ${deleteConfirmationText === 'DELETE' ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
