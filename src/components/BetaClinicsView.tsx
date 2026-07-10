import React, { useState } from 'react';
import { Award, CheckCircle2, Stethoscope, ArrowRight, Sparkles, Users, Star, ShieldCheck } from 'lucide-react';

interface BetaClinicsViewProps {
  onNavigate: (view: 'homepage' | 'login' | 'signup' | 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages' | 'staff' | 'settings' | 'pricing' | 'contact' | 'beta' | 'privacy' | 'terms') => void;
  isAuthenticated?: boolean;
}

export default function BetaClinicsView({ onNavigate, isAuthenticated = false }: BetaClinicsViewProps) {
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [vetCount, setVetCount] = useState('1-3 veterinarians');

  const handleJoinBeta = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !clinicName) return;
    setJoined(true);
  };

  return (
    <div className="homepage-root relative min-h-screen bg-white text-[#04044A] overflow-x-hidden font-sans selection:bg-[#00E1FF] selection:text-[#04044A]">
      <style dangerouslySetInnerHTML={{ __html: `
        .homepage-root {
          --white: #ffffff;
          --paper: #f6f9fd;
          --panel: #eef3fb;
          --line: #dfe7f4;
          --ink: #04044A;
          --ink-soft: #3c4372;
          --royal: #000675;
          --navy: #04044A;
          --sky: #00A4FF;
          --neon: #00E1FF;
          --grad-hero: linear-gradient(120deg, #04044A 0%, #000675 32%, #0057D9 62%, #00A4FF 84%, #00E1FF 100%);
          --grad-cta: linear-gradient(115deg, #00186B 0%, #0057D9 55%, #00C2FF 100%);
          --shadow-sm: 0 1px 2px rgba(4,4,74,.06), 0 1px 1px rgba(4,4,74,.04);
          --shadow-md: 0 8px 24px rgba(4,4,74,.08), 0 2px 8px rgba(4,4,74,.05);
          --shadow-lg: 0 24px 60px -12px rgba(4,4,74,.22);
          --radius: 20px;
          --radius-sm: 12px;
          --ease: cubic-bezier(.16,.84,.28,1);
        }
        .homepage-root .wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          width: 100%;
          box-sizing: border-box;
        }
        .homepage-root .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 0;
          background: rgba(255,255,255,.9);
          backdrop-filter: blur(16px) saturate(160%);
          border-bottom: 1px solid var(--line);
          box-shadow: var(--shadow-sm);
        }
        .homepage-root .nav-inner { display: flex; align-items: center; justify-content: space-between; }
        .homepage-root .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 19px; color: var(--navy); text-decoration: none; cursor: pointer; }
        .homepage-root .nav-links { display: flex; align-items: center; gap: 36px; }
        .homepage-root .nav-links a {
          font-size: 14.5px; font-weight: 500; color: var(--ink-soft);
          text-decoration: none; transition: color .25s; cursor: pointer;
        }
        .homepage-root .nav-links a:hover, .homepage-root .nav-links a.active { color: var(--navy); font-weight: 600; }
        .homepage-root .nav-cta { display: flex; align-items: center; gap: 18px; }
        .homepage-root .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-weight: 600; font-size: 14.5px; padding: 12px 24px; border-radius: 100px;
          cursor: pointer; border: none; transition: transform .3s var(--ease), box-shadow .3s var(--ease), background .3s;
          white-space: nowrap; text-decoration: none;
        }
        .homepage-root .btn-primary {
          background: var(--navy); color: #fff;
          box-shadow: 0 1px 2px rgba(4,4,74,.2);
        }
        .homepage-root .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(4,4,74,.28); }
        .homepage-root .btn-glow {
          background: var(--grad-cta); color: #fff;
          box-shadow: 0 8px 24px -6px rgba(0,120,255,.55);
        }
        .homepage-root footer {
          background: var(--navy);
          color: rgba(255,255,255,.7);
          padding: 80px 0 40px;
        }
        .homepage-root .foot-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px;
          border-bottom: 1px solid rgba(255,255,255,.1); padding-bottom: 60px;
        }
        .homepage-root .foot-brand p { font-size: 14px; margin-top: 14px; line-height: 1.6; max-width: 300px; }
        .homepage-root .foot-col h5 { font-family: 'Space Grotesk', sans-serif; font-size: 14px; color: #fff; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 20px; }
        .homepage-root .foot-col a { display: block; font-size: 14px; color: rgba(255,255,255,.7); text-decoration: none; margin-bottom: 12px; transition: color .2s; cursor: pointer; }
        .homepage-root .foot-col a:hover { color: #fff; }
        .homepage-root .foot-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 30px; font-size: 13px; }
      `}} />

      {/* Navigation Bar */}
      <nav className="nav">
        <div className="wrap nav-inner">
          <a className="brand" onClick={() => onNavigate('homepage')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md">
              <Stethoscope size={20} />
            </div>
            <span>DrVetly</span>
          </a>
          <div className="nav-links hidden md:flex">
            <a onClick={() => onNavigate('homepage')}>Features</a>
            <a onClick={() => onNavigate('pricing')}>Pricing</a>
            <a className="active" onClick={() => onNavigate('beta')}>Beta Clinics</a>
            <a onClick={() => onNavigate('contact')}>Contact</a>
          </div>
          <div className="nav-cta">
            {isAuthenticated ? (
              <button onClick={() => onNavigate('dashboard')} className="btn btn-primary">
                Open Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <>
                <button onClick={() => onNavigate('login')} className="btn text-[#04044A] bg-transparent hover:bg-slate-100">Sign in</button>
                <button onClick={() => onNavigate('signup')} className="btn btn-glow">Start free trial</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <section className="pt-44 pb-20 bg-[linear-gradient(180deg,#f6f9fd_0%,#ffffff_100%)]">
        <div className="wrap text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} /> DrVetly Pioneer Beta Program
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#04044A] leading-[1.1]">
            Shape the Future of Veterinary AI Practice Management
          </h1>
          <p className="text-lg text-[#3c4372] max-w-2xl mx-auto leading-relaxed">
            Join 120+ innovative veterinary hospitals testing cutting-edge real-time AI SOAP notes, sub-doctor role permissions, and zero-latency appointment scheduling.
          </p>
        </div>
      </section>

      {/* Perks Grid */}
      <section className="py-16 bg-white">
        <div className="wrap">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#04044A]">Exclusive Beta Clinic Privileges</h2>
            <p className="text-sm text-[#3c4372] mt-2">Early access partners receive lifetime benefits and direct input into our product roadmap.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-[#f6f9fd] border border-[#dfe7f4] space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0057D9] flex items-center justify-center font-bold">
                <Star size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#04044A]">50% Lifetime Discount</h3>
              <p className="text-sm text-[#3c4372] leading-relaxed">
                Beta participants lock in 50% off Pro tier pricing forever, regardless of future feature expansions and multi-doctor capacity increases.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#f6f9fd] border border-[#dfe7f4] space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#04044A]">Direct Engineering Line</h3>
              <p className="text-sm text-[#3c4372] leading-relaxed">
                Get a dedicated Slack connect channel with our founding engineers and veterinary advisors to request custom integrations and report workflows.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-[#f6f9fd] border border-[#dfe7f4] space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#04044A]">Priority Data Migration</h3>
              <p className="text-sm text-[#3c4372] leading-relaxed">
                Our database specialists will manually migrate your legacy practice management software patient records and invoicing history at zero cost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Form Section */}
      <section className="py-20 bg-[#f6f9fd] border-y border-[#dfe7f4]">
        <div className="wrap max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#dfe7f4] shadow-md">
            {joined ? (
              <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-bold text-[#04044A]">Application Submitted!</h3>
                <p className="text-sm text-[#3c4372] max-w-md mx-auto">
                  Thank you for applying to the DrVetly Beta Program on behalf of <strong>{clinicName}</strong>. Our medical director will review your clinic profile and send credentials to <strong>{email}</strong> within 24 hours.
                </p>
                <button
                  onClick={() => { setJoined(false); setEmail(''); setClinicName(''); }}
                  className="btn btn-primary mt-4"
                >
                  Submit Another Clinic
                </button>
              </div>
            ) : (
              <form onSubmit={handleJoinBeta} className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0057D9] text-xs font-bold uppercase tracking-wider mb-2">
                    Cohort 4 — 28 Spots Remaining
                  </div>
                  <h2 className="text-2xl font-bold text-[#04044A]">Apply for Beta Access</h2>
                  <p className="text-xs text-[#3c4372] mt-1">Limited to licensed veterinary clinics and animal hospitals.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-1.5">Clinic / Hospital Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Oakridge Veterinary Medical Center"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f6f9fd] border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-1.5">Lead Veterinarian / Director Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="director@oakridgevet.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f6f9fd] border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-1.5">Practice Size (Veterinarians)</label>
                    <select
                      value={vetCount}
                      onChange={(e) => setVetCount(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f6f9fd] border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                    >
                      <option value="Solo (1 Veterinarian)">Solo (1 Veterinarian)</option>
                      <option value="1-3 veterinarians">Small Practice (1-3 Veterinarians)</option>
                      <option value="4-10 veterinarians">Medium Hospital (4-10 Veterinarians)</option>
                      <option value="10+ veterinarians">Large Hospital Group (10+ Veterinarians)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-glow w-full py-4 text-base font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Award size={18} /> Request Beta Clinic Status
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a className="brand flex items-center gap-3 cursor-pointer group mb-3" onClick={() => onNavigate('homepage')}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md">
                  <Stethoscope size={18} />
                </div>
                <span className="font-bold text-lg text-white tracking-tight">DrVetly</span>
              </a>
              <p>The operating system for the modern veterinary clinic. Built for the exam room, not the back office.</p>
            </div>
            <div className="foot-col">
              <h5>Product</h5>
              <a onClick={() => onNavigate('homepage')}>Dashboard</a>
              <a onClick={() => onNavigate('homepage')}>AI SOAP notes</a>
              <a onClick={() => onNavigate('homepage')}>Scheduling</a>
              <a onClick={() => onNavigate('pricing')}>Pricing</a>
            </div>
            <div className="foot-col">
              <h5>Company</h5>
              <a onClick={() => onNavigate('homepage')}>About</a>
              <a onClick={() => onNavigate('beta')}>Beta clinics</a>
              <a onClick={() => onNavigate('contact')}>Contact</a>
            </div>
            <div className="foot-col">
              <h5>Resources</h5>
              <a onClick={() => onNavigate('contact')}>Help center</a>
              <a onClick={() => onNavigate('privacy')}>Privacy</a>
              <a onClick={() => onNavigate('terms')}>Terms</a>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} DrVetly. All rights reserved.</span>
            <span>Made for independent veterinary clinics, everywhere.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
