import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicNavbar from '../components/PublicNavbar';
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

const HeroChartPreview = () => (
  <div className="relative w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
    <div className="absolute -top-3 -right-2 rotate-3 bg-brand-green-dark text-brand-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
      Live preview
    </div>
    <div className="landing-card rounded-xl p-5 spreadsheet-grid shadow-md">
      <div className="bg-brand-white/90 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-brand-text-dark">Monthly Overview</span>
          <span className="text-xs text-brand-text-light">Jun 2025</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Income', value: '$4,200', color: 'text-brand-green-dark' },
            { label: 'Spent', value: '$2,840', color: 'text-brand-text-mid' },
            { label: 'Saved', value: '$1,360', color: 'text-brand-green-mid' },
          ].map((stat) => (
            <div key={stat.label} className="bg-brand-green-light rounded-lg py-2 px-1 border border-brand-green-border">
              <p className="text-[11px] text-brand-text-light">{stat.label}</p>
              <p className={`text-sm font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="flex items-end justify-between gap-1.5 h-24 px-1">
          {[40, 65, 45, 80, 55, 70, 50].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-brand-green-mid/80"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-brand-text-light px-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

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
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-brand-green-dark bg-brand-green-light border border-brand-green-border px-3 py-1 rounded-full mb-5 -rotate-1">
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
                  className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="btn-outline px-6 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center w-full sm:w-auto"
                >
                  Login
                </Link>
              </div>
            </SectionWrapper>

            <SectionWrapper>
              <HeroChartPreview />
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
      <footer className="py-8 md:py-10 bg-brand-white border-t border-brand-green-border">
        <div className="landing-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-brand-text-mid">
            <p className="font-medium text-brand-text-dark">FinServe © 2025</p>
            <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link to="/" className="hover:text-brand-green-dark transition-colors min-h-[44px] inline-flex items-center">
                Home
              </Link>
              <Link to="/login" className="hover:text-brand-green-dark transition-colors min-h-[44px] inline-flex items-center">
                Login
              </Link>
              <Link to="/register" className="hover:text-brand-green-dark transition-colors min-h-[44px] inline-flex items-center">
                Register
              </Link>
              <a href="#about" className="hover:text-brand-green-dark transition-colors min-h-[44px] inline-flex items-center">
                About
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
