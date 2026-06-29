import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicNavbar from '../components/PublicNavbar';
import { useAuth } from '../context/AuthContext';
import {
  Wallet,
  PiggyBank,
  PieChart,
  Sparkles,
  Tags,
  BarChart3,
  Target,
  FileSpreadsheet,
  Layers,
  UserPlus,
  ListPlus,
  LineChart,
  ArrowRight,
  Mail,
  Lock,
  Globe,
  ChevronDown
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const SectionWrapper = ({ children, className = '' }) => (
  <motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-60px' }}
    variants={fadeUp}
    className={className}
  >
    {children}
  </motion.div>
);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">

      <div className="landing-card rounded-xl p-6 spreadsheet-grid shadow-md relative overflow-hidden">
        <div className="bg-brand-white/95 rounded-lg p-5 space-y-4 shadow-sm border border-brand-green-border relative z-10 glass-panel">
          <h3 className="text-xl font-bold text-finText mb-1">Welcome</h3>
          <p className="text-xs text-finMuted mb-6">Enter Your Details</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-finText uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-finMuted" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-finBackground border border-finBorder rounded-lg text-sm text-finText placeholder-finMuted focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-finText uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-finMuted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-finBackground border border-finBorder rounded-lg text-sm text-finText placeholder-finMuted focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-lg bg-finGreen hover:bg-finGreenHover text-white font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group neon-glow"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-[11px] text-finMuted">
              Don't have an account?{' '}
              <Link to="/register" className="text-finGreen font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const budgetingCards = [
    {
      icon: Wallet,
      title: 'Track your income and expenses',
      desc: 'Log every rupee or dollar in one place — no more guessing where it went.',
    },
    {
      icon: PieChart,
      title: 'Set monthly spending limits',
      desc: 'Define budgets by category so you know when to slow down before overspending.',
    },
    {
      icon: BarChart3,
      title: 'Understand where your money goes',
      desc: 'Visual breakdowns show patterns you might miss in a plain bank statement.',
    },
    {
      icon: PiggyBank,
      title: 'Build savings habits over time',
      desc: 'Small, consistent tracking leads to bigger savings — one month at a time.',
    },
  ];

  const features = [
    { icon: Sparkles, title: 'AI budgeting suggestions', desc: 'Smart tips based on your actual spending patterns.' },
    { icon: Tags, title: 'Expense categorization', desc: 'Auto-sort transactions into clear, readable groups.' },
    { icon: BarChart3, title: 'Visual spending charts', desc: 'Bar and pie charts that make trends obvious at a glance.' },
    { icon: Target, title: 'Goal tracking', desc: 'Set savings targets and watch your progress grow.' },
    { icon: FileSpreadsheet, title: 'Export reports', desc: 'Download clean summaries — spreadsheet-friendly format.' },
    { icon: Layers, title: 'Multi-account support', desc: 'Manage income streams and accounts from one dashboard.' },
  ];

  const steps = [
    { num: '1', icon: UserPlus, title: 'Create your account', desc: 'Sign up in under a minute — no credit card needed.' },
    { num: '2', icon: ListPlus, title: 'Add your income and expenses', desc: 'Enter transactions manually or import your regular spending.' },
    { num: '3', icon: LineChart, title: 'Get AI-powered insights', desc: 'FinServe analyzes your data and surfaces actionable reports.' },
  ];

  return (
    <div className="landing-page min-h-screen overflow-x-hidden">
      <PublicNavbar />

      {/* 3a. Hero */}
      <section className="pt-24 md:pt-28 pb-12 md:pb-20 bg-brand-white">
        <div className="landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-8 md:py-12">
            <SectionWrapper className="lg:pr-4">
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-green-dark bg-brand-green-light border border-brand-green-border px-3 py-1 rounded-full mb-5">
                Personal finance, simplified
              </span>
              <h1
                className="font-extrabold text-brand-text-dark leading-tight mb-5"
                style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)' }}
              >
                Take control of your finances — one budget at a time
              </h1>
              <p className="text-base md:text-lg text-brand-text-mid leading-relaxed mb-8 max-w-lg">
                FinServe helps you track spending, set smart budgets, and get AI-powered insights
                so you always know where your money stands.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/register"
                  className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center w-full sm:w-auto"
                >
                  Register
                </Link>
              </div>
            </SectionWrapper>

            <SectionWrapper>
              <LoginForm />
            </SectionWrapper>
          </div>
        </div>
      </section>

      {/* 3b. What is Budgeting? */}
      <section className="py-12 md:py-20 bg-brand-green-light">
        <div className="landing-container">
          <SectionWrapper className="mb-10 md:mb-14 max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-text-dark mb-4">
              What is budgeting?
            </h2>
            <p className="text-base text-brand-text-mid leading-relaxed">
              Budgeting is simply a plan for your money. Instead of wondering where it all went
              at the end of the month, you decide upfront how much goes to needs, wants, and savings.
              It is not about restriction — it is about awareness.
            </p>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {budgetingCards.map((card, i) => (
              <SectionWrapper key={card.title}>
                <div
                  className="landing-card rounded-lg p-5 md:p-6 h-full border-l-4 border-l-brand-green-dark"
                  style={{ borderRadius: i % 2 === 0 ? '8px' : '12px' }}
                >
                  <card.icon className="h-7 w-7 text-brand-green-dark mb-3" strokeWidth={1.75} />
                  <h3 className="text-base font-semibold text-brand-text-dark mb-2">{card.title}</h3>
                  <p className="text-sm text-brand-text-mid leading-relaxed">{card.desc}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* 3c. Why FinServe? */}
      <section className="py-14 md:py-20 bg-brand-white">
        <div className="landing-container">
          <SectionWrapper className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-text-dark mb-3">
              Why FinServe?
            </h2>
            <p className="text-base text-brand-text-mid max-w-xl mx-auto">
              Built for people who want clarity without complexity — the tools you need, nothing you do not.
            </p>
          </SectionWrapper>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((feat, i) => (
              <SectionWrapper key={feat.title}>
                <div
                  className="landing-card p-6 h-full transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
                  style={{
                    borderRadius: i % 3 === 0 ? '8px' : i % 3 === 1 ? '12px' : '10px',
                    padding: i % 2 === 0 ? '1.5rem' : '1.75rem',
                  }}
                >
                  <div className="h-10 w-10 rounded-lg bg-brand-green-light flex items-center justify-center mb-4">
                    <feat.icon className="h-5 w-5 text-brand-green-dark" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-base font-semibold text-brand-text-dark mb-2">{feat.title}</h3>
                  <p className="text-sm text-brand-text-mid leading-relaxed">{feat.desc}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* 3d. How It Works */}
      <section className="py-12 md:py-20 bg-brand-green-light">
        <div className="landing-container">
          <SectionWrapper className="mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-text-dark mb-3">
              How it works
            </h2>
            <p className="text-base text-brand-text-mid">Three steps from signup to smarter spending.</p>
          </SectionWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-px bg-brand-green-border" />

            {steps.map((step) => (
              <SectionWrapper key={step.num}>
                <div className="relative flex flex-col items-start md:items-center text-left md:text-center">
                  <div className="flex items-center gap-3 md:flex-col md:gap-0 mb-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-green-dark text-brand-white font-bold text-sm z-10">
                      {step.num}
                    </span>
                    <step.icon className="h-6 w-6 text-brand-green-mid md:hidden" strokeWidth={1.75} />
                  </div>
                  <step.icon className="hidden md:block h-7 w-7 text-brand-green-mid mb-3" strokeWidth={1.75} />
                  <h3 className="text-lg font-semibold text-brand-text-dark mb-2">{step.title}</h3>
                  <p className="text-sm text-brand-text-mid leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              </SectionWrapper>
            ))}
          </div>
        </div>
      </section>

      {/* 3e. About */}
      <section id="about" className="py-14 md:py-20 bg-brand-text-dark/5">
        <div className="landing-container">
          <SectionWrapper className="max-w-3xl mx-auto text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-brand-text-dark mb-5">About FinServe</h2>
            <p className="text-base text-brand-text-mid leading-relaxed mb-4">
              FinServe started as a side project from developers who were tired of juggling spreadsheets
              and bank apps just to understand their own spending. We wanted something that felt as familiar
              as Excel but smarter — with charts, categories, and AI that actually helps.
            </p>
            <p className="text-base text-brand-text-mid leading-relaxed mb-4">
              Whether you are saving for a goal, cutting back on dining out, or just trying to see the
              full picture, FinServe gives you a calm, honest view of your money without the noise.
            </p>
            <p className="text-sm text-brand-text-light italic mt-6">
              Built with ❤️ for smart money management
            </p>
          </SectionWrapper>
        </div>
      </section>

      {/* 3f. Footer */}
      <footer className="bg-[#0b3d32] pt-[60px] pb-6 px-4 md:px-8">
        <div className="landing-container max-w-7xl mx-auto">

          {/* ZONE 1 - Main Footer Body */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-8 mb-12">

            {/* LEFT COLUMN (25% on desktop) */}
            <div className="w-full md:w-1/4 flex flex-col items-center md:items-start text-center md:text-left">
              {/* Logo & Brand */}
              <Link to="/" className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-md bg-white flex items-center justify-center font-bold text-[#0b3d32] text-sm">
                  FS
                </div>
                <span className="text-xl font-bold text-white tracking-tight">
                  FinServe
                </span>
              </Link>
              <p className="!text-white text-[12px] leading-relaxed mb-6 max-w-[250px]">
                Take control of your finances, one budget at a time.
              </p>


              {/* Language Selector */}
              <div className="flex flex-col items-center md:items-start">
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-wider mb-2" style={{ fontVariant: 'small-caps' }}>
                  Language
                </span>
                <button className="flex items-center gap-2 text-white/85 text-sm hover:text-white transition-colors">
                  <Globe className="h-4 w-4" />
                  <span>English</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </button>
              </div>
            </div>

            {/* RIGHT COLUMNS (75% on desktop) */}
            <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center sm:text-left">

              {/* Column 1 */}
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider">Quick Links</h4>
                <a href="#about" className="text-white/85 hover:text-white hover:underline text-[14px] transition-all">About</a>
                <a href="#" className="text-white/85 hover:text-white hover:underline text-[14px] transition-all">Careers</a>
                <Link to="/dashboard" className="text-white/85 hover:text-white hover:underline text-[14px] transition-all">Dashboard</Link>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col gap-4">
                <h4 className="text-white font-bold text-sm uppercase tracking-wider">Support</h4>
                <a href="#" className="text-white/85 hover:text-white hover:underline text-[14px] transition-all">Contact</a>
                <a href="#" className="text-white/85 hover:text-white hover:underline text-[14px] transition-all">Help Center</a>
              </div>


            </div>
          </div>

          {/* ZONE 2 - Divider */}
          <div className="h-px w-full bg-white/15 mb-4"></div>

          {/* ZONE 3 - Disclaimer */}
          <div className="py-4 text-center md:text-left">
            <p className="!text-white text-[12px] leading-relaxed">
              Disclaimer: FinServe is a technology-enabled personal finance platform. We do not provide certified financial advice. Please consult a licensed advisor for financial decisions.
            </p>
          </div>

          {/* ZONE 4 - Divider */}
          <div className="h-px w-full bg-white/15 mb-6"></div>

          {/* ZONE 5 - Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-white">
            <div className="text-center md:text-left">
              <p className="!text-white">© 2026 FinServe. All Rights Reserved.</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-white/70">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors">Use Policy</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Landing;
