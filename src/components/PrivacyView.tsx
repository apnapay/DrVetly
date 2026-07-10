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
        footer { background: var(--navy); color: rgba(255,255,255,.7); padding: 60px 0 30px; margin-top: 100px; }
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
        <div className="wrap max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span>© {new Date().getFullYear()} DrVetly. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a onClick={() => onNavigate('privacy')} className="cursor-pointer hover:underline">Privacy Policy</a>
            <a onClick={() => onNavigate('terms')} className="cursor-pointer hover:underline">Terms of Service</a>
            <a onClick={() => onNavigate('contact')} className="cursor-pointer hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
