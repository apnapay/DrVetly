import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Stethoscope } from 'lucide-react';

interface AuthCallbackProps {
  onNavigate: (view: 'dashboard' | 'login' | 'signup') => void;
  onLoginSuccess: (clinicName: string, vetName: string) => void;
}

export default function AuthCallback({ onNavigate, onLoginSuccess }: AuthCallbackProps) {
  const [loadingState, setLoadingState] = useState('Authenticating with Google...');
  const [needClinicSetup, setNeedClinicSetup] = useState(false);
  const [clinicNameInput, setClinicNameInput] = useState('Riverbend Animal Hospital');
  const [firstNameInput, setFirstNameInput] = useState('');
  const [lastNameInput, setLastNameInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.user) {
          setTimeout(async () => {
            const { data: { session: retrySession } } = await supabase.auth.getSession();
            if (!retrySession?.user) {
              onNavigate('login');
            } else {
              processUser(retrySession.user);
            }
          }, 1500);
          return;
        }
        processUser(session.user);
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setErrorMsg(err.message || 'Authentication error.');
      }
    }

    async function processUser(user: any) {
      setSessionUser(user);
      setLoadingState('Checking clinic workspace...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, clinics(name)')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (userData) {
        const clinicName = (userData.clinics as any)?.name || 'Riverbend Animal Hospital';
        const vetName = `${userData.first_name} ${userData.last_name}`;
        onLoginSuccess(clinicName, vetName);
      } else {
        const email = user.email;
        const { data: inviteData } = await supabase
          .from('staff_invitations')
          .select('*')
          .eq('email', email)
          .eq('status', 'PENDING')
          .maybeSingle();

        if (inviteData) {
          const nameParts = (user.user_metadata?.full_name || email.split('@')[0]).split(' ');
          await supabase.from('users').insert({
            auth_id: user.id,
            email,
            first_name: nameParts[0] || 'Staff',
            last_name: nameParts.slice(1).join(' ') || 'Member',
            role: inviteData.role || 'VET',
            clinic_id: inviteData.clinic_id,
            active: true
          });
          await supabase.from('staff_invitations').update({ status: 'ACCEPTED' }).eq('id', inviteData.id);
          const { data: clinicData } = await supabase.from('clinics').select('name').eq('id', inviteData.clinic_id).maybeSingle();
          onLoginSuccess(clinicData?.name || 'Riverbend Animal Hospital', user.user_metadata?.full_name || 'Staff Member');
        } else {
          setLoadingState('');
          setNeedClinicSetup(true);
          const metaName = user.user_metadata?.full_name || '';
          if (metaName) {
            const parts = metaName.split(' ');
            setFirstNameInput(parts[0] || '');
            setLastNameInput(parts.slice(1).join(' ') || '');
          }
        }
      }
    }

    handleCallback();
  }, []);

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionUser) return;
    setLoadingState('Creating your clinic workspace...');
    setErrorMsg(null);
    try {
      const email = sessionUser.email;
      const vetName = `${firstNameInput || 'Dr.'} ${lastNameInput || 'Vet'}`.trim();
      
      const { data: clinicRes, error: clinicErr } = await supabase.from('clinics').insert({ name: clinicNameInput, plan: 'SOLO' }).select().single();
      if (clinicErr) throw clinicErr;

      const { error: userErr } = await supabase.from('users').insert({
        auth_id: sessionUser.id,
        email,
        first_name: firstNameInput || 'Dr.',
        last_name: lastNameInput || 'Vet',
        role: 'ADMIN',
        clinic_id: clinicRes.id,
        active: true
      });
      if (userErr) throw userErr;

      onLoginSuccess(clinicNameInput, vetName);
    } catch (err: any) {
      console.error('Setup error:', err);
      setErrorMsg(err.message || 'Failed to complete clinic setup.');
      setLoadingState('');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f8fd] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e3eaf6] p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md mx-auto mb-6">
          <Stethoscope size={24} />
        </div>

        {needClinicSetup ? (
          <div>
            <h2 className="text-2xl font-bold text-[#04044A] mb-2">Complete Your Clinic Profile</h2>
            <p className="text-sm text-[#3c4372] mb-6">You've successfully authenticated with Google. Please provide your clinic name to set up your workspace.</p>
            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs text-left">
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleCompleteSetup} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#04044A] mb-1">First Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 border border-[#dfe7f4] rounded-xl text-sm"
                  value={firstNameInput}
                  onChange={(e) => setFirstNameInput(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#04044A] mb-1">Last Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 border border-[#dfe7f4] rounded-xl text-sm"
                  value={lastNameInput}
                  onChange={(e) => setLastNameInput(e.target.value)}
                  required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#04044A] mb-1">Clinic Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 border border-[#dfe7f4] rounded-xl text-sm"
                  value={clinicNameInput}
                  onChange={(e) => setClinicNameInput(e.target.value)}
                  required 
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0057D9] to-[#00A4FF] text-white font-bold text-sm shadow-md cursor-pointer hover:opacity-95"
              >
                Launch Clinic Dashboard
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="w-8 h-8 border-3 border-[#00A4FF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-[#04044A] mb-2">Signing you in</h2>
            <p className="text-sm text-[#3c4372]">{loadingState}</p>
            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
