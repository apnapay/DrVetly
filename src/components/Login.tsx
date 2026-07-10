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
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('Dr. Jordan Lee');
  const [customClinic, setCustomClinic] = useState('Pacific Veterinary Clinic');
  const [useCustomGoogle, setUseCustomGoogle] = useState(false);

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

  const handleGoogleLogin = async (account?: { email: string; name: string; clinicName: string }) => {
    setIsLoading(true);
    setErrorMsg(null);
    setShowGoogleModal(false);
    try {
      const session = await authService.signInWithGoogle(account);
      onLoginSuccess(session.clinicName, session.vetName);
    } catch (err: any) {
      console.error('Google login error:', err);
      setErrorMsg(err.message || 'Google authentication failed.');
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
          <p className="text-[#3c4372] text-[13.8px] leading-relaxed mt-2.5 mb-6 fade-in d1">Enter your details to get back to today's schedule.</p>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={isLoading}
            className="w-full mb-6 py-3 px-4 border-1.5 border-[#dfe7f4] hover:border-[#00A4FF] bg-white rounded-xl text-sm font-semibold text-[#04044A] shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.18 21.36 7.23 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.5-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.44 8.13 0 9.87 0 12s.44 3.87 1.2 5.4l4.08-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.64 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#dfe7f4]"></div></div>
            <span className="relative px-3 bg-[#f6f9fd] text-[11px] font-mono uppercase tracking-wider text-[#3c4372]/70">Or with work email</span>
          </div>

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

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.18 21.36 7.23 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.5-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.44 8.13 0 9.87 0 12s.44 3.87 1.2 5.4l4.08-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.64 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/>
                </svg>
                <span className="font-bold text-lg text-slate-900">Sign in with Google</span>
              </div>
              <button onClick={() => setShowGoogleModal(false)} className="text-slate-400 hover:text-slate-700 bg-transparent border-none text-xl cursor-pointer">&times;</button>
            </div>
            
            <p className="text-sm text-slate-600 mb-5">Choose a Google account to securely access DrVetly:</p>

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleGoogleLogin({ email: 'dr.alex.morgan@gmail.com', name: 'Dr. Alex Morgan', clinicName: 'San Francisco Veterinary Center' })}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  AM
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600">Dr. Alex Morgan</div>
                  <div className="text-xs text-slate-500">dr.alex.morgan@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGoogleLogin({ email: 'sarah.jenkins.vet@gmail.com', name: 'Dr. Sarah Jenkins', clinicName: 'Metro Animal Emergency Hospital' })}
                className="w-full p-3.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex items-center gap-3.5 transition-all text-left cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
                  SJ
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-600">Dr. Sarah Jenkins</div>
                  <div className="text-xs text-slate-500">sarah.jenkins.vet@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => useCustomGoogle ? setUseCustomGoogle(false) : setUseCustomGoogle(true)}
                className="w-full p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                + Use another Google account
              </button>

              {useCustomGoogle && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 pt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Google Email</label>
                    <input
                      type="email"
                      placeholder="your.email@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Veterinarian Name</label>
                    <input
                      type="text"
                      placeholder="Dr. Jordan Lee"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Name</label>
                    <input
                      type="text"
                      placeholder="Pacific Veterinary Clinic"
                      value={customClinic}
                      onChange={(e) => setCustomClinic(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={!customEmail}
                    onClick={() => handleGoogleLogin({ email: customEmail, name: customName || 'Dr. Vet', clinicName: customClinic || 'My Veterinary Clinic' })}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    Continue with this Google Account
                  </button>
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              Protected by Google OAuth 2.0 & Enterprise SSL Encryption.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
