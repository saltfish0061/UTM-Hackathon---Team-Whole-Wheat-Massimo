import { useState } from 'react';
import { Leaf, Mail, Lock, User as UserIcon, ArrowRight, UserCircle2 } from 'lucide-react';
import { useAppContext, type User } from '../context/AppContext';

type Mode = 'login' | 'register';

export function AuthPage() {
  const { login } = useAppContext();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function validateEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validateEmail(email)) return setError('Please enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (mode === 'register') {
      if (!name.trim()) return setError('Please enter your name.');
      if (password !== confirm) return setError('Passwords do not match.');
    }

    setBusy(true);
    setTimeout(() => {
      const derivedName =
        mode === 'register' ? name.trim() : email.split('@')[0].replace(/[._]/g, ' ');
      const newUser: User = {
        name: derivedName.charAt(0).toUpperCase() + derivedName.slice(1),
        email: email.trim().toLowerCase(),
        isGuest: false,
        joinedAt: new Date().toISOString(),
      };
      login(newUser);
    }, 600);
  }

  function continueAsGuest() {
    const guest: User = {
      name: 'Guest User',
      email: 'guest@greenstack.app',
      isGuest: true,
      joinedAt: new Date().toISOString(),
    };
    login(guest);
  }

  return (
    <div className="size-full bg-gray-50 overflow-y-auto">
      <div className="max-w-md mx-auto min-h-full flex flex-col px-6 py-10">
        {/* Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Leaf size={30} color="white" />
          </div>
          <h1 className="text-gray-900">GreenStack</h1>
          <p className="text-gray-500 text-sm mt-1">
            Vertical farming, simplified.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="bg-gray-100 rounded-xl p-1 flex mb-6">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-colors text-sm ${
              mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Sign in
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-lg transition-colors text-sm ${
              mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-3"
        >
          {mode === 'register' && (
            <Field
              icon={<UserIcon size={16} className="text-gray-400" />}
              type="text"
              placeholder="Username"
              value={name}
              onChange={setName}
              autoComplete="name"
            />
          )}
          <Field
            icon={<Mail size={16} className="text-gray-400" />}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <Field
            icon={<Lock size={16} className="text-gray-400" />}
            type="password"
            placeholder="Password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
          {mode === 'register' && (
            <Field
              icon={<Lock size={16} className="text-gray-400" />}
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={setConfirm}
              autoComplete="new-password"
            />
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {busy ? 'Please wait…' : (
              <>
                {mode === 'login' ? 'Sign in' : 'Create account'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-xs uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Guest */}
        <button
          onClick={continueAsGuest}
          className="w-full py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-2 text-gray-700 transition-colors"
        >
          <UserCircle2 size={18} className="text-gray-500" />
          Continue as guest
        </button>

        <p className="text-gray-400 text-xs text-center mt-6 leading-relaxed">
          By continuing you agree to GreenStack's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus-within:border-gray-400 transition-colors">
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
      />
    </div>
  );
}
