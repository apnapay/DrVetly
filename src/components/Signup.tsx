import React, { useState } from 'react';
import { Mail, Lock, Shield, Eye, EyeOff, Building, Check, AlertCircle, Database, CheckCircle2, Stethoscope } from 'lucide-react';
import { authService, isSupabaseConfigured, forceLocalMode } from '../supabaseClient';

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
  const [agreed, setAgreed] = useState(false);

  // Loading and Error States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password strength logic
  const checkStrength = (val: string) => {
    if (!val) return { score: 0, label: 'Use 8+ characters with a number and symbol', color: '#dfe7f4' };
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const colors = ['#FF5A5F', '#FFA83E', '#00A4FF', '#00C875'];
    const labels = [
      'Weak — add more characters',
      'Fair — add a number',
      'Good — add a symbol',
      'Strong password'
    ];

    return {
      score,
      label: labels[Math.max(score - 1, 0)],
      color: colors[Math.max(score - 1, 0)]
    };
  };

  const strength = checkStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const fullVetName = `${firstName} ${lastName}`.trim() || 'Dr. Jamie Morales';
      const fullClinicName = clinicName.trim() || 'Riverbend Animal Hospital';
      const session = await authService.signUp(email, password, fullClinicName, fullVetName);
      onSignupSuccess(session.clinicName, session.vetName);
    } catch (err: any) {
      console.error('Signup error:', err);
      setErrorMsg(err.message || 'Failed to create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const session = await authService.signInWithGoogle();
      onSignupSuccess(session.clinicName, session.vetName);
    } catch (err: any) {
      console.error('Google signup error:', err);
      setErrorMsg(err.message || 'Google authentication failed.');
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
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#00A4FF] font-semibold mb-3 block fade-in">7-day free trial</span>
          <h2 className="text-3xl font-bold tracking-tight text-[#04044A] fade-in d1">Set up your clinic</h2>
          <p className="text-[#3c4372] text-[13.8px] leading-relaxed mt-2.5 mb-6 fade-in d1">No credit card required. You'll be scheduling appointments in under 10 minutes.</p>

          {/* Google SSO Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 fade-in d3">
            {errorMsg && (
              <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Registration failed: </span>
                    {errorMsg.replace('FAILED_TO_FETCH: ', '')}
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
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#3c4372]/55 hover:text-[#04044A] p-0.5 bg-transparent border-none cursor-pointer">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="mt-3.5 space-y-1.5 animate-fade-in">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((num) => (
                      <div 
                        key={num} 
                        className="h-1 flex-1 rounded-full transition-colors duration-300"
                        style={{ backgroundColor: num <= strength.score ? strength.color : '#dfe7f4' }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-semibold" style={{ color: strength.score > 0 ? strength.color : 'var(--ink-soft)' }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <label className="flex items-start gap-2.5 text-xs text-[#3c4372] py-2 leading-relaxed cursor-pointer select-none">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-[#dfe7f4] accent-[#00A4FF] cursor-pointer mt-0.5"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                disabled={isLoading}
              />
              <span>
                I agree to DrVetly's{' '}
                <a href="#" className="text-[#00A4FF] hover:underline font-bold">Terms of Service</a> and{' '}
                <a href="#" className="text-[#00A4FF] hover:underline font-bold">Privacy Policy</a>
              </span>
            </label>

            <button 
              type="submit" 
              disabled={!agreed || isLoading} 
              className={`w-full py-4 text-white rounded-xl text-sm font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-2 ${
                agreed && !isLoading
                  ? 'bg-gradient-to-r from-[#04044A] via-[#000675] to-[#0057D9] hover:shadow-[0_14px_30px_-6px_rgba(0,120,255,0.55)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer' 
                  : 'bg-slate-400 cursor-not-allowed opacity-80'
              }`}
            >
              {isLoading ? 'Creating Clinic Workspace...' : 'Create my clinic account'}
            </button>
          </form>

          <p className="text-center text-[13.8px] text-[#3c4372] mt-6 fade-in d4">
            Already on DrVetly?{' '}
            <button onClick={() => onNavigate('login')} className="text-[#00A4FF] hover:underline font-bold bg-transparent border-none cursor-pointer">
              Log in
            </button>
          </p>
        </div>
      </main>

      {/* ============ RIGHT VISUAL SIDE ============ */}
      <aside className="relative overflow-hidden bg-gradient-to-tr from-[#04044A] via-[#000675] to-[#0057D9] p-14 flex flex-col justify-between text-white order-1 lg:order-2">
        {/* grids */}
        <div className="absolute inset-0 opacity-30 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:52px_52px] [mask-image:radial-gradient(70%_60%_at_70%_20%,black,transparent_85%)]"></div>
        <div className="absolute w-[520px] h-[520px] rounded-full bg-gradient-radial from-[#00E1FF]/30 to-transparent top-[-220px] right-[-160px] blur-[10px] animate-drift"></div>

        <button onClick={() => onNavigate('homepage')} className="flex items-center gap-2.5 font-bold text-xl text-white relative z-10 self-start">
          <span className="brand-mark"></span>
          DrVetly
        </button>

        <div className="relative z-10 max-w-sm my-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-[1.2]">Everything your clinic needs, from day one.</h1>
          <ul className="mt-8 space-y-5 text-sm md:text-[14.5px]">
            <li className="flex items-start gap-3.5 leading-relaxed text-white/90">
              <span className="w-6 h-6 rounded-full bg-white/16 border border-white/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"><Check size={12} strokeWidth={2.5} /></span>
              AI SOAP notes drafted from every consultation
            </li>
            <li className="flex items-start gap-3.5 leading-relaxed text-white/90">
              <span className="w-6 h-6 rounded-full bg-white/16 border border-white/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"><Check size={12} strokeWidth={2.5} /></span>
              Scheduling that fills gaps automatically
            </li>
            <li className="flex items-start gap-3.5 leading-relaxed text-white/90">
              <span className="w-6 h-6 rounded-full bg-white/16 border border-white/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"><Check size={12} strokeWidth={2.5} /></span>
              Patient records your whole team can trust
            </li>
            <li className="flex items-start gap-3.5 leading-relaxed text-white/90">
              <span className="w-6 h-6 rounded-full bg-white/16 border border-white/30 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"><Check size={12} strokeWidth={2.5} /></span>
              Reminders that cut no-shows by up to 38%
            </li>
          </ul>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 pt-10 border-t border-white/18 text-white text-center">
          <div><div className="text-xl md:text-2xl font-bold font-display leading-none">100+</div><div className="text-[10px] text-white/70 uppercase tracking-wider mt-1.5">Clinics live</div></div>
          <div><div className="text-xl md:text-2xl font-bold font-display leading-none">6.2 hrs</div><div className="text-[10px] text-white/70 uppercase tracking-wider mt-1.5">Saved / vet / wk</div></div>
          <div><div className="text-xl md:text-2xl font-bold font-display leading-none">7 days</div><div className="text-[10px] text-white/70 uppercase tracking-wider mt-1.5">Free, no card</div></div>
        </div>
      </aside>
    </div>
  );
}
