import React, { useState } from 'react';
import { Mail, Lock, Shield, Eye, EyeOff, AlertCircle, Database, CheckCircle2, Stethoscope } from 'lucide-react';
import { authService, isSupabaseConfigured, forceLocalMode } from '../supabaseClient';

interface LoginProps {
  onNavigate: (view: 'homepage' | 'login' | 'signup' | 'dashboard' | 'pricing') => void;
  onLoginSuccess: (clinicName: string, vetName: string) => void;
}

export default function Login({ onNavigate, onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Auth interactive state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const session = await authService.signIn(email, password);
      onLoginSuccess(session.clinicName, session.vetName);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Failed to authenticate. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-[#f6f9fd] selection:bg-[#00E1FF] selection:text-[#04044A] font-sans">
      
      {/* ============ LEFT VISUAL SIDE ============ */}
      <aside className="relative overflow-hidden bg-gradient-to-tr from-[#04044A] via-[#000675] to-[#00E1FF] p-14 flex-col justify-between text-white hidden lg:flex">
        {/* background grids */}
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(70%_60%_at_30%_20%,black,transparent_85%)]"></div>
        <div className="absolute w-[520px] h-[520px] rounded-full bg-gradient-radial from-[#00E1FF]/30 to-transparent bottom-[-220px] left-[-160px] blur-[10px] animate-drift"></div>

        <button onClick={() => onNavigate('homepage')} className="flex items-center gap-3 font-bold text-xl text-white relative z-10 self-start bg-transparent border-none cursor-pointer group">
          <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Stethoscope size={20} />
          </div>
          DrVetly
        </button>

        <div className="relative z-10 max-w-md my-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] font-display">
            The paperwork stops.<br />The practice keeps beating.
          </h1>
          <p className="mt-4 text-white/80 text-sm leading-relaxed">
            Log in to pick up right where the exam room left off — schedule, chart, and note, all in one place.
          </p>

          {/* vitals animation inside login */}
          <div className="mt-11 w-full h-[52px] relative overflow-hidden">
            <svg className="absolute inset-0 w-full h-full stroke-current text-white/90 fill-none" viewBox="0 0 500 52" preserveAspectRatio="none">
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1000" strokeDashoffset="0" d="M0,26 L70,26 L82,8 L96,42 L108,26 L190,26 L202,14 L216,38 L228,26 L310,26 L322,8 L336,42 L348,26 L430,26 L442,14 L456,38 L468,26 L500,26"/>
            </svg>
          </div>
        </div>

        <div className="relative z-10 pt-10 border-t border-white/18">
          <p className="font-display text-[15.5px] font-medium leading-relaxed">
            "I'm home for dinner now. DrVetly already wrote the notes I used to stay two hours for."
          </p>
          <cite className="block mt-3 text-xs text-white/70 not-italic">Dr. Jamie Morales, DVM — Riverbend Animal Hospital</cite>
        </div>
      </aside>

      {/* ============ RIGHT FORM SIDE ============ */}
      <main className="flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-10 right-14 text-xs font-semibold text-[#3c4372] hidden sm:block">
          New to DrVetly?{' '}
          <button onClick={() => onNavigate('signup')} className="text-[#00A4FF] hover:underline font-bold bg-transparent border-none cursor-pointer">
            Create an account
          </button>
        </div>

        <div className="w-full max-w-[400px]">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#00A4FF] font-semibold mb-3.5 block fade-in">Welcome back</span>
          <h2 className="text-3xl font-bold tracking-tight text-[#04044A] fade-in d1">Log in to your clinic</h2>
          <p className="text-[#3c4372] text-[13.8px] leading-relaxed mt-2.5 mb-8 fade-in d1">Enter your details to get back to today's schedule.</p>

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4 fade-in d3">
            {errorMsg && (
              <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Authentication failed: </span>
                    {errorMsg.replace('FAILED_TO_FETCH: ', '')}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-bold text-[#04044A] mb-2" htmlFor="email">Work email</label>
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
              <label className="block text-[13px] font-bold text-[#04044A] mb-2" htmlFor="password">Password</label>
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

            <div className="flex items-center justify-between text-xs font-semibold py-1.5">
              <label className="flex items-center gap-2 text-[#3c4372] cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-[#dfe7f4] accent-[#00A4FF] cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                Remember me
              </label>
              <button type="button" onClick={() => alert('Check the local development .env variable declarations or connect with a different email.')} className="text-[#00A4FF] hover:underline bg-transparent border-none cursor-pointer">Forgot password?</button>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-slate-400 cursor-wait' 
                  : 'bg-gradient-to-r from-[#04044A] via-[#000675] to-[#0057D9] shadow-[0_10px_24px_-6px_rgba(0,120,255,0.45)] hover:shadow-[0_14px_30px_-6px_rgba(0,120,255,0.55)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer'
              }`}
            >
              {isLoading ? 'Verifying Session...' : 'Log in to DrVetly'}
            </button>

            <button 
              type="button"
              onClick={async () => {
                setIsLoading(true);
                try {
                  const session = await authService.signIn('vet@hotivet.com', 'password123');
                  onLoginSuccess(session.clinicName, session.vetName);
                } catch (err: any) {
                  setErrorMsg(err.message);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full py-3 bg-[#eef3fb] hover:bg-[#e2edf9] text-[#0057D9] rounded-xl text-xs font-bold transition-all border border-[#bfe6ff] cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Database size={13} /> Demo Quick Login (One-Click)
            </button>
          </form>

          <p className="text-center text-[13.8px] text-[#3c4372] mt-6 fade-in d4">
            Don't have an account?{' '}
            <button onClick={() => onNavigate('signup')} className="text-[#00A4FF] hover:underline font-bold bg-transparent border-none cursor-pointer">
              Start your free trial
            </button>
          </p>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#dfe7f4] text-[11px] font-medium text-[#3c4372]/65 fade-in d4">
            <span className="flex items-center gap-1.5"><Shield size={13} /> 256-bit encryption</span>
            <span className="flex items-center gap-1.5"><Shield size={13} /> HIPAA-minded cloud</span>
          </div>
        </div>
      </main>
    </div>
  );
}
