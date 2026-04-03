import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Fingerprint, 
  Terminal, 
  Activity, 
  Database, 
  Cpu, 
  AlertTriangle,
  Zap,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../../lib/utils';

export const GhostVault: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matrixText, setMatrixText] = useState<string[]>([]);

  // Matrix-like background effect
  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?";
    const interval = setInterval(() => {
      const newLines = Array.from({ length: 15 }, () => 
        Array.from({ length: 40 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
      );
      setMatrixText(newLines);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphrase) return;

    setIsAuthenticating(true);
    setError(null);

    // Simulate high-end decryption
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (passphrase.toLowerCase() === 'ghost' || passphrase.toLowerCase() === 'admin' || passphrase.length > 3) {
      setIsUnlocked(true);
    } else {
      setError('ACCESS DENIED: INVALID PASSPHRASE');
    }
    setIsAuthenticating(false);
  };

  if (!isUnlocked) {
    return (
      <div className="h-full bg-black flex flex-col items-center justify-center relative overflow-hidden font-mono">
        {/* Matrix Background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden">
          {matrixText.map((line, i) => (
            <div key={i} className="text-[10px] text-emerald-500 whitespace-nowrap leading-none">{line}</div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="z-10 w-full max-w-sm p-8 flex flex-col items-center text-center"
        >
          <div className="w-20 h-20 rounded-full border-2 border-emerald-500/30 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20" />
            <Shield className="w-10 h-10 text-emerald-500" />
          </div>

          <h1 className="text-2xl font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Ghost Vault</h1>
          <p className="text-[10px] text-emerald-500/60 uppercase tracking-widest mb-8">World's Best Data Protection System</p>

          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div className="relative">
              <input 
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="ENTER PASSPHRASE"
                className="w-full bg-emerald-950/20 border-b-2 border-emerald-500/30 focus:border-emerald-500 py-3 px-4 text-emerald-500 text-center outline-none transition-all placeholder:text-emerald-900"
                autoFocus
              />
              <button 
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-emerald-500/40 hover:text-emerald-500"
              >
                {showPassphrase ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button 
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-4 bg-emerald-500 text-black font-black uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isAuthenticating ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>Decrypting...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Authorize Access</span>
                </>
              )}
            </button>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-3 border border-red-500/30 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 flex items-center gap-6 opacity-30">
            <div className="flex flex-col items-center gap-1">
              <Fingerprint className="w-4 h-4 text-emerald-500" />
              <span className="text-[8px] uppercase tracking-tighter">Biometric Ready</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="text-[8px] uppercase tracking-tighter">Quantum Encrypted</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Globe className="w-4 h-4 text-emerald-500" />
              <span className="text-[8px] uppercase tracking-tighter">Global Node Sync</span>
            </div>
          </div>
        </motion.div>

        {/* Corner Accents */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-500/20" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-500/20" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-500/20" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-500/20" />
      </div>
    );
  }

  return (
    <div className="h-full bg-[#050505] text-emerald-500 font-mono flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 border-b border-emerald-500/20 flex items-center justify-between px-6 bg-black">
        <div className="flex items-center gap-4">
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ghost Vault // Secure Session Active</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-widest opacity-60">System Online</span>
          </div>
          <button 
            onClick={() => setIsUnlocked(false)}
            className="text-[9px] uppercase tracking-widest hover:text-white transition-colors border border-emerald-500/30 px-2 py-1 rounded"
          >
            Terminate Session
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Stats */}
        <div className="w-64 border-r border-emerald-500/10 p-6 space-y-8 bg-black/40">
          <section>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">System Integrity</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase">
                  <span>Encryption Strength</span>
                  <span>4096-bit</span>
                </div>
                <div className="h-1 bg-emerald-950 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase">
                  <span>Node Connectivity</span>
                  <span>99.9%</span>
                </div>
                <div className="h-1 bg-emerald-950 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '99%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 mb-4">Active Threats</h3>
            <div className="p-3 border border-emerald-500/10 bg-emerald-500/5 rounded space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>Zero Threats Detected</span>
              </div>
              <p className="text-[8px] opacity-40 leading-relaxed uppercase">
                Ghost Shield is actively monitoring incoming traffic from 14 global nodes.
              </p>
            </div>
          </section>

          <section className="flex-1 flex flex-col justify-end">
            <div className="p-4 border border-emerald-500/20 rounded bg-emerald-950/10">
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase">Quantum Core</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <motion.div 
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                    className="w-1 bg-emerald-500/40 rounded-full"
                  />
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Main Content - Files/Vault */}
        <div className="flex-1 flex flex-col bg-[#080808]">
          <div className="p-8 border-b border-emerald-500/10">
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Secure Repository</h2>
            <p className="text-xs opacity-40 uppercase tracking-widest">Encrypted storage for high-value digital assets</p>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'GHOST_PROTOCOL.PDF', size: '2.4 MB', date: '2026.03.15', type: 'ENCRYPTED_DOC' },
                { name: 'NODE_KEYS.RSA', size: '12 KB', date: '2026.03.20', type: 'SECURITY_KEY' },
                { name: 'SHADOW_ASSETS.DB', size: '142 MB', date: '2026.03.28', type: 'DATABASE' },
                { name: 'IDENTITY_MASK.VLT', size: '4.1 MB', date: '2026.03.30', type: 'VAULT_FILE' },
                { name: 'GLOBAL_MAP.SVG', size: '840 KB', date: '2026.03.31', type: 'VECTOR_DATA' },
              ].map((file, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-4 border border-emerald-500/10 bg-black hover:border-emerald-500/40 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/5 flex items-center justify-center">
                    <Lock className="w-3 h-3 opacity-20 group-hover:opacity-100 group-hover:text-emerald-500 transition-all" />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                      <Database className="w-5 h-5 opacity-40" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold tracking-tight">{file.name}</span>
                      <span className="text-[8px] opacity-40 uppercase tracking-widest">{file.type}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[9px] opacity-40 uppercase tracking-widest">
                    <span>{file.size}</span>
                    <span>{file.date}</span>
                  </div>
                </motion.div>
              ))}

              <button className="p-4 border border-dashed border-emerald-500/20 rounded flex flex-col items-center justify-center gap-3 opacity-40 hover:opacity-100 hover:border-emerald-500/40 transition-all group">
                <div className="w-10 h-10 rounded-full border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/10 transition-all">
                  <Terminal className="w-4 h-4" />
                </div>
                <span className="text-[10px] uppercase tracking-widest">Upload Secure Asset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
