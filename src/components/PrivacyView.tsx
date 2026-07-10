import React from 'react';
import { Stethoscope, Shield, ArrowRight } from 'lucide-react';

interface PrivacyViewProps {
  onNavigate: (view: 'homepage' | 'login' | 'signup' | 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages' | 'staff' | 'settings' | 'pricing' | 'contact' | 'beta' | 'privacy' | 'terms') => void;
  isAuthenticated?: boolean;
}

export default function PrivacyView({ onNavigate, isAuthenticated = false }: PrivacyViewProps) {
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
          --navy: #04044A;
          --grad-cta: linear-gradient(115deg, #00186B 0%, #0057D9 55%, #00C2FF 100%);
          --shadow-sm: 0 1px 2px rgba(4,4,74,.06), 0 1px 1px rgba(4,4,74,.04);
        }
        .homepage-root .wrap { max-width: 900px; margin: 0 auto; padding: 0 32px; width: 100%; box-sizing: border-box; }
        .homepage-root .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 0; background: rgba(255,255,255,.9);
          backdrop-filter: blur(16px); border-bottom: 1px solid var(--line);
        }
        .homepage-root .nav-inner { display: flex; align-items: center; justify-content: space-between; }
        .homepage-root .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 19px; color: var(--navy); text-decoration: none; cursor: pointer; }
        .homepage-root .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-weight: 600; font-size: 14.5px; padding: 10px 22px; border-radius: 100px; cursor: pointer; border: none; text-decoration: none;
        }
        .homepage-root .btn-primary { background: var(--navy); color: #fff; }
        .homepage-root .btn-glow { background: var(--grad-cta); color: #fff; }
        .homepage-root footer { padding: 80px 0 40px; border-top: 1px solid var(--line); text-align: left; background: #fff; }
        .homepage-root .foot-grid { display: grid; grid-template-columns: 1.4fr repeat(3, 1fr); gap: 40px; margin-bottom: 60px; }
        .homepage-root .foot-brand p { margin-top: 16px; font-size: 14px; color: var(--ink-soft); max-width: 260px; line-height: 1.6; }
        .homepage-root .foot-col h5 { font-size: 12.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); margin-bottom: 18px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; }
        .homepage-root .foot-col a { display: block; font-size: 14.5px; color: var(--ink); margin-bottom: 12px; transition: color .2s; cursor: pointer; }
        .homepage-root .foot-col a:hover { color: var(--sky); }
        .homepage-root .foot-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 32px; border-top: 1px solid var(--line); font-size: 13px; color: var(--ink-soft); flex-wrap: wrap; gap: 16px; }
      `}} />

      <nav className="nav">
        <div className="wrap max-w-[1200px] nav-inner">
          <a className="brand" onClick={() => onNavigate('homepage')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md">
              <Stethoscope size={20} />
            </div>
            <span>DrVetly</span>
          </a>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button onClick={() => onNavigate('dashboard')} className="btn btn-primary">
                Open Dashboard <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={() => onNavigate('signup')} className="btn btn-glow">Start free trial</button>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-40 pb-20">
        <div className="wrap space-y-8">
          <div className="space-y-3 pb-8 border-b border-[#dfe7f4]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#0057D9] text-xs font-bold uppercase tracking-wider">
              <Shield size={13} /> Legal &amp; Compliance
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#04044A]">Privacy Policy</h1>
            <p className="text-xs text-[#3c4372]">Last updated: July 8, 2026</p>
          </div>

          <div className="prose prose-slate max-w-none text-[#3c4372] space-y-6 text-sm sm:text-base leading-relaxed">
            <h2 className="text-xl font-bold text-[#04044A] mt-6">1. Introduction</h2>
            <p>
              At DrVetly ("we", "our", or "us"), we respect your privacy and are committed to protecting the confidential veterinary records, client information, and patient health data entrusted to us by veterinary practices and independent practitioners.
            </p>

            <h2 className="text-xl font-bold text-[#04044A] mt-6">2. Information We Collect</h2>
            <p>
              We collect information necessary to provide our practice management and AI SOAP note services:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Clinic Account Information:</strong> Clinic name, lead veterinarian name, email address, billing details, and staff credentials.</li>
              <li><strong>Patient &amp; Client Records:</strong> Pet names, species, weight, medical history, examination findings, and client contact numbers entered into the platform.</li>
              <li><strong>Audio &amp; Dictation Data:</strong> Voice recordings or dictated notes processed transiently to generate AI SOAP clinical summaries.</li>
            </ul>

            <h2 className="text-xl font-bold text-[#04044A] mt-6">3. Data Security &amp; Encryption</h2>
            <p>
              All data transmitted between your veterinary browser and our cloud storage / database infrastructure is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. We never sell, rent, or monetize veterinary patient data or practice analytics to third parties.
            </p>

            <h2 className="text-xl font-bold text-[#04044A] mt-6">4. Data Retention &amp; Deletion</h2>
            <p>
              You retain absolute ownership of all clinic records. You may export or permanently delete your clinic data at any time directly through your practice settings or by contacting our data protection officer at privacy@drvetly.com.
            </p>

            <h2 className="text-xl font-bold text-[#04044A] mt-6">5. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy or our security practices, please contact us at support@drvetly.com.
            </p>
          </div>
        </div>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a href="#" className="brand flex items-center gap-3 cursor-pointer group mb-3" onClick={(e) => { e.preventDefault(); onNavigate('homepage'); }}>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md">
                  <Stethoscope size={18} />
                </div>
                <span className="font-bold text-lg text-[#04044A] tracking-tight">DrVetly</span>
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
