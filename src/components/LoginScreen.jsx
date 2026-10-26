import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  KeyRound, 
  Sparkles,
  Sun,
  Moon,
  Flame,
  Trophy
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

// Valid credentials provided by campus administrator
const VALID_USERNAME = 'sems_campus';
const VALID_PASSWORD = 'Sems#1234';

export default function LoginScreen({ onLoginSuccess }) {
  const { isDark, toggleTheme } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Rate limiting / Brute force prevention (Login limit)
  const [failedAttempts, setFailedAttempts] = useState(() => {
    const saved = localStorage.getItem('sems_failed_attempts');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lockoutTimer, setLockoutTimer] = useState(() => {
    const lockUntil = localStorage.getItem('sems_lockout_until');
    if (lockUntil) {
      const remaining = Math.ceil((parseInt(lockUntil, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    return 0;
  });

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer(prev => {
        if (prev <= 1) {
          localStorage.removeItem('sems_lockout_until');
          localStorage.setItem('sems_failed_attempts', '0');
          setFailedAttempts(0);
          setErrorMsg('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    setErrorMsg('');
    setIsAuthenticating(true);

    // Subtle micro-delay for security audit & natural feel
    await new Promise(r => setTimeout(r, 400));

    const trimmedUser = username.trim();
    const cleanPass = password;

    // Check credentials
    if (trimmedUser === VALID_USERNAME && cleanPass === VALID_PASSWORD) {
      // Reset rate-limit counter on success
      localStorage.setItem('sems_failed_attempts', '0');
      localStorage.removeItem('sems_lockout_until');

      const authData = {
        username: VALID_USERNAME,
        role: 'Sports Coordinator & Hostel Warden',
        loginTime: new Date().toISOString(),
        token: `token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      };

      if (rememberMe) {
        localStorage.setItem('sems_auth_user', JSON.stringify(authData));
      } else {
        sessionStorage.setItem('sems_auth_user', JSON.stringify(authData));
      }

      setIsAuthenticating(false);
      onLoginSuccess(authData);
    } else {
      setIsAuthenticating(false);
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      localStorage.setItem('sems_failed_attempts', nextFailed.toString());

      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (nextFailed >= MAX_FAILED_ATTEMPTS) {
        const unlockTime = Date.now() + (LOCKOUT_SECONDS * 1000);
        localStorage.setItem('sems_lockout_until', unlockTime.toString());
        setLockoutTimer(LOCKOUT_SECONDS);
        setErrorMsg(`Too many failed attempts! Login locked for ${LOCKOUT_SECONDS} seconds for security.`);
      } else {
        const remainingAttempts = MAX_FAILED_ATTEMPTS - nextFailed;
        setErrorMsg(`Invalid username or password. (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)`);
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-[#020617] via-[#091124] to-[#020617] text-slate-100 relative overflow-hidden select-none">
      
      {/* Ambient Glows (Royal Purple and APEX Gold) */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7156a5]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#d2ab45]/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Subtle Grid Lines Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#d2ab45 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Theme Toggle in top right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/10 hover:bg-white/20 text-slate-200 border border-white/15 transition-all cursor-pointer backdrop-blur-md"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-amber-300" />
          )}
        </button>
      </div>

      {/* Main Login Card with mpgisports.in Gold & Obsidian styling */}
      <div 
        className={`w-full max-w-md bg-[#0b1329]/85 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative z-10 transition-transform ${
          isShaking ? 'animate-bounce' : ''
        }`}
      >
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3.5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#020617] to-[#131d36] flex items-center justify-center p-3 shadow-xl border border-amber-500/40 relative">
              <img 
                src="/apex-logo.png" 
                alt="MPGI APEX Sports Fest" 
                className="w-full h-auto object-contain drop-shadow-[0_2px_12px_rgba(210,171,69,0.5)]"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center border-2 border-[#020617] font-bold shadow-md" title="Security Verified">
              <Lock className="w-3 h-3 stroke-[2.5]" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
            <Flame className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>APEX CHAMPIONSHIP 2026</span>
          </div>

          <h1 className="font-brand text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#d2ab45] to-amber-400 tracking-wide">
            MPGI SPORTS FEST
          </h1>
          <p className="text-xs text-[#b8a5e5] font-semibold mt-1">
            Hostel Sports Attendance & Equipment Desk
          </p>
          <span className="text-[11px] text-slate-400 mt-1">
            Sign in with authorized campus credentials
          </span>
        </div>

        {/* Lockout Notification Banner */}
        {lockoutTimer > 0 ? (
          <div className="mb-5 bg-rose-500/20 border border-rose-500/40 p-4 rounded-2xl text-xs flex items-start gap-2.5 text-rose-200 animate-pulse">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block text-rose-300 text-sm">Security Lockout Active</strong>
              <span>Maximum login attempts exceeded. Please wait </span>
              <strong className="text-white font-mono text-sm">{lockoutTimer}s</strong>
              <span> before trying again.</span>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="mb-5 bg-rose-500/15 border border-rose-500/30 p-3 rounded-2xl text-xs flex items-center gap-2 text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Username */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                <span>Authorized Username</span>
              </span>
              <span className="text-[10px] text-slate-400">e.g. sems_campus</span>
            </label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                required
                disabled={lockoutTimer > 0}
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-amber-500/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-slate-100 placeholder:text-slate-500 text-sm outline-none transition-all disabled:opacity-50"
              />
              <User className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Security Password</span>
              </span>
              <span className="text-[10px] text-slate-400">Campus Access Key</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={lockoutTimer > 0}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/80 border border-amber-500/20 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 text-slate-100 placeholder:text-slate-500 text-sm outline-none transition-all disabled:opacity-50"
              />
              <Lock className="w-4 h-4 text-amber-400/60 absolute left-3.5 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-3 p-1 text-slate-400 hover:text-amber-400 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Policy */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-800 border-slate-700 focus:ring-amber-500"
              />
              <span>Keep me signed in</span>
            </label>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>TLS Protected</span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAuthenticating || lockoutTimer > 0}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-[#d2ab45] to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-98 shadow-xl shadow-amber-500/30 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            {isAuthenticating ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : lockoutTimer > 0 ? (
              <span>Locked ({lockoutTimer}s)</span>
            ) : (
              <>
                <span>Sign In to Sports Portal</span>
                <Sparkles className="w-4 h-4 text-slate-950" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Official MPGI Sports Authority • mpgisports.in</span>
        </div>

      </div>

    </div>
  );
}
