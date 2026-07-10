import React from 'react';
import { Stethoscope, FileText, ArrowRight } from 'lucide-react';

interface TermsViewProps {
  onNavigate: (view: 'homepage' | 'login' | 'signup' | 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages' | 'staff' | 'settings' | 'pricing' | 'contact' | 'beta' | 'privacy' | 'terms') => void;
  isAuthenticated?: boolean;
}

export default function TermsView({ onNavigate, isAuthenticated = false }: TermsViewProps) {
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
              <FileText size={13} /> Legal Agreement
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#04044A]">Terms of Service</h1>
            <p className="text-xs text-[#3c4372]">Last updated: July 8, 2026</p>
          </div>

          <div className="prose prose-slate max-w-none text-[#3c4372] space-y-6 text-sm sm:text-base leading-relaxed">
            <h2 className="text-xl font-bold text-[#04044A] mt-6">1. Agreement to Terms</h2>
            <p>
              By accessing or using DrVetly, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a veterinary hospital or clinic, you represent that you have the authority to bind such entity.
            </p>

            <h2 className="text-xl font-bold text-[#04044A] mt-6">2. Veterinary Professional Disclaimer</h2>
            <p>
              DrVetly is an AI-assisted practice management and documentation tool designed to assist licensed veterinary professionals. AI-generated SOAP notes, dosage suggestions, and summaries must always be reviewed, verified, and approved by a licensed veterinarian before being added to formal patient medical records or acting as veterinary medical advice.
            </p>

            <h2 className="text-xl font-bold text-[#04044A] mt-6">3. Subscription &amp; Billing</h2>
            <p>
              Subscriptions are billed in advance on a monthly or annual basis. You may cancel your subscription at any time from your billing settings, and access will continue through the end of your current paid billing cycle.
            </p>

            <h2 className="text-xl font-bold text-[#04044A] mt-6">4. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, DrVetly shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the platform.
            </p>

            <h2 className="text-xl font-bold text-[#04044A] mt-6">5. Contact Information</h2>
            <p>
              Questions about the Terms of Service should be sent to legal@drvetly.com.
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
