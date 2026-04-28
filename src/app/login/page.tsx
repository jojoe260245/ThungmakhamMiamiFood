"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDigit = (d: string) => { if (pin.length < 6) setPin(pin + d); setError(""); };
  const handleDelete = () => setPin(pin.slice(0, -1));

  const handleLogin = async () => {
    if (pin.length < 4) { setError("กรุณากรอก PIN อย่างน้อย 4 หลัก"); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin }) });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('thungmakhammiamifood_user', JSON.stringify(data.user));
        const role = data.user.role.toLowerCase();
        if (role === 'admin') router.push('/admin');
        else if (role === 'cashier') router.push('/cashier');
        else if (role === 'kitchen') router.push('/kitchen');
        else if (role === 'bar') router.push('/bar');
        else router.push('/cashier');
      } else { setError(data.error || "PIN ไม่ถูกต้อง"); setPin(""); }
    } catch { setError("เชื่อมต่อไม่ได้"); }
    setLoading(false);
  };

  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/20 rounded-full blur-[100px] animate-float"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-float delay-200"></div>

      <div className="w-full max-w-sm mx-4 relative z-10 glass-panel-dark rounded-[2rem] p-8 animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/30 animate-scale-in">
            <span className="text-4xl text-white drop-shadow-md">🍽</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">ThungmakhamMiami<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Food</span></h1>
          <p className="text-slate-400 text-sm mt-1 font-medium">Staff Portal</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`w-12 h-14 rounded-2xl border flex items-center justify-center text-2xl font-black transition-all duration-300
              ${i < pin.length 
                ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-110' 
                : 'glass-pill text-transparent'}`}>
              {i < pin.length ? '●' : ''}
            </div>
          ))}
        </div>

        {error && <p className="text-center text-red-400 text-sm font-bold mb-4 animate-scale-in">{error}</p>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {digits.map((d, i) => d === '' ? <div key={i}/> : (
            <button key={i} onClick={() => d === '⌫' ? handleDelete() : handleDigit(d)}
              className={`h-16 rounded-2xl font-bold text-xl transition-all active:scale-90
              ${d === '⌫' 
                ? 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-slate-700/50' 
                : 'glass-pill text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'}`}>
              {d}
            </button>
          ))}
        </div>

        <button onClick={handleLogin} disabled={loading || pin.length < 4}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-amber-500/30 disabled:shadow-none active:scale-95">
          {loading ? 'Authenticating...' : 'Sign In'}
        </button>

        <a href="/" className="block text-center text-slate-500 text-sm mt-6 hover:text-amber-400 transition-colors">← Return to Customer Menu</a>
      </div>
    </div>
  );
}
