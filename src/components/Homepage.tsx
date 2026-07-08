import React, { useEffect, useState } from 'react';
import { ChevronRight, Menu, Check, FileText } from 'lucide-react';

interface HomepageProps {
  onNavigate: (view: 'homepage' | 'login' | 'signup' | 'dashboard') => void;
}

export default function Homepage({ onNavigate }: HomepageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [typewriteText, setTypewriteText] = useState('');

  const soapText = "S: Owner reports mild limping on left hind leg since Tuesday, no known trauma. O: Mild swelling at left stifle, full range of motion, no pain on hip palpation. A: Suspected mild stifle strain, hip involvement unlikely. P: Rest 10 days, NSAID course, recheck if no improvement.";

  useEffect(() => {
    // nav scroll state
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // scroll reveal
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { 
        if (e.isIntersecting) {
          e.target.classList.add('in'); 
        }
      });
    }, { threshold: 0.12 });
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // typewriter SOAP note
    let i = 0;
    let timer: NodeJS.Timeout;
    function type(){
      if(i <= soapText.length){
        setTypewriteText(soapText.slice(0, i));
        i++;
        timer = setTimeout(type, 18);
      } else {
        timer = setTimeout(()=>{ i = 0; type(); }, 3500);
      }
    }
    type();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      io.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="homepage-root relative min-h-screen bg-white text-[#04044A] overflow-x-hidden font-sans selection:bg-[#00E1FF] selection:text-[#04044A]">
      {/* Dynamic styles injected specifically for this professional 100% pixel matching layout */}
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

        .homepage-root .reveal {
          opacity: 0; 
          transform: translateY(24px); 
          transition: opacity .8s var(--ease), transform .8s var(--ease);
        }
        .homepage-root .reveal.in {
          opacity: 1; 
          transform: translateY(0);
        }

        .homepage-root .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 18px 0;
          transition: background .4s var(--ease), box-shadow .4s var(--ease), padding .4s var(--ease);
        }
        .homepage-root .nav.scrolled {
          background: rgba(255,255,255,.78);
          backdrop-filter: blur(16px) saturate(160%);
          -webkit-backdrop-filter: blur(16px) saturate(160%);
          box-shadow: 0 1px 0 var(--line), var(--shadow-sm);
          padding: 12px 0;
        }
        .homepage-root .nav-inner { display: flex; align-items: center; justify-content: space-between; }
        .homepage-root .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 19px; color: var(--navy); }
        .homepage-root .brand-mark {
          width: 30px; height: 30px; border-radius: 9px;
          background: var(--grad-hero);
          position: relative; flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(0,164,255,.35);
        }
        .homepage-root .brand-mark::after {
          content: ""; position: absolute; inset: 0; margin: auto;
          width: 12px; height: 2px; background: #fff;
          top: 50%; left: 50%; transform: translate(-50%,-50%);
        }
        .homepage-root .nav-links { display: flex; align-items: center; gap: 36px; }
        .homepage-root .nav-links a {
          font-size: 14.5px; font-weight: 500; color: var(--ink-soft);
          position: relative; padding: 4px 0;
          transition: color .25s;
        }
        .homepage-root .nav-links a::after {
          content: ""; position: absolute; left: 0; right: 0; bottom: -2px; height: 2px;
          background: linear-gradient(90deg, var(--sky), var(--neon));
          transform: scaleX(0); transform-origin: left; transition: transform .3s var(--ease);
        }
        .homepage-root .nav-links a:hover { color: var(--navy); }
        .homepage-root .nav-links a:hover::after { transform: scaleX(1); }
        .homepage-root .nav-cta { display: flex; align-items: center; gap: 18px; }

        .homepage-root .btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-weight: 600; font-size: 14.5px; padding: 12px 24px; border-radius: 100px;
          cursor: pointer; border: none; transition: transform .3s var(--ease), box-shadow .3s var(--ease), background .3s;
          white-space: nowrap;
        }
        .homepage-root .btn-primary {
          background: var(--navy); color: #fff;
          box-shadow: 0 1px 2px rgba(4,4,74,.2);
        }
        .homepage-root .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(4,4,74,.28); }
        .homepage-root .btn-ghost { color: var(--navy); font-size: 14.5px; font-weight: 600; cursor: pointer; }
        .homepage-root .btn-glow {
          background: var(--grad-cta); color: #fff;
          box-shadow: 0 8px 24px -6px rgba(0,120,255,.55);
          position: relative; overflow: hidden;
        }
        .homepage-root .btn-glow::before {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%);
          transform: translateX(-120%);
        }
        .homepage-root .btn-glow:hover::before { transform: translateX(120%); transition: transform .8s var(--ease); }
        .homepage-root .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 14px 32px -6px rgba(0,120,255,.65); }
        .homepage-root .btn-lg { padding: 16px 30px; font-size: 15.5px; }

        .homepage-root .hero {
          position: relative;
          padding: 180px 0 120px;
          background: var(--paper);
          overflow: hidden;
          isolation: isolate;
        }
        .homepage-root .hero-bg {
          position: absolute; inset: 0; z-index: -2;
          background:
            radial-gradient(60% 50% at 82% 8%, rgba(0,225,255,.16), transparent 60%),
            radial-gradient(45% 45% at 8% 18%, rgba(0,164,255,.14), transparent 60%),
            var(--paper);
        }
        .homepage-root .hero-grid-lines {
          position: absolute; inset: 0; z-index: -1; opacity: .5;
          background-image:
            linear-gradient(var(--line) 1px, transparent 1px),
            linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(60% 60% at 50% 20%, black, transparent 85%);
        }

        .homepage-root .hero-inner { position: relative; z-index: 1; }
        .homepage-root .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; letter-spacing: .06em; text-transform: uppercase;
          color: var(--sky); background: rgba(0,164,255,.08); border: 1px solid rgba(0,164,255,.25);
          padding: 7px 14px 7px 10px; border-radius: 100px; margin-bottom: 28px;
        }
        .homepage-root .eyebrow .dot {
          width: 7px; height: 7px; border-radius: 50%; background: var(--neon); 
          box-shadow: 0 0 0 3px rgba(0,225,255,.25); animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 3px rgba(0,225,255,.25); }
          50% { box-shadow: 0 0 0 6px rgba(0,225,255,.08); }
        }

        .homepage-root .hero h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(40px, 6vw, 78px);
          line-height: 1.02;
          font-weight: 600;
          color: var(--navy);
          max-width: 920px;
          letter-spacing: -0.02em;
        }
        .homepage-root .hero h1 .grad {
          background: var(--grad-hero);
          -webkit-background-clip: text; background-clip: text; color: transparent;
          background-size: 200% 100%;
          animation: grad-shift 8s ease-in-out infinite;
        }
        @keyframes grad-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .homepage-root .hero p.lede {
          margin-top: 26px; font-size: 19px; line-height: 1.6; color: var(--ink-soft);
          max-width: 560px; font-weight: 400;
        }
        .homepage-root .hero-ctas { display: flex; align-items: center; gap: 22px; margin-top: 40px; flex-wrap: wrap; }
        .homepage-root .hero-note { font-size: 13.5px; color: var(--ink-soft); display: flex; align-items: center; gap: 8px; }

        .homepage-root .vitals-rail {
          margin-top: 64px;
          position: relative;
          height: 64px;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
        }
        .homepage-root .vitals-rail svg { position: absolute; inset: 0; width: 200%; height: 100%; }
        .homepage-root .vitals-path {
          fill: none; stroke: url(#vitalsGradient); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
          animation: vitals-scroll 7s linear infinite;
        }
        @keyframes vitals-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .homepage-root .vitals-labels {
          display: flex; justify-content: space-between; margin-top: 10px;
          font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: var(--ink-soft); text-transform: uppercase; letter-spacing: .05em;
        }

        .homepage-root .hero-visual { margin-top: 80px; position: relative; }
        .homepage-root .device {
          position: relative;
          border-radius: 24px;
          background: var(--navy);
          background: var(--grad-hero);
          padding: 3px;
          box-shadow: var(--shadow-lg);
          transform: perspective(1400px) rotateX(3deg);
        }
        .homepage-root .device-inner {
          background: #fff; border-radius: 22px; overflow: hidden;
          display: grid; grid-template-columns: 220px 1fr;
          min-height: 420px;
        }
        .homepage-root .device-side {
          background: var(--panel); border-right: 1px solid var(--line);
          padding: 24px 18px; display: flex; flex-direction: column; gap: 6px;
        }
        .homepage-root .device-side .side-brand { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; font-weight: 700; font-size: 14px; color: var(--navy); }
        .homepage-root .side-brand .dotmark { width: 18px; height: 18px; border-radius: 6px; background: var(--grad-hero); }
        .homepage-root .side-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; font-size: 13.5px; color: var(--ink-soft); font-weight: 500;
        }
        .homepage-root .side-item.active { background: #fff; color: var(--navy); box-shadow: var(--shadow-sm); }
        .homepage-root .side-item .ic { width: 16px; height: 16px; border-radius: 4px; background: var(--line); flex-shrink: 0; }
        .homepage-root .side-item.active .ic { background: var(--sky); }

        .homepage-root .device-main { padding: 26px 30px; text-align: left; }
        .homepage-root .device-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
        .homepage-root .device-topbar h4 { font-family: 'Space Grotesk', sans-serif; font-size: 18px; color: var(--navy); font-weight: 600; }
        .homepage-root .device-topbar .badge-live {
          font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #00875A; background: #E8FBF3; border: 1px solid #BEF0DA;
          padding: 4px 10px; border-radius: 100px; display: flex; align-items: center; gap: 6px;
        }
        .homepage-root .badge-live .b-dot { width: 6px; height: 6px; border-radius: 50%; background: #00C875; }

        .homepage-root .kpi-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
        .homepage-root .kpi { background: var(--panel); border-radius: 14px; padding: 16px; }
        .homepage-root .kpi .k-label { font-size: 11.5px; color: var(--ink-soft); font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; }
        .homepage-root .kpi .k-val { font-size: 24px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; color: var(--navy); margin-top: 4px; }
        .homepage-root .kpi .k-delta { font-size: 12px; color: #00875A; margin-top: 2px; font-weight: 600; }

        .homepage-root .soap-card {
          border: 1px solid var(--line); border-radius: 14px; padding: 18px 20px; position: relative; overflow: hidden;
        }
        .homepage-root .soap-card::before {
          content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--grad-hero);
        }
        .homepage-root .soap-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .homepage-root .soap-head .tag { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--sky); text-transform: uppercase; letter-spacing: .05em; }
        .homepage-root .typewrite { font-size: 13.5px; color: var(--ink-soft); line-height: 1.65; font-family: 'IBM Plex Mono', monospace; }
        .homepage-root .typewrite .cursor { display: inline-block; width: 2px; height: 14px; background: var(--sky); margin-left: 2px; vertical-align: middle; animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        .homepage-root .float-chip {
          position: absolute; background: #fff; border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow-md);
          padding: 12px 16px; display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 600; color: var(--navy);
          animation: float 5s ease-in-out infinite;
        }
        .homepage-root .float-chip .fc-ic { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: var(--grad-hero); flex-shrink: 0; }
        .homepage-root .chip-1 { top: -24px; right: 36px; animation-delay: .2s; }
        .homepage-root .chip-2 { bottom: -20px; left: -16px; animation-delay: 1s; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .homepage-root .logos { padding: 52px 0; border-bottom: 1px solid var(--line); }
        .homepage-root .logos p { text-align: center; font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-soft); margin-bottom: 30px; }
        .homepage-root .logo-row { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 32px; opacity: .55; }
        .homepage-root .logo-row span { font-family: 'Space Grotesk', sans-serif; font-weight: 600; font-size: 19px; color: var(--ink-soft); letter-spacing: -.01em; }

        .homepage-root .section { padding: 120px 0; }
        .homepage-root .sec-head { max-width: 640px; margin-bottom: 64px; text-align: left; }
        .homepage-root .sec-eyebrow {
          font-family: 'IBM Plex Mono', monospace; font-size: 12.5px; text-transform: uppercase; letter-spacing: .08em; color: var(--sky); margin-bottom: 16px; display: block; font-weight: 500;
        }
        .homepage-root .sec-head h2 { font-family: 'Space Grotesk', sans-serif; font-size: clamp(30px, 4vw, 46px); font-weight: 600; color: var(--navy); line-height: 1.1; letter-spacing: -0.02em; }
        .homepage-root .sec-head p { margin-top: 18px; font-size: 17px; color: var(--ink-soft); line-height: 1.65; }

        .homepage-root .bento {
          display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; text-align: left;
        }
        .homepage-root .bcell {
          background: var(--panel); border: 1px solid var(--line); border-radius: var(--radius);
          padding: 32px; position: relative; overflow: hidden;
          transition: transform .4s var(--ease), box-shadow .4s var(--ease), border-color .4s;
        }
        .homepage-root .bcell:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: rgba(0,164,255,.35); }
        .homepage-root .bcell h3 { font-family: 'Space Grotesk', sans-serif; font-size: 21px; font-weight: 600; color: var(--navy); margin-bottom: 10px; letter-spacing: -0.01em; }
        .homepage-root .bcell p { font-size: 14.5px; color: var(--ink-soft); line-height: 1.6; }
        .homepage-root .b-icon {
          width: 44px; height: 44px; border-radius: 12px; background: var(--grad-hero);
          display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
          box-shadow: 0 6px 16px rgba(0,120,255,.28);
        }
        .homepage-root .b-span-4 { grid-column: span 4; }
        .homepage-root .b-span-2 { grid-column: span 2; }
        .homepage-root .b-span-3 { grid-column: span 3; }
        .homepage-root .b-span-6 { grid-column: span 6; }

        .homepage-root .bcell-dark {
          background: var(--grad-hero); border: none; color: #fff;
        }
        .homepage-root .bcell-dark h3 { color: #fff; }
        .homepage-root .bcell-dark p { color: rgba(255,255,255,.78); }
        .homepage-root .bcell-dark .b-icon { background: rgba(255,255,255,.15); box-shadow: none; }

        .homepage-root .mini-ekg { width: 100%; height: 64px; margin-top: 18px; }
        .homepage-root .mini-ekg path { fill: none; stroke: #fff; stroke-width: 2; opacity: .85; }

        .homepage-root .soap-demo { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; }
        .homepage-root .soap-demo-copy h3 { font-size: 24px; }
        .homepage-root .transcript-line { font-size: 13px; color: var(--ink-soft); margin-bottom: 8px; font-family: 'IBM Plex Mono', monospace; }
        .homepage-root .transcript-line b { color: var(--navy); }
        .homepage-root .arrow-flow { display: flex; align-items: center; justify-content: center; margin: 4px 0; }

        .homepage-root .bar-mini { display: flex; align-items: flex-end; gap: 6px; height: 60px; margin-top: 16px; }
        .homepage-root .bar-mini i { flex: 1; background: linear-gradient(180deg, var(--sky), var(--neon)); border-radius: 4px 4px 0 0; opacity: .85; }

        .homepage-root .stats-band {
          background: var(--navy);
          background: var(--grad-hero);
          border-radius: 28px;
          padding: 64px 48px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px;
          position: relative; overflow: hidden;
          text-align: left;
        }
        .homepage-root .stats-band::after {
          content: ""; position: absolute; inset: 0;
          background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(70% 100% at 50% 0%, black, transparent 90%);
        }
        .homepage-root .stat { position: relative; z-index: 1; color: #fff; }
        .homepage-root .stat .s-num { font-family: 'Space Grotesk', sans-serif; font-size: 44px; font-weight: 700; }
        .homepage-root .stat .s-label { font-size: 13.5px; color: rgba(255,255,255,.75); margin-top: 6px; }

        .homepage-root .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; text-align: left; }
        .homepage-root .step {
          border: 1px solid var(--line); border-radius: var(--radius); padding: 32px; position: relative;
          background: #fff;
        }
        .homepage-root .step .s-tag { font-family: 'IBM Plex Mono', monospace; color: var(--sky); font-size: 13px; margin-bottom: 20px; display: block; }
        .homepage-root .step h3 { font-family: 'Space Grotesk', sans-serif; font-size: 19px; color: var(--navy); margin-bottom: 10px; font-weight: 600; }
        .homepage-root .step p { font-size: 14.5px; color: var(--ink-soft); line-height: 1.6; }
        .homepage-root .step-connector { position: absolute; top: 32px; right: -24px; width: 24px; height: 1px; background: var(--line); }

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
          position: absolute; top: -13px; left: 30px; background: var(--neon); color: var(--navy); font-family: 'IBM Plex Mono', monospace;
          font-size: 11px; text-transform: uppercase; padding: 5px 12px; border-radius: 100px; font-weight: 600; letter-spacing: .04em;
        }
        .homepage-root .plan-name { font-family: 'Space Grotesk', sans-serif; font-size: 15px; text-transform: uppercase; letter-spacing: .04em; color: var(--ink-soft); margin-bottom: 14px; font-weight: 600; }
        .homepage-root .plan-price { font-size: 44px; font-weight: 700; font-family: 'Space Grotesk', sans-serif; }
        .homepage-root .plan-price span { font-size: 15px; font-weight: 500; opacity: .65; }
        .homepage-root .plan-desc { font-size: 14px; color: var(--ink-soft); margin: 12px 0 26px; line-height: 1.5; }
        .homepage-root .price-card.feat .plan-desc { color: rgba(255,255,255,.8); }
        .homepage-root .plan-list { list-style: none; margin-bottom: 30px; flex: 1; }
        .homepage-root .plan-list li { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; padding: 9px 0; border-top: 1px solid var(--line); color: var(--ink-soft); }
        .homepage-root .plan-list li:first-child { border-top: none; }
        .homepage-root .price-card.feat .plan-list li { border-color: rgba(255,255,255,.18); }
        .homepage-root .plan-list svg { flex-shrink: 0; margin-top: 2px; }

        .homepage-root .testi {
          background: var(--panel); border-radius: var(--radius); padding: 64px; text-align: left;
          display: grid; grid-template-columns: auto 1fr; gap: 36px; align-items: center;
        }
        .homepage-root .testi-avatar {
          width: 84px; height: 84px; border-radius: 20px; background: var(--grad-hero); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; color: #fff; font-family: 'Space Grotesk', sans-serif; font-weight: 700; font-size: 26px;
        }
        .homepage-root .testi blockquote { font-size: 24px; line-height: 1.5; color: var(--navy); font-weight: 500; font-family: 'Space Grotesk', sans-serif; }
        .homepage-root .testi cite { display: block; margin-top: 20px; font-style: normal; font-size: 14px; color: var(--ink-soft); }

        .homepage-root .final-cta {
          background: var(--grad-hero); border-radius: 32px; padding: 90px 60px; text-align: center; position: relative; overflow: hidden;
        }
        .homepage-root .final-cta::before {
          content: ""; position: absolute; width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(0,225,255,.35), transparent 70%);
          top: -260px; right: -160px; filter: blur(10px);
          animation: drift 10s ease-in-out infinite;
        }
        @keyframes drift {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(-30px,30px); }
        }
        .homepage-root .final-cta h2 { color: #fff; font-family: 'Space Grotesk', sans-serif; font-size: clamp(30px,4.5vw,50px); font-weight: 600; max-width: 640px; margin: 0 auto; position: relative; }
        .homepage-root .final-cta p { color: rgba(255,255,255,.8); margin: 20px auto 40px; max-width: 480px; font-size: 16.5px; position: relative; }
        .homepage-root .final-cta .hero-ctas { justify-content: center; position: relative; }
        .homepage-root .btn-white { background: #fff; color: var(--navy); }
        .homepage-root .btn-white:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,.2); }
        .homepage-root .btn-outline-white { border: 1.5px solid rgba(255,255,255,.5); color: #fff; background: transparent; }
        .homepage-root .btn-outline-white:hover { background: rgba(255,255,255,.12); transform: translateY(-2px); }

        .homepage-root footer { padding: 80px 0 40px; border-top: 1px solid var(--line); text-align: left; }
        .homepage-root .foot-grid { display: grid; grid-template-columns: 1.4fr repeat(3, 1fr); gap: 40px; margin-bottom: 60px; }
        .homepage-root .foot-brand p { margin-top: 16px; font-size: 14px; color: var(--ink-soft); max-width: 260px; line-height: 1.6; }
        .homepage-root .foot-col h5 { font-size: 12.5px; text-transform: uppercase; letter-spacing: .06em; color: var(--ink-soft); margin-bottom: 18px; font-family: 'IBM Plex Mono', monospace; font-weight: 600; }
        .homepage-root .foot-col a { display: block; font-size: 14.5px; color: var(--ink); margin-bottom: 12px; transition: color .2s; }
        .homepage-root .foot-col a:hover { color: var(--sky); }
        .homepage-root .foot-bottom { display: flex; justify-content: space-between; align-items: center; padding-top: 32px; border-top: 1px solid var(--line); font-size: 13px; color: var(--ink-soft); flex-wrap: wrap; gap: 16px; }

        @media (max-width:920px) {
          .homepage-root .nav-links { display: none; }
          .homepage-root .bento { grid-template-columns: repeat(2, 1fr); }
          .homepage-root .b-span-4, .homepage-root .b-span-3, .homepage-root .b-span-6 { grid-column: span 2; }
          .homepage-root .device-inner { grid-template-columns: 1fr; }
          .homepage-root .device-side { display: none; }
          .homepage-root .stats-band { grid-template-columns: repeat(2, 1fr); }
          .homepage-root .steps { grid-template-columns: 1fr; }
          .homepage-root .step-connector { display: none; }
          .homepage-root .pricing-grid { grid-template-columns: 1fr; }
          .homepage-root .testi { grid-template-columns: 1fr; padding: 40px; text-align: center; }
          .homepage-root .testi-avatar { margin: 0 auto; }
          .homepage-root .soap-demo { grid-template-columns: 1fr; }
          .homepage-root .foot-grid { grid-template-columns: 1fr 1fr; }
          .homepage-root .final-cta { padding: 60px 28px; }
        }

        @media (max-width: 640px) {
          .homepage-root .wrap { padding: 0 20px; }
          .homepage-root .nav-cta { gap: 10px; }
          .homepage-root .nav-cta .btn-ghost { font-size: 13px; }
          .homepage-root .nav-cta .btn { padding: 10px 16px; font-size: 13px; }
          .homepage-root .hero { padding: 140px 0 80px; }
          .homepage-root .hero h1 { font-size: 32px; line-height: 1.1; }
          .homepage-root .hero p.lede { font-size: 16px; margin-top: 18px; }
          .homepage-root .hero-ctas { gap: 12px; margin-top: 30px; }
          .homepage-root .btn-lg { padding: 14px 24px; font-size: 14px; }
          .homepage-root .vitals-labels { font-size: 10px; flex-direction: column; gap: 4px; align-items: center; text-align: center; }
          .homepage-root .device-inner { border-radius: 14px; }
          .homepage-root .device-main { padding: 16px 20px; }
          .homepage-root .kpi-row { grid-template-columns: 1fr; gap: 10px; }
          .homepage-root .bento { grid-template-columns: 1fr; }
          .homepage-root .b-span-4, .homepage-root .b-span-2, .homepage-root .b-span-3, .homepage-root .b-span-6 { grid-column: span 1; }
          .homepage-root .bcell { padding: 24px; }
          .homepage-root .stats-band { grid-template-columns: 1fr; padding: 40px 24px; gap: 24px; text-align: center; }
          .homepage-root .stat { text-align: center; }
          .homepage-root .stat .s-num { font-size: 36px; }
          .homepage-root .foot-grid { grid-template-columns: 1fr; gap: 30px; }
          .homepage-root .price-card { padding: 24px 20px; }
          .homepage-root .plan-price { font-size: 36px; }
          .homepage-root .testi { padding: 32px 20px; }
          .homepage-root .testi blockquote { font-size: 18px; }
        }
      ` }} />

      {/* ================= NAV ================= */}
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`} id="nav">
        <div className="wrap nav-inner">
          <a href="#" className="brand">
            <span className="brand-mark"></span>
            DrVetly
          </a>
          <div className="nav-links">
            <a href="#product">Product</a>
            <a href="#workflow">Workflow</a>
            <a href="#pricing">Pricing</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="nav-cta">
            <button onClick={() => onNavigate('login')} className="btn-ghost">Log in</button>
            <button onClick={() => onNavigate('signup')} className="btn btn-primary">Start free trial</button>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <header className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid-lines"></div>
        <div className="wrap hero-inner">
          <div className="reveal in">
            <span className="eyebrow"><span className="dot"></span>Now with AI SOAP notes for every exam room</span>
          </div>
          <h1 className="reveal in">The paperwork stops.<br />The <span className="grad">practice</span> keeps beating.</h1>
          <p className="lede reveal in">DrVetly listens to the exam room, writes the SOAP note, fills the schedule, and quiets the front desk — so your clinic runs on care again, not admin.</p>
          <div className="hero-ctas reveal in">
            <button onClick={() => onNavigate('signup')} className="btn btn-glow btn-lg">Start your 7-day free trial</button>
            <button onClick={() => onNavigate('login')} className="btn btn-lg" style={{ color: 'var(--navy)', fontWeight: 600 }}>Watch a 2-min walkthrough &nbsp;→</button>
          </div>
          <div className="hero-note reveal in" style={{ marginTop: '22px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00875A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            No credit card required · Cancel anytime · Live in under 10 minutes
          </div>

          {/* vitals signature rail */}
          <div className="vitals-rail reveal in">
            <svg viewBox="0 0 800 64" preserveAspectRatio="none">
              <defs>
                <linearGradient id="vitalsGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00A4FF"/>
                  <stop offset="100%" stopColor="#00E1FF"/>
                </linearGradient>
              </defs>
              <path className="vitals-path" d="M0,32 L120,32 L140,10 L160,54 L180,32 L260,32 L280,20 L300,44 L320,32 L400,32 L420,10 L440,54 L460,32 L540,32 L560,20 L580,44 L600,32 L680,32 L700,10 L720,54 L740,32 L800,32 L920,32 L940,10 L960,54 L980,32 L1060,32 L1080,20 L1100,44 L1120,32 L1200,32 L1220,10 L1240,54 L1260,32 L1340,32 L1360,20 L1380,44 L1400,32 L1480,32 L1500,10 L1520,54 L1540,32 L1600,32"/>
            </svg>
          </div>
          <div className="vitals-labels reveal in">
            <span>6.2 hrs saved / vet / week</span>
            <span>38% fewer no-shows</span>
            <span>100+ clinics live</span>
          </div>

          {/* product visual */}
          <div className="hero-visual reveal in">
            <div className="device">
              <div className="device-inner">
                <div className="device-side">
                  <div className="side-brand"><span className="dotmark"></span>DrVetly</div>
                  <div className="side-item active"><span className="ic"></span>Dashboard</div>
                  <div className="side-item"><span className="ic"></span>Patients</div>
                  <div className="side-item"><span className="ic"></span>Schedule</div>
                  <div className="side-item"><span className="ic"></span>SOAP notes</div>
                  <div className="side-item"><span className="ic"></span>Billing</div>
                </div>
                <div className="device-main">
                  <div className="device-topbar">
                    <h4>Today — Riverbend Animal Hospital</h4>
                    <span className="badge-live"><span className="b-dot"></span>Live</span>
                  </div>
                  <div className="kpi-row">
                    <div className="kpi"><div className="k-label">Appointments</div><div className="k-val">24</div><div className="k-delta">▲ 3 vs last Tue</div></div>
                    <div className="kpi"><div className="k-label">No-show rate</div><div className="k-val">4.1%</div><div className="k-delta">▼ 41% since AI reminders</div></div>
                    <div className="kpi"><div className="k-label">Notes pending</div><div className="k-val">0</div><div className="k-delta">▲ 100% auto-drafted</div></div>
                  </div>
                  <div className="soap-card">
                    <div className="soap-head">
                      <span className="tag">AI SOAP — Bella, Golden Retriever, 4y</span>
                      <span className="tag" style={{ color: 'var(--ink-soft)' }}>Drafted in 6s</span>
                    </div>
                    <div className="typewrite" id="typewrite">
                      {typewriteText}
                      <span className="cursor"></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="float-chip chip-1">
              <span className="fc-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round"/></svg>
              </span>
              Note auto-synced to chart
            </div>
            <div className="float-chip chip-2">
              <span className="fc-ic">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
              Reminder sent to owner
            </div>
          </div>
        </div>
      </header>

      {/* ================= LOGOS ================= */}
      <section className="logos">
        <div className="wrap">
          <p>Trusted by independent clinics across the country</p>
          <div className="logo-row">
            <span>Riverbend Animal Hospital</span>
            <span>Willow Creek Vet</span>
            <span>Northgate Pet Clinic</span>
            <span>Maple &amp; Paw</span>
            <span>Bayview Veterinary</span>
          </div>
        </div>
      </section>

      {/* ================= BENTO FEATURES ================= */}
      <section className="section" id="product">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">Product</span>
            <h2>One clinic-wide system, built around the exam room.</h2>
            <p>Every module already knows what happened in the last visit — because it's the same system that scheduled it, recorded it, and billed for it.</p>
          </div>

          <div className="bento">
            <div className="bcell bcell-dark b-span-4 reveal">
              <div className="b-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <h3>AI SOAP notes, written while you're still in the room</h3>
              <p>DrVetly listens to the consultation and drafts Subjective, Objective, Assessment and Plan in seconds. You review, edit, approve — it syncs to the chart automatically.</p>
              <svg className="mini-ekg" viewBox="0 0 400 64" preserveAspectRatio="none"><path d="M0,40 L60,40 L72,20 L86,56 L98,40 L180,40 L192,10 L206,56 L218,40 L300,40 L312,24 L326,50 L338,40 L400,40"/></svg>
            </div>
            <div className="bcell b-span-2 reveal">
              <div className="b-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#fff" strokeWidth="1.8"/><path d="M3 10h18M8 2v4M16 2v4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </div>
              <h3>Drag-and-drop scheduling</h3>
              <p>See checked-in, in-progress and completed visits at a glance, with vets assigned automatically by availability.</p>
            </div>

            <div className="bcell b-span-2 reveal">
              <div className="b-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round"/></svg>
              </div>
              <h3>Reminders that actually land</h3>
              <p>Automated, branded reminders and follow-ups cut no-shows by 30–50% without a receptionist lifting a finger.</p>
              <div className="bar-mini">
                <i style={{ height: '40%' }}></i>
                <i style={{ height: '65%' }}></i>
                <i style={{ height: '30%' }}></i>
                <i style={{ height: '80%' }}></i>
                <i style={{ height: '50%' }}></i>
                <i style={{ height: '90%' }}></i>
                <i style={{ height: '35%' }}></i>
              </div>
            </div>
            <div className="bcell b-span-4 reveal">
              <div className="b-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>One record per patient, one login per household</h3>
              <p>Multi-pet families, full medical history, microchip and weight tracking — searchable in under a second, visible to every role that needs it.</p>
            </div>

            <div className="bcell b-span-6 reveal">
              <div className="soap-demo">
                <div className="soap-demo-copy">
                  <span className="sec-eyebrow" style={{ marginBottom: '12px' }}>From transcript to chart</span>
                  <h3>The exam room talks. DrVetly writes.</h3>
                  <p style={{ marginTop: '12px', fontSize: '14.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>No dictation apps, no typing after hours. The consultation becomes a structured, editable note before the owner reaches the front desk.</p>
                </div>
                <div>
                  <div className="transcript-line"><b>Owner:</b> "She's been limping on her back left leg since Tuesday."</div>
                  <div className="transcript-line"><b>Vet:</b> "Mild swelling at the stifle, no pain on palpation of the hip."</div>
                  <div className="arrow-flow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M19 12l-7 7-7-7" stroke="#00A4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div className="soap-card" style={{ border: '1px solid var(--line)' }}>
                    <div className="soap-head"><span className="tag">Assessment</span></div>
                    <p style={{ fontSize: '13.5px', color: 'var(--ink-soft)', lineHeight: 1.6 }}>Suspected mild left stifle strain. No signs of hip involvement. Recommend rest, NSAID course, recheck in 10 days.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS BAND ================= */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="stats-band reveal">
            <div className="stat"><div className="s-num">6.2<span style={{ fontSize: '22px' }}>hrs</span></div><div className="s-label">Saved per vet, per week</div></div>
            <div className="stat"><div className="s-num">5<span style={{ fontSize: '22px' }}>min</span></div><div className="s-label">Saved per appointment on notes</div></div>
            <div className="stat"><div className="s-num">38%</div><div className="s-label">Average drop in no-shows</div></div>
            <div className="stat"><div className="s-num">100+</div><div className="s-label">Clinics already live on DrVetly</div></div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="section" id="workflow">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">Workflow</span>
            <h2>Live in one afternoon, not one quarter.</h2>
            <p>Legacy PIMS take months to roll out. DrVetly is cloud-native from day one, so your team is scheduling real appointments before end of day.</p>
          </div>
          <div className="steps">
            <div className="step reveal">
              <span className="s-tag mono">Day 1</span>
              <h3>Import your patients and clients</h3>
              <p>Bring over existing records in one pass — households, medical history, and multi-pet profiles included.</p>
              <div className="step-connector"></div>
            </div>
            <div className="step reveal">
              <span className="s-tag mono">Day 1</span>
              <h3>Connect your calendar and roles</h3>
              <p>Invite your vets and front desk with role-based access, so everyone sees exactly what they need to.</p>
              <div className="step-connector"></div>
            </div>
            <div className="step reveal">
              <span className="s-tag mono">Day 1</span>
              <h3>Turn on AI notes and reminders</h3>
              <p>Start drafting SOAP notes from your very next consultation, and let reminders start filling gaps in the schedule.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section className="section" id="pricing">
        <div className="wrap">
          <div className="sec-head reveal">
            <span className="sec-eyebrow">Pricing</span>
            <h2>Enterprise-grade software, independent-clinic pricing.</h2>
            <p>No setup fees, no long-term contracts. Start with a 7-day free trial on any plan.</p>
          </div>
          <div className="pricing-grid">
            <div className="price-card reveal">
              <div className="plan-name">Basic</div>
              <div className="plan-price">$67<span>/month</span></div>
              <div className="plan-desc">For single-vet practices getting off spreadsheets and paper charts.</div>
              <ul className="plan-list">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00A4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Dashboard &amp; scheduling</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00A4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Patient &amp; client records</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00A4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>AI SOAP notes (50/mo)</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00A4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Automated email reminders</li>
              </ul>
              <button onClick={() => onNavigate('signup')} className="btn btn-primary" style={{ width: '100%' }}>Start free trial</button>
            </div>
            <div className="price-card feat reveal">
              <span className="plan-badge">Most popular</span>
              <div className="plan-name">Pro</div>
              <div className="plan-price">$199<span>/month</span></div>
              <div className="plan-desc">For growing practices that need unlimited notes and two-way messaging.</div>
              <ul className="plan-list">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Everything in Basic</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Unlimited AI SOAP notes</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Two-way SMS with owners</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Dedicated clinic phone number</li>
              </ul>
              <button onClick={() => onNavigate('signup')} className="btn btn-white" style={{ width: '100%' }}>Start free trial</button>
            </div>
            <div className="price-card reveal">
              <div className="plan-name">Enterprise</div>
              <div className="plan-price">Custom</div>
              <div className="plan-desc">For multi-location groups that need integrations and dedicated support.</div>
              <ul className="plan-list">
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00A4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Everything in Pro</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00A4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>PIMS integrations</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00A4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Multi-location support</li>
                <li><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#00A4FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Dedicated founder support</li>
              </ul>
              <button onClick={() => onNavigate('signup')} className="btn btn-primary" style={{ width: '100%', background: 'var(--navy)' }}>Talk to us</button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL ================= */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="testi reveal">
            <div className="testi-avatar">JM</div>
            <div>
              <blockquote>"I used to stay two hours after close finishing notes. Now I sign off on drafts DrVetly already wrote, and I'm home for dinner."</blockquote>
              <cite>Dr. Jamie Morales, DVM — Riverbend Animal Hospital</cite>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="section" id="faq">
        <div className="wrap">
          <div className="final-cta reveal">
            <h2>Give your team back its evenings.</h2>
            <p>Join 100+ independent clinics already running on DrVetly. Free for 7 days, no card required.</p>
            <div className="hero-ctas">
              <button onClick={() => onNavigate('signup')} className="btn btn-white btn-lg">Start your free trial</button>
              <button onClick={() => onNavigate('signup')} className="btn btn-outline-white btn-lg">Book a demo</button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer>
        <div className="wrap">
          <div className="foot-grid">
            <div className="foot-brand">
              <a href="#" className="brand"><span className="brand-mark"></span>DrVetly</a>
              <p>The operating system for the modern veterinary clinic. Built for the exam room, not the back office.</p>
            </div>
            <div className="foot-col">
              <h5>Product</h5>
              <a href="#">Dashboard</a>
              <a href="#">AI SOAP notes</a>
              <a href="#">Scheduling</a>
              <a href="#">Pricing</a>
            </div>
            <div className="foot-col">
              <h5>Company</h5>
              <a href="#">About</a>
              <a href="#">Beta clinics</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
            <div className="foot-col">
              <h5>Resources</h5>
              <a href="#">Help center</a>
              <a href="#">Security</a>
              <a href="#">Status</a>
              <a href="#">Privacy</a>
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
