import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, showToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password, confirmPassword);
    setIsSubmitting(false);

    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-finBackground flex items-center justify-center p-4">
      {/* Background neon blur graphics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-finGreen/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand logo header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded bg-finGreen flex items-center justify-center font-black text-black text-xl mb-3 shadow-lg shadow-finGreen/20">
            FS
          </div>
          <h2 className="text-2xl font-extrabold text-finText uppercase tracking-wider">
            Fin<span className="text-finGreen">Serve</span>
          </h2>
          <p className="text-xs text-finMuted mt-1">Your AI-Powered Personal CFO</p>
        </div>

        {/* Register Panel */}
        <div className="glass-panel rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-finGreen to-transparent" />
          
          <h3 className="text-xl font-bold text-finText mb-1">Create Account</h3>
          <p className="text-xs text-finMuted mb-6">Set up your profile to start tracking your finances.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-finText uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-finMuted" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-finBackground border border-finBorder rounded-lg text-sm text-finText placeholder-finMuted focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-finText uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-finMuted" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-finBackground border border-finBorder rounded-lg text-sm text-finText placeholder-finMuted focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-finText uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-finMuted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-finBackground border border-finBorder rounded-lg text-sm text-finText placeholder-finMuted focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-finText uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-finMuted" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-finBackground border border-finBorder rounded-lg text-sm text-finText placeholder-finMuted focus:outline-none focus:border-finGreen focus:ring-1 focus:ring-finGreen transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 mt-6 py-3.5 rounded-lg bg-finGreen hover:bg-finGreenHover text-black font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-lg shadow-finGreen/10 hover:shadow-finGreen/25 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Switch page link */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-finMuted">
              Already have an account?{' '}
              <Link to="/" className="text-finGreen font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
