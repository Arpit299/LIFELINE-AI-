import React, { useState } from 'react';
import { useTaskStore } from '../store/taskStore';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../lib/auth';
import { Input } from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Sparkles, Shield, UserCheck, KeyRound, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { setDemoMode } = useTaskStore();
  
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const user = await registerWithEmail(email, password);
        if (user) {
          toast.success('Registration successful!');
          setDemoMode(false);
          onLoginSuccess({
            uid: user.uid,
            email: user.email,
            displayName: 'Developer Node',
            isDemo: false
          });
        }
      } else {
        const user = await loginWithEmail(email, password);
        if (user) {
          toast.success('Login successful!');
          setDemoMode(false);
          onLoginSuccess({
            uid: user.uid,
            email: user.email,
            displayName: 'Developer Node',
            isDemo: false
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed.');
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        toast.success('Successfully authenticated with Google!');
        setDemoMode(false);
        onLoginSuccess({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Developer Node',
          photoURL: user.photoURL || null,
          isDemo: false
        });
      }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
      toast.error(err.message || 'Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = () => {
    setDemoMode(true);
    toast.success('Entering sandboxed environment in Guest Mode!');
    onLoginSuccess({
      uid: 'demo-user',
      email: 'guest@vibe2ship.dev',
      displayName: 'Guest Mode',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      isDemo: true
    });
  };

  return (
    <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Visual glowing backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-3 mb-8 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40 animate-pulse">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white tracking-widest font-sans">LIFELINE AI</h1>
          <span className="text-4xs text-white/40 font-mono tracking-widest uppercase font-bold mt-1">
            Urgency & Deadline Intelligence Engine
          </span>
        </div>
      </div>

      {/* Auth Card */}
      <Card className="w-full max-w-md p-6 relative z-10 flex flex-col gap-6">
        <div className="flex flex-col text-center gap-1.5">
          <h2 className="text-base font-bold text-white/95">Access Command Operations</h2>
          <p className="text-2xs text-white/40 leading-relaxed">
            Synchronize tasks across nodes or enter the sandboxed Guest Mode.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Authentication and Divider */}
        <div className="flex flex-col gap-4">
          <Button 
            variant="secondary" 
            size="md" 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full font-bold flex items-center justify-center gap-2.5 border-white/10 hover:bg-white/[0.05]"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.85 2.69-6.57z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.47-.8 5.96-2.2l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.94v2.32C2.42 15.44 5.43 18 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.95 10.72A5.4 5.4 0 0 1 3.75 9c0-.6.1-1.18.27-1.72V4.96H.94A8.99 8.99 0 0 0 0 9c0 1.45.35 2.82.97 4.04l3-2.32z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4A9 9 0 0 0 .94 4.96l3 2.32C4.66 5.16 6.65 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 my-1">
            <div className="h-px bg-white/5 flex-grow" />
            <span className="text-4xs uppercase tracking-widest text-white/30 font-bold font-mono">or email node</span>
            <div className="h-px bg-white/5 flex-grow" />
          </div>
        </div>

        <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
          <Input 
            type="email" 
            label="Security Node Email" 
            placeholder="e.g., node@vibe2ship.dev" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <Input 
            type="password" 
            label="Passphrase Access Key" 
            placeholder="Enter secure password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />

          <Button variant="primary" size="md" type="submit" loading={loading} className="w-full mt-2 font-semibold">
            {isRegister ? 'Register Node' : 'Initialize Command Login'}
          </Button>
        </form>

        <div className="flex items-center justify-between text-2xs text-white/40">
          <button 
            type="button" 
            onClick={() => setIsRegister(!isRegister)} 
            className="hover:text-white transition-colors cursor-pointer"
          >
            {isRegister ? 'Already have a node? Login' : 'Need a new node? Create account'}
          </button>
        </div>

        {/* Big Guest Mode Entrance Button */}
        <div className="border-t border-white/5 pt-5 flex flex-col gap-3">
          <span className="text-4xs uppercase tracking-widest text-center text-white/30 font-bold font-mono">
            Instant Sandbox
          </span>
          <Button 
            variant="secondary" 
            size="md" 
            type="button" 
            onClick={handleSandboxLogin}
            className="w-full font-bold flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4.5 h-4.5" />
            Enter Guest Mode
          </Button>
          <span className="text-4xs text-center text-white/30">
            *No registration, credentials, or API keys needed. Fully configured.
          </span>
        </div>
      </Card>
    </div>
  );
};
export default Login;
