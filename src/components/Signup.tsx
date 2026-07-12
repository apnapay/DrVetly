import React, { useState } from 'react';
import { Mail, Lock, Shield, Eye, EyeOff, Building, Check, AlertCircle, Database, CheckCircle2, Stethoscope } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SignupProps {
  onNavigate: (view: 'homepage' | 'login' | 'signup' | 'dashboard' | 'pricing') => void;
  onSignupSuccess: (clinicName: string, vetName: string) => void;
}

export default function Signup({ onNavigate, onSignupSuccess }: SignupProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const fullVetName = `${firstName} ${lastName}`.trim() || 'Dr. Jamie Morales';
      const fullClinicName = clinicName.trim() || 'Riverbend Animal Hospital';

      // 1. Invoke signup-clinic Edge Function
      const { data, error } = await supabase.functions.invoke('signup-clinic', {
        body: {
          email,
          password,
          clinicName: fullClinicName,
          vetName: fullVetName,
        },
      });

      if (error) throw error;

      // 2. Sign in user immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      onSignupSuccess(fullClinicName, fullVetName);
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'Failed to create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-[#f6f9fd] selection:bg-[#00E1FF] selection:text-[#04044A] font-sans">
      
      {/* ============ LEFT FORM SIDE ============ */}
      <main className="flex items-center justify-center p-6 md:p-12 relative order-2 lg:order-1">
        <div className="absolute top-10 left-14 text-xs font-semibold text-[#3c4372] hidden sm:flex items-center gap-2.5">
          <button onClick={() => onNavigate('homepage')} className="flex items-center gap-3 font-bold text-lg text-[#04044A] bg-transparent border-none cursor-pointer group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md">
              <Stethoscope size={18} />
            </div>
            DrVetly
          </button>
        </div>

        <div className="absolute top-10 right-14 text-xs font-semibold text-[#3c4372] hidden sm:block">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-[#00A4FF] hover:underline font-bold bg-transparent border-none cursor-pointer">
            Log in
          </button>
        </div>

        <div className="w-full max-w-[420px] pt-10">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#00A4FF] font-semibold mb-3 block">7-day free trial</span>
          <h2 className="text-3xl font-bold tracking-tight text-[#04044A]">Set up your clinic</h2>
          <p className="text-[#3c4372] text-[13.8px] leading-relaxed mt-2.5 mb-6">Create your clinic workspace backed by secure Supabase Postgres.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Registration failed: </span>
                    {errorMsg}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#04044A] mb-1.5" htmlFor="fname">First name</label>
                <input 
                  type="text" 
                  id="fname" 
                  className="w-full px-4 py-3 border-1.5 border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/12 transition-all bg-white"
                  placeholder="Jamie"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#04044A] mb-1.5" htmlFor="lname">Last name</label>
                <input 
                  type="text" 
                  id="lname" 
                  className="w-full px-4 py-3 border-1.5 border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/12 transition-all bg-white"
                  placeholder="Morales"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#04044A] mb-1.5" htmlFor="clinic">Clinic name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3c4372]/55"><Building size={16} /></span>
                <input 
                  type="text" 
                  id="clinic" 
                  className="w-full pl-11 pr-4 py-3 border-1.5 border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/12 transition-all bg-white"
                  placeholder="Riverbend Animal Hospital"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#04044A] mb-1.5" htmlFor="email">Work email</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3c4372]/55"><Mail size={16} /></span>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full pl-11 pr-4 py-3 border-1.5 border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/12 transition-all bg-white"
                  placeholder="you@yourclinic.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-[#04044A] mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3c4372]/55"><Lock size={16} /></span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className="w-full pl-11 pr-11 py-3 border-1.5 border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#00A4FF] focus:ring-4 focus:ring-[#00A4FF]/12 transition-all bg-white"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3c4372]/55 hover:text-[#04044A] p-0.5 bg-transparent border-none cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0057D9] to-[#00A4FF] text-white font-bold text-sm shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Create Clinic Workspace'
              )}
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#dfe7f4]"></div>
              <span className="flex-shrink mx-4 text-xs text-[#8a92b8] font-medium">or continue with</span>
              <div className="flex-grow border-t border-[#dfe7f4]"></div>
            </div>

            <button 
              type="button"
              onClick={async () => {
                try {
                  const { error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/auth/callback`,
                      queryParams: { access_type: 'offline', prompt: 'consent' },
                    },
                  });
                  if (error) throw error;
                } catch (err: any) {
                  setErrorMsg(err.message || 'Google sign-up failed.');
                }
              }}
              className="w-full py-3 px-4 rounded-xl border border-[#dfe7f4] bg-white text-[#04044A] font-semibold text-sm hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xs"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.18 21.3 7.22 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.44 8.14 0 9.87 0 12s.44 3.86 1.2 5.4l4.08-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.18 2.7 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/>
              </svg>
              Continue with Google
            </button>
          </form>
        </div>
      </main>

      {/* ============ RIGHT VISUAL SIDE ============ */}
      <aside className="relative overflow-hidden bg-gradient-to-tr from-[#04044A] via-[#000675] to-[#0057D9] p-14 flex-col justify-between text-white hidden lg:flex order-1 lg:order-2">
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:52px_52px]"></div>
        <div className="relative z-10 max-w-md my-auto">
          <span className="font-mono text-xs uppercase tracking-wider text-[#00E1FF] font-semibold block mb-4">Enterprise Grade Security</span>
          <h2 className="text-4xl font-bold tracking-tight leading-[1.15]">Built for veterinary teams who demand precision.</h2>
          <p className="mt-4 text-white/80 text-sm leading-relaxed">
            Realtime syncing across front desk, examination rooms, and mobile devices with zero local latency.
          </p>
        </div>
      </aside>
    </div>
  );
}
