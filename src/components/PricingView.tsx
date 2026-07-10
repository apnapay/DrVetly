import React, { useState } from 'react';
import { Check, ArrowRight, Stethoscope } from 'lucide-react';

interface PricingViewProps {
  onNavigate: (view: 'homepage' | 'login' | 'signup' | 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages' | 'staff' | 'settings' | 'pricing' | 'contact' | 'beta' | 'privacy' | 'terms') => void;
  isAuthenticated?: boolean;
  currentPlan?: 'solo' | 'hyper' | 'custom';
  onSelectPlan?: (plan: 'solo' | 'hyper' | 'custom') => void;
}


export default function PricingView({ onNavigate, isAuthenticated = false, currentPlan = 'solo', onSelectPlan }: PricingViewProps) {
  const [annualBilling, setAnnualBilling] = useState(false);

  const getPrice = (monthly: number) => {
    if (annualBilling) {
      return Math.round(monthly * 0.8);
    }
    return monthly;
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
        .homepage-root .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 19px; color: var(--navy); }
        .homepage-root .nav-links { display: flex; align-items: center; gap: 36px; }
        .homepage-root .nav-links a {
          font-size: 14.5px; font-weight: 500; color: var(--ink-soft);
          text-decoration: none; transition: color .25s; cursor: pointer;
        }
        .homepage-root .nav-links a:hover { color: var(--navy); }
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
        .homepage-root .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; align-items: stretch; text-align: left; }
        .homepage-root .price-card {
          border: 1px solid var(--line); border-radius: var(--radius); padding: 36px 30px; background: #fff;
          display: flex; flex-direction: column;
          transition: transform .4s var(--ease), box-shadow .4s var(--ease);
        }
        .homepage-root .price-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
        .homepage-root .price-card.feat {
          background: var(--grad-hero); color: #fff; border: none; position: relative;
          box-shadow: 0 24px 50px -14px rgba(0,80,220,.45);
        }
        .homepage-root .price-card.feat .plan-name, .homepage-root .price-card.feat p, .homepage-root .price-card.feat li { color: rgba(255,255,255,.92); }
        .homepage-root .plan-badge {
          position: absolute; top: -13px; left: 30px; background: var(--neon); color: var(--navy); font-family: 'Space Grotesk', sans-serif;
          font-size: 11px; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; font-weight: 600; letter-spacing: .04em;
        }
        .homepage-root .plan-name { font-family: 'Space Grotesk', sans-serif; font-size: 15px; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-soft); margin-bottom: 14px; font-weight: 600; }
        .homepage-root .plan-price { font-size: 44px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .homepage-root .plan-price span { font-size: 15px; font-weight: 500; opacity: .65; }
        .homepage-root .plan-desc { font-size: 14px; color: var(--ink-soft); margin: 12px 0 26px; line-height: 1.5; }
        .homepage-root .price-card.feat .plan-desc { color: rgba(255,255,255,.8); }
        .homepage-root .plan-list { list-style: none; margin-bottom: 30px; flex: 1; padding: 0; }
        .homepage-root .plan-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; padding: 9px 0; border-top: 1px solid var(--line); color: var(--ink-soft); }
        .homepage-root .plan-list li:first-child { border-top: none; }
        .homepage-root .price-card.feat .plan-list li { border-color: rgba(255,255,255,.18); color: #fff; }
        .homepage-root .price-card.feat .plan-list svg { stroke: #fff; }
        .homepage-root footer { padding: 80px 0 40px; border-top: 1px solid var(--line); text-align: left; background: #fff; }
        .homepage-root .foot-grid { display: grid; grid-template-columns: 1.4fr repeat(3, 1fr); gap: 40px; margin-bottom: 60px; }
        .homepage-root .foot-brand p { margin-top: 16px; font-size: 14px; color: var(--ink-soft); max-width: 260px; line-height: 1.6; }
        .homepage-root .foot-col h5 { font-size: 12.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); margin-bottom: 18px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; }
        .homepage-root .foot-col a { display: block; font-size: 14.5px; color: var(--ink); margin-bottom: 12px; transition: color .2s; cursor: pointer; }
        .homepage-root .foot-col a:hover { color: var(--sky); }
        .homepage-root .foot-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 32px; border-top: 1px solid var(--line); font-size: 13px; color: var(--ink-soft); flex-wrap: wrap; gap: 16px; }
      `}} />

      {/* Navigation Bar */}
      <nav className="nav">
        <div className="wrap nav-inner">
          <div 
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'homepage')} 
            className="brand cursor-pointer group flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Stethoscope size={20} />
            </div>
            <span className="font-bold text-xl text-[#04044A] tracking-tight">DrVetly</span>
          </div>

          <div className="nav-links hidden md:flex">
            <a onClick={() => onNavigate('homepage')}>Features</a>
            <a onClick={() => onNavigate('pricing')} className="active">Pricing</a>
            <a onClick={() => onNavigate('beta')}>Beta Clinics</a>
            <a onClick={() => onNavigate('contact')}>Contact</a>
          </div>

          <div className="nav-cta">
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => onNavigate('login')}
                  className="text-sm font-semibold text-[#3c4372] hover:text-[#04044A] transition-colors px-3 py-2 cursor-pointer bg-transparent border-0"
                >
                  Log in
                </button>
                <button 
                  onClick={() => onNavigate('signup')}
                  className="btn btn-primary"
                >
                  Start free trial
                </button>
              </>
            ) : (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="btn btn-primary flex items-center gap-2"
              >
                Back to Dashboard <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Header Hero */}
      <section className="pt-36 pb-16 px-6 relative bg-[radial-gradient(circle_at_top_right,rgba(0,164,255,0.06),transparent_50%)]">
        <div className="wrap text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eef3fb] border border-[#dfe7f4] text-[#0057D9] text-xs font-mono font-bold uppercase tracking-wider">
            Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#04044A] tracking-tight leading-tight">
            Simple plans for independent &amp; growing veterinary practices.
          </h1>
          <p className="text-lg text-[#3c4372] max-w-2xl mx-auto leading-relaxed">
            No hidden setup fees, no surprise overage charges, and zero long-term contracts. Migrate your entire clinic in under an afternoon.
          </p>

          {/* Billing Toggle */}
          <div className="pt-4 flex items-center justify-center gap-4">
            <span className={`text-sm font-bold ${!annualBilling ? 'text-[#04044A]' : 'text-slate-500'}`}>Monthly billing</span>
            <button 
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-14 h-8 rounded-full bg-[#04044A] p-1 transition-colors relative cursor-pointer shadow-inner border-0"
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${annualBilling ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${annualBilling ? 'text-[#04044A]' : 'text-slate-500'}`}>Annual billing</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                Save 20%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="wrap pb-24">
        <div className="pricing-grid">
          
          {/* Solo Clinic */}
          <div className="price-card">
            <div className="plan-name">Solo Clinic</div>
            <div className="plan-price">${getPrice(57)}<span>/month</span></div>
            <div className="plan-desc">For single-vet practices getting off spreadsheets and paper charts.</div>
            <ul className="plan-list">
              <li><Check size={16} className="text-[#00A4FF]" />Dashboard &amp; scheduling</li>
              <li><Check size={16} className="text-[#00A4FF]" />Patient &amp; client records</li>
              <li><Check size={16} className="text-[#00A4FF]" />AI SOAP notes (50/mo)</li>
              <li><Check size={16} className="text-[#00A4FF]" />Automated email reminders</li>
              <li><Check size={16} className="text-[#00A4FF]" />Billing Management</li>
              <li><Check size={16} className="text-[#00A4FF]" />Email Support</li>
            </ul>
            {isAuthenticated ? (
              <button 
                onClick={() => onSelectPlan?.('solo')} 
                disabled={currentPlan === 'solo'}
                className={`btn ${currentPlan === 'solo' ? 'bg-slate-200 text-slate-500 cursor-default' : 'btn-primary'}`} 
                style={{ width: '100%' }}
              >
                {currentPlan === 'solo' ? 'Current plan' : 'Upgrade plan'}
              </button>
            ) : (
              <button onClick={() => onNavigate('signup')} className="btn btn-primary" style={{ width: '100%' }}>Start free trial</button>
            )}
          </div>

          {/* Hyper Clinic */}
          <div className="price-card feat">
            <span className="plan-badge">Most popular</span>
            <div className="plan-name">Hyper Clinic</div>
            <div className="plan-price">${getPrice(137)}<span>/month</span></div>
            <div className="plan-desc">For growing practices that need unlimited notes and sms messaging.</div>
            <ul className="plan-list">
              <li><Check size={16} className="text-white" />Everything in Basic</li>
              <li><Check size={16} className="text-white" />Unlimited AI SOAP notes</li>
              <li><Check size={16} className="text-white" />Automated sms &amp; email reminders</li>
              <li><Check size={16} className="text-white" />Dedicated clinic phone number</li>
              <li><Check size={16} className="text-white" />Staff Management</li>
              <li><Check size={16} className="text-white" />Dedicated 24/7 community support</li>
            </ul>
            {isAuthenticated ? (
              <button 
                onClick={() => onSelectPlan?.('hyper')} 
                disabled={currentPlan === 'hyper'}
                className={`btn ${currentPlan === 'hyper' ? 'bg-slate-200 text-slate-700 cursor-default' : 'btn-glow'}`} 
                style={{ width: '100%', background: currentPlan === 'hyper' ? '#e2e8f0' : '#fff', color: '#04044A' }}
              >
                {currentPlan === 'hyper' ? 'Current plan' : 'Upgrade plan'}
              </button>
            ) : (
              <button onClick={() => onNavigate('signup')} className="btn btn-glow" style={{ width: '100%', background: '#fff', color: '#04044A' }}>Start free trial</button>
            )}
          </div>

          {/* Custom */}
          <div className="price-card">
            <div className="plan-name">Custom</div>
            <div className="plan-price">Custom</div>
            <div className="plan-desc">For multi-location groups that need integrations and dedicated support.</div>
            <ul className="plan-list">
              <li><Check size={16} className="text-[#00A4FF]" />Everything in Pro</li>
              <li><Check size={16} className="text-[#00A4FF]" />PIMS integrations</li>
              <li><Check size={16} className="text-[#00A4FF]" />Multi-location support</li>
              <li><Check size={16} className="text-[#00A4FF]" />Dedicated founder support</li>
            </ul>
            {isAuthenticated ? (
              <button 
                onClick={() => onSelectPlan?.('custom')} 
                disabled={currentPlan === 'custom'}
                className={`btn ${currentPlan === 'custom' ? 'bg-slate-200 text-slate-500 cursor-default' : 'btn-primary'}`} 
                style={{ width: '100%', background: currentPlan === 'custom' ? '#e2e8f0' : 'var(--navy)' }}
              >
                {currentPlan === 'custom' ? 'Current plan (Custom plan)' : 'Upgrade plan'}
              </button>
            ) : (
              <button onClick={() => onNavigate('contact')} className="btn btn-primary" style={{ width: '100%', background: 'var(--navy)' }}>Talk to us</button>
            )}
          </div>

        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="wrap pb-32">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold text-[#04044A]">Compare plan features</h2>
          <p className="text-sm text-[#3c4372]">See exactly which features come with each tier.</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#dfe7f4] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#dfe7f4] bg-[#f6f9fd]">
                <th className="py-4 px-6 text-xs font-bold text-[#04044A] uppercase font-mono">Features</th>
                <th className="py-4 px-6 text-xs font-bold text-[#04044A] uppercase font-mono text-center">Solo Clinic ($57)</th>
                <th className="py-4 px-6 text-xs font-bold text-[#04044A] uppercase font-mono text-center bg-blue-50/50 text-[#0057D9]">Hyper Clinic ($137)</th>
                <th className="py-4 px-6 text-xs font-bold text-[#04044A] uppercase font-mono text-center">Custom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dfe7f4] text-sm text-[#3c4372]">
              <tr>
                <td className="py-4 px-6 font-semibold text-[#04044A]">Dashboard &amp; scheduling</td>
                <td className="py-4 px-6 text-center"><Check size={18} className="mx-auto text-emerald-600" /></td>
                <td className="py-4 px-6 text-center bg-blue-50/50"><Check size={18} className="mx-auto text-emerald-600" /></td>
                <td className="py-4 px-6 text-center"><Check size={18} className="mx-auto text-emerald-600" /></td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-[#04044A]">Patient &amp; client records</td>
                <td className="py-4 px-6 text-center"><Check size={18} className="mx-auto text-emerald-600" /></td>
                <td className="py-4 px-6 text-center bg-blue-50/50"><Check size={18} className="mx-auto text-emerald-600" /></td>
                <td className="py-4 px-6 text-center"><Check size={18} className="mx-auto text-emerald-600" /></td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-[#04044A]">AI SOAP notes</td>
                <td className="py-4 px-6 text-center font-mono text-xs font-bold text-[#04044A]">50 / mo</td>
                <td className="py-4 px-6 text-center font-mono text-xs font-bold text-[#0057D9] bg-blue-50/50">Unlimited</td>
                <td className="py-4 px-6 text-center font-mono text-xs font-bold text-purple-700">Unlimited</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-[#04044A]">Automated reminders</td>
                <td className="py-4 px-6 text-center text-xs text-slate-500">Email only</td>
                <td className="py-4 px-6 text-center text-xs font-bold text-[#0057D9] bg-blue-50/50">SMS &amp; Email</td>
                <td className="py-4 px-6 text-center text-xs font-bold text-purple-700">Advanced 2-Way</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-[#04044A]">Billing Management</td>
                <td className="py-4 px-6 text-center"><Check size={18} className="mx-auto text-emerald-600" /></td>
                <td className="py-4 px-6 text-center bg-blue-50/50"><Check size={18} className="mx-auto text-emerald-600" /></td>
                <td className="py-4 px-6 text-center"><Check size={18} className="mx-auto text-emerald-600" /></td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-[#04044A]">Dedicated clinic phone number</td>
                <td className="py-4 px-6 text-center text-slate-300">-</td>
                <td className="py-4 px-6 text-center bg-blue-50/50"><Check size={18} className="mx-auto text-emerald-600" /></td>
                <td className="py-4 px-6 text-center"><Check size={18} className="mx-auto text-emerald-600" /></td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-[#04044A]">Staff Management</td>
                <td className="py-4 px-6 text-center text-slate-300">-</td>
                <td className="py-4 px-6 text-center bg-blue-50/50"><Check size={18} className="mx-auto text-emerald-600" /></td>
                <td className="py-4 px-6 text-center"><Check size={18} className="mx-auto text-emerald-600" /></td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-semibold text-[#04044A]">PIMS integrations</td>
                <td className="py-4 px-6 text-center text-slate-300">-</td>
                <td className="py-4 px-6 text-center bg-blue-50/50 text-slate-300">-</td>
                <td className="py-4 px-6 text-center font-bold text-purple-700">Custom Built</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
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
