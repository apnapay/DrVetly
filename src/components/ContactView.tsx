import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Stethoscope, MessageSquare, ArrowRight } from 'lucide-react';

interface ContactViewProps {
  onNavigate: (view: 'homepage' | 'login' | 'signup' | 'dashboard' | 'schedule' | 'patients' | 'soap-notes' | 'billing' | 'messages' | 'staff' | 'settings' | 'pricing' | 'contact' | 'beta' | 'privacy' | 'terms') => void;
  isAuthenticated?: boolean;
}

export default function ContactView({ onNavigate, isAuthenticated = false }: ContactViewProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    clinicName: '',
    phone: '',
    inquiryType: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
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
        .homepage-root .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 19px; color: var(--navy); text-decoration: none; }
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
        .homepage-root .hero {
          padding: 160px 0 80px;
          background: var(--paper);
          text-align: center;
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
          <a href="#" className="brand" onClick={(e) => { e.preventDefault(); onNavigate('homepage'); }}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#04044A] via-[#000675] to-[#0057D9] flex items-center justify-center text-white shadow-md">
              <Stethoscope size={20} />
            </div>
            <span>DrVetly</span>
          </a>
          <div className="nav-links hidden md:flex">
            <a onClick={() => onNavigate('homepage')}>Features</a>
            <a onClick={() => onNavigate('pricing')}>Pricing</a>
            <a onClick={() => onNavigate('beta')}>Beta Clinics</a>
            <a className="active" onClick={() => onNavigate('contact')}>Contact</a>
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
      <section className="hero">
        <div className="wrap max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/85 text-[#0057D9] text-xs font-bold uppercase tracking-wider">
            <MessageSquare size={13} /> 24/7 Veterinary Support
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-[#04044A]">
            Get in touch with our team
          </h1>
          <p className="text-base sm:text-lg text-[#3c4372] max-w-xl mx-auto">
            Have questions about AI SOAP note accuracy, clinic migration, multi-doctor permissions, or custom enterprise setups? We respond within 2 hours.
          </p>
        </div>
      </section>

      {/* Main Contact Grid */}
      <section className="py-20 bg-white">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Left Info Column */}
            <div className="space-y-8 lg:col-span-1">
              <div>
                <h3 className="text-xl font-bold text-[#04044A] mb-3">We’re here for your clinic</h3>
                <p className="text-sm text-[#3c4372] leading-relaxed">
                  Whether you're an independent solo practitioner or managing a 20-vet emergency hospital, our veterinary success team is ready to assist.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0057D9] flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#04044A]">Email Support &amp; Sales</h4>
                    <p className="text-xs text-[#3c4372] mt-0.5">support@drvetly.com</p>
                    <p className="text-xs text-[#3c4372]">sales@drvetly.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#04044A]">Direct Phone Line</h4>
                    <p className="text-xs text-[#3c4372] mt-0.5">+1 (800) 555-VETLY</p>
                    <p className="text-xs text-slate-400">Mon-Fri from 8am to 7pm EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#04044A]">Headquarters</h4>
                    <p className="text-xs text-[#3c4372] mt-0.5">450 Lexington Avenue, Suite 1400</p>
                    <p className="text-xs text-[#3c4372]">New York, NY 10017</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#f6f9fd] border border-[#dfe7f4] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#04044A] uppercase tracking-wider">
                  <Clock size={15} className="text-[#0057D9]" /> Average Response Time
                </div>
                <p className="text-xs text-[#3c4372]">
                  Our average support ticket resolution time is under <strong>35 minutes</strong> during business hours.
                </p>
              </div>
            </div>

            {/* Right Contact Form Card */}
            <div className="lg:col-span-2 bg-[#f6f9fd] border border-[#dfe7f4] rounded-3xl p-8 sm:p-10 shadow-xs relative">
              {submitted ? (
                <div className="py-16 text-center space-y-4 animate-in zoom-in-95 duration-300">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#04044A]">Message Received!</h3>
                  <p className="text-sm text-[#3c4372] max-w-md mx-auto">
                    Thank you, <strong>{formData.name}</strong>. A veterinary specialist from our team has received your message and will reach out to <strong>{formData.email}</strong> shortly.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', clinicName: '', phone: '', inquiryType: 'General Inquiry', message: '' }); }}
                    className="btn btn-primary mt-4"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#04044A] mb-1">Send us a message</h3>
                    <p className="text-xs text-[#3c4372]">Fill out the form below and we'll route your request to the right veterinary specialist.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Dr. Samantha Reed"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="samantha@pawsclinic.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Clinic Name</label>
                      <input
                        type="text"
                        placeholder="Oak Park Veterinary Hospital"
                        value={formData.clinicName}
                        onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1 (555) 019-2834"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-white border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Inquiry Type</label>
                    <select
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                    >
                      <option value="General Inquiry">General Inquiry &amp; Demo</option>
                      <option value="Migration">Clinic Data Migration Assistance</option>
                      <option value="Pricing">Custom Enterprise / Multi-Location Pricing</option>
                      <option value="Technical">Technical Support &amp; Integration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#04044A] uppercase tracking-wider mb-2">Message *</label>
                    <textarea
                      required
                      rows={5}
                      placeholder="Tell us about your clinic and how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-[#dfe7f4] rounded-xl text-sm text-[#04044A] focus:outline-none focus:border-[#0057D9]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-glow w-full py-4 text-base font-bold shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> Send Message to Veterinary Team
                  </button>
                </form>
              )}
            </div>

          </div>
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
