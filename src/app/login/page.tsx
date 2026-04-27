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
        localStorage.setItem('tkmfood_user', JSON.stringify(data.user));
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center font-sans">
      <div className="w-full max-w-sm mx-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <span className="text-3xl">🍽</span>
          </div>
          <h1 className="text-3xl font-black text-white">TKM<span className="text-amber-500">FOOD</span></h1>
          <p className="text-slate-500 text-sm mt-1">Staff Login</p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0,1,2,3,4,5].map(i => (
            <div key={i} className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-2xl font-black transition-all ${i < pin.length ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-800 border-slate-700 text-slate-600'}`}>
              {i < pin.length ? '●' : ''}
            </div>
          ))}
        </div>

        {error && <p className="text-center text-red-400 text-sm font-bold mb-4">{error}</p>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {digits.map((d, i) => d === '' ? <div key={i}/> : (
            <button key={i} onClick={() => d === '⌫' ? handleDelete() : handleDigit(d)}
              className={`h-16 rounded-2xl font-bold text-xl transition-all active:scale-95 ${d === '⌫' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}>
              {d}
            </button>
          ))}
        </div>

        <button onClick={handleLogin} disabled={loading || pin.length < 4}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 text-black font-black text-lg rounded-2xl transition-all shadow-lg shadow-amber-500/30 disabled:shadow-none active:scale-95">
          {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
        </button>

        <a href="/" className="block text-center text-slate-600 text-sm mt-4 hover:text-slate-400">← กลับหน้าเมนูลูกค้า</a>
      </div>
    </div>
  );
}
